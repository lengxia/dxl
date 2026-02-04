<template>
  <view class="dxl-plan-detail tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="返回" fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class="tn-custom-nav-bar__back" @click="goBack">
        <text class="tn-icon-left tn-color-black"></text>
        <text class="tn-margin-left-xs tn-color-black">返回</text>
      </view>
      <view class="tn-custom-nav-bar__title tn-color-black">计划详情</view>
    </tn-nav-bar>

    <view class="tn-margin-top-xl" :style="{paddingTop: vuex_custom_bar_height + 'px'}" v-if="plan">
      <!-- 头部卡片 -->
      <view class="tn-padding tn-bg-white tn-margin-bottom-sm">
        <view class="tn-text-xl tn-text-bold">{{ plan.title }}</view>
        <view class="tn-flex tn-flex-row-between tn-margin-top-sm">
          <view class="tn-tag-content">
             <tn-tag shape="circle" backgroundColor="#E6E6E6" fontColor="#000000">{{ plan.year_month }}</tn-tag>
          </view>
          <view class="tn-color-gray">{{ statusText(plan.status) }}</view>
        </view>
      </view>

      <!-- 目标列表 -->
      <view class="tn-padding-left tn-padding-right">
        <view v-for="(goal, index) in plan.goals" :key="index" class="tn-bg-white tn-radius tn-shadow-sm tn-margin-bottom tn-padding">
          <view class="tn-flex tn-flex-row-between tn-flex-col-center tn-margin-bottom-sm">
            <view class="tn-text-lg tn-text-bold">
              <tn-tag :backgroundColor="cateColor(goal.category)" fontColor="#FFFFFF" size="sm" shape="radius" class="tn-margin-right-xs">{{ goal.category }}</tn-tag>
              {{ goal.content }}
            </view>
            <view class="tn-text-sm tn-color-gray">{{ goal.completed_days }} / {{ goal.target_days }} 天</view>
          </view>
          
          <tn-line-progress :percent="calculateProgress(goal)" :showPercent="true" :round="true" activeColor="#01BEFF"></tn-line-progress>
          
          <view class="tn-flex tn-flex-row-right tn-margin-top">
             <tn-button size="sm" backgroundColor="#01BEFF" fontColor="#FFFFFF" @click="incrementProgress(index)" :disabled="goal.completed_days >= goal.target_days">
               <text class="tn-icon-success"></text> 打卡+1
             </tn-button>
          </view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="tn-padding tn-margin-top-xl">
        <tn-button backgroundColor="#FF4444" fontColor="#FFFFFF" width="100%" @click="deletePlan">删除计划</tn-button>
      </view>
    </view>
    
    <tn-load-more v-else status="loading"></tn-load-more>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        id: '',
        plan: null
      }
    },
    onLoad(options) {
      if (options.id) {
        this.id = options.id;
        this.loadData();
      }
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      async loadData() {
        const db = uniCloud.database();
        try {
          const res = await db.collection('monthly_plans').doc(this.id).get();
          if (res.result.data && res.result.data.length > 0) {
            this.plan = res.result.data[0];
          }
        } catch (e) {
          console.error(e);
        }
      },
      statusText(status) {
        const map = { planning: '计划中', in_progress: '进行中', completed: '已完成' };
        return map[status] || status;
      },
      cateColor(cate) {
        const map = { '修身': '#FF7043', '修心': '#42A5F5', '处世': '#66BB6A', '治业': '#AB47BC' };
        return map[cate] || '#AAAAAA';
      },
      calculateProgress(goal) {
        if (!goal.target_days) return 0;
        const p = Math.round((goal.completed_days / goal.target_days) * 100);
        return p > 100 ? 100 : p;
      },
      async incrementProgress(index) {
        const goal = this.plan.goals[index];
        if (goal.completed_days >= goal.target_days) return;
        
        goal.completed_days++;
        
        // 更新数据库
        const db = uniCloud.database();
        try {
          await db.collection('monthly_plans').doc(this.id).update({
            goals: this.plan.goals,
            update_time: db.command.set(Date.now())
          });
          uni.showToast({ title: '打卡成功', icon: 'success' });
        } catch (e) {
          goal.completed_days--; // 回滚
          uni.showToast({ title: '操作失败', icon: 'none' });
        }
      },
      deletePlan() {
        uni.showModal({
          title: '提示',
          content: '确定要删除这个计划吗？',
          success: async (res) => {
            if (res.confirm) {
              const db = uniCloud.database();
              await db.collection('monthly_plans').doc(this.id).remove();
              uni.navigateBack();
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dxl-plan-detail {
    min-height: 100vh;
    background-color: #F8F8F8;
  }
  .tn-custom-nav-bar__back {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>