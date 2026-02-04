<template>
  <view class="dxl-daily-index tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="返回" fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class="tn-custom-nav-bar__back" @click="goBack">
        <text class="tn-icon-left tn-color-black"></text>
        <text class="tn-margin-left-xs tn-color-black">返回</text>
      </view>
      <view class="tn-custom-nav-bar__title tn-color-black">每日功课</view>
    </tn-nav-bar>

    <view class="tn-margin-top-xl" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      <!-- 头部统计 -->
      <view class="tn-flex tn-flex-row-around tn-padding tn-bg-white tn-margin-bottom-sm">
        <view class="tn-flex tn-flex-direction-column tn-flex-col-center">
          <view class="tn-text-xl tn-text-bold tn-color-blue">{{ stats.continuous_days }}</view>
          <view class="tn-text-xs tn-color-gray tn-margin-top-xs">连续修持(天)</view>
        </view>
        <view class="tn-flex tn-flex-direction-column tn-flex-col-center">
          <view class="tn-text-xl tn-text-bold tn-color-orange">{{ stats.total_score }}</view>
          <view class="tn-text-xs tn-color-gray tn-margin-top-xs">累计功德分</view>
        </view>
        <view class="tn-flex tn-flex-direction-column tn-flex-col-center">
          <view class="tn-text-xl tn-text-bold tn-color-green">{{ stats.level }}</view>
          <view class="tn-text-xs tn-color-gray tn-margin-top-xs">修行等级</view>
        </view>
      </view>

      <!-- 日历打卡视图 -->
      <view class="tn-padding-sm">
        <tn-calendar 
          :show="true" 
          mode="date"
          :activeBgColor="'#01BEFF'"
          :popup="false"
          :changeYear="false"
          :changeMonth="true"
        ></tn-calendar>
        <!-- 注意：这里暂时使用 tn-calendar 占位，实际需要自定义打卡点的展示逻辑，或者使用 calendar 组件的打点 api -->
      </view>

      <!-- 今日功课卡片 -->
      <view class="tn-padding">
        <view class="tn-bg-white tn-radius tn-shadow-sm tn-padding">
          <view class="tn-flex tn-flex-row-between tn-flex-col-center">
            <view class="tn-text-lg tn-text-bold">今日功课 ({{ todayStr }})</view>
            <tn-tag :backgroundColor="todayTask ? '#00D65F' : '#E6E6E6'" shape="circle" size="sm">
              {{ todayTask ? '已完成' : '未完成' }}
            </tn-tag>
          </view>
          
          <view v-if="!todayTask" class="tn-margin-top tn-flex tn-flex-col-center tn-flex-row-center" style="height: 200rpx;">
            <tn-button shape="round" backgroundColor="#01BEFF" fontColor="#FFFFFF" width="200rpx" @click="goCheck">
              开始打卡
            </tn-button>
          </view>
          
          <view v-else class="tn-margin-top">
            <view class="tn-flex tn-flex-row-between tn-margin-bottom-sm">
              <text class="tn-color-gray">功过格得分</text>
              <text class="tn-text-xl tn-text-bold tn-color-blue">{{ todayTask.total_score }}分</text>
            </view>
            
            <view class="tn-bg-gray--light tn-padding-sm tn-radius">
               <view class="tn-text-bold tn-margin-bottom-xs">心念检视</view>
               <view class="tn-flex tn-flex-wrap">
                 <view v-if="todayTask.mind_check.anxiety" class="tn-margin-right-sm tn-color-red">焦躁</view>
                 <view v-if="todayTask.mind_check.greed" class="tn-margin-right-sm tn-color-red">贪欲</view>
                 <view v-if="todayTask.mind_check.arrogance" class="tn-margin-right-sm tn-color-red">傲慢</view>
                 <view v-if="todayTask.mind_check.anger" class="tn-margin-right-sm tn-color-red">嗔怒</view>
                 <view v-if="!isHasMindIssues(todayTask.mind_check)" class="tn-color-green">心如止水，善哉！</view>
               </view>
            </view>

            <view class="tn-margin-top tn-flex tn-flex-row-right">
               <tn-button plain size="sm" backgroundColor="#01BEFF" fontColor="#01BEFF" @click="goCheck">修改记录</tn-button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        todayStr: '',
        todayTask: null,
        stats: {
          continuous_days: 0,
          total_score: 0,
          level: 1
        }
      }
    },
    onShow() {
      const now = new Date();
      this.todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      this.loadData();
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      goCheck() {
        uni.navigateTo({
          url: '/pages/daily/check'
        });
      },
      isHasMindIssues(mind) {
        return mind.anxiety || mind.greed || mind.arrogance || mind.anger;
      },
      async loadData() {
        const db = uniCloud.database();
        const uid = uniCloud.getCurrentUserInfo().uid; // 需要确保已登录
        
        // 1. 获取今日打卡
        try {
          const res = await db.collection('daily_tasks')
            .where(`date == "${this.todayStr}" && user_id == $cloudEnv_uid`)
            .get();
          
          if (res.result.data.length > 0) {
            this.todayTask = res.result.data[0];
          } else {
            this.todayTask = null;
          }
        } catch (e) {
          console.error(e);
        }

        // 2. 获取用户统计信息 (实际应从 uni-id-users 读取 dao_profile)
        // 这里模拟一下
        try {
           const userRes = await db.collection('uni-id-users').where('_id == $cloudEnv_uid').field('dao_profile').get();
           if(userRes.result.data.length > 0 && userRes.result.data[0].dao_profile) {
             const profile = userRes.result.data[0].dao_profile;
             this.stats = {
               continuous_days: profile.continuous_days || 0,
               total_score: profile.total_merit || 0,
               level: profile.level || 1
             };
           }
        } catch(e) {
          console.error(e);
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dxl-daily-index {
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