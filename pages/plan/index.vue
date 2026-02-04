<template>
  <view class="dxl-plan-index tn-safe-area-inset-bottom">
    <!-- 顶部导航栏 -->
    <tn-nav-bar :isBack="true" backTitle="返回" fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class="tn-custom-nav-bar__back" @click="goBack">
        <text class="tn-icon-left tn-color-black"></text>
        <text class="tn-margin-left-xs tn-color-black">返回</text>
      </view>
      <view class="tn-custom-nav-bar__title tn-color-black">月度计划</view>
    </tn-nav-bar>

    <view class="tn-margin-top-xl" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      <!-- 月份切换与统计 -->
      <view class="tn-flex tn-flex-row-between tn-flex-col-center tn-padding">
        <view class="tn-flex tn-flex-col-center" @click="showCalendar = true">
          <text class="tn-text-xl tn-text-bold">{{ currentYear }}年{{ currentMonth }}月</text>
          <text class="tn-icon-down tn-margin-left-xs"></text>
        </view>
        <view class="tn-text-sm tn-color-gray">
          总进度 {{ progress }}%
        </view>
      </view>

      <!-- 计划列表 -->
      <view class="tn-padding-left tn-padding-right tn-padding-bottom">
        <block v-if="plans.length > 0">
          <view v-for="(item, index) in plans" :key="index" class="tn-margin-bottom tn-bg-white tn-radius tn-shadow-sm" @click="goDetail(item._id)">
            <view class="tn-padding">
              <view class="tn-flex tn-flex-row-between tn-flex-col-center">
                <view class="tn-text-lg tn-text-bold">{{ item.title }}</view>
                <tn-tag :backgroundColor="statusColor(item.status)" shape="circle" size="sm">{{ statusText(item.status) }}</tn-tag>
              </view>
              <view class="tn-margin-top-sm tn-color-gray tn-text-sm tn-text-ellipsis-2">
                {{ getGoalsSummary(item.goals) }}
              </view>
              
              <!-- 分类进度条 -->
              <view class="tn-margin-top">
                <view class="tn-flex tn-flex-row-between tn-text-xs tn-color-gray tn-margin-bottom-xs">
                  <text>完成度</text>
                  <text>{{ calculateProgress(item.goals) }}%</text>
                </view>
                <tn-line-progress :percent="calculateProgress(item.goals)" :showPercent="false" :round="true" activeColor="#01BEFF"></tn-line-progress>
              </view>
            </view>
          </view>
        </block>
        <tn-empty v-else mode="data" text="本月暂无计划"></tn-empty>
      </view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="tn-fab-class">
      <tn-button backgroundColor="#01BEFF" fontColor="#FFFFFF" shape="circle" shadow width="100rpx" height="100rpx" @click="goCreate">
        <text class="tn-icon-add tn-text-xxl"></text>
      </tn-button>
    </view>
    
    <!-- 日历弹窗 -->
    <tn-calendar v-model="showCalendar" mode="date" :changeYear="true" :changeMonth="true" @change="onDateChange"></tn-calendar>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        showCalendar: false,
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1,
        plans: [],
        progress: 0
      }
    },
    onShow() {
      this.loadPlans();
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      goCreate() {
        uni.navigateTo({
          url: '/pages/plan/create'
        });
      },
      goDetail(id) {
        uni.navigateTo({
          url: '/pages/plan/detail?id=' + id
        });
      },
      onDateChange(e) {
        const date = new Date(e.result);
        this.currentYear = date.getFullYear();
        this.currentMonth = date.getMonth() + 1;
        this.loadPlans();
      },
      async loadPlans() {
        const db = uniCloud.database();
        const yearMonth = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}`;
        
        try {
          const res = await db.collection('monthly_plans')
            .where(`year_month == "${yearMonth}" && user_id == $cloudEnv_uid`)
            .get();
          
          this.plans = res.result.data;
          this.calculateTotalProgress();
        } catch (e) {
          console.error(e);
          // 这里可以加上 uni.showToast
        }
      },
      statusColor(status) {
        const map = {
          planning: '#E6E6E6',
          in_progress: '#01BEFF',
          completed: '#00D65F'
        };
        return map[status] || '#E6E6E6';
      },
      statusText(status) {
        const map = {
          planning: '计划中',
          in_progress: '进行中',
          completed: '已完成'
        };
        return map[status] || '未知';
      },
      getGoalsSummary(goals) {
        if (!goals || goals.length === 0) return '暂无目标';
        return goals.map(g => `[${g.category}] ${g.content}`).join('；');
      },
      calculateProgress(goals) {
        if (!goals || goals.length === 0) return 0;
        let total = 0;
        let completed = 0;
        goals.forEach(g => {
          total += g.target_days;
          completed += g.completed_days;
        });
        return total === 0 ? 0 : Math.round((completed / total) * 100);
      },
      calculateTotalProgress() {
        if (this.plans.length === 0) {
          this.progress = 0;
          return;
        }
        let totalPercent = 0;
        this.plans.forEach(p => {
          totalPercent += this.calculateProgress(p.goals);
        });
        this.progress = Math.round(totalPercent / this.plans.length);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dxl-plan-index {
    min-height: 100vh;
    background-color: #F8F8F8;
  }
  .tn-fab-class {
    position: fixed;
    bottom: 50rpx;
    right: 30rpx;
    z-index: 99;
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