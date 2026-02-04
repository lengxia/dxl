<template>
  <view class="index tn-safe-area-inset-bottom">
    <!-- 顶部自定义导航 -->
    <tn-nav-bar fixed :isBack="false" :bottomShadow="false" :backgroundColor="navBackgroundColor">
      <view class="custom-nav tn-flex tn-flex-col-center tn-flex-row-left" style="width: 100%; height: 100%;">
        <view class="custom-nav__text tn-text-bold tn-text-xxl tn-color-black tn-margin-left-xl" style="padding-top: 38rpx;">
          道心录
        </view>
      </view>
    </tn-nav-bar>
    
    <view class="tn-margin-top" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      
      <!-- 头部 Banner与格言 -->
      <view class="tn-margin tn-padding tn-radius" style="background: linear-gradient(135deg, #EBF4F5 0%, #F3F9F9 100%); position: relative; overflow: hidden;">
        <!-- 装饰背景圆 -->
        <view style="position: absolute; right: -30rpx; top: -30rpx; width: 200rpx; height: 200rpx; background: rgba(1, 190, 255, 0.1); border-radius: 50%;"></view>
        
        <view class="tn-flex tn-flex-direction-column">
          <view class="tn-text-xl tn-text-bold tn-color-black">
            {{ greeting }}
          </view>
          <view class="tn-margin-top tn-color-gray tn-text-lg" style="font-family: 'KaiTi', serif;">
            “{{ dailyQuote }}”
          </view>
        </view>
      </view>

      <!-- 修行数据概览 -->
      <view class="tn-flex tn-flex-row-between tn-margin-left tn-margin-right tn-margin-bottom tn-bg-white tn-radius tn-shadow-sm tn-padding">
        <view class="tn-flex-1 tn-text-center" @click="tn('/pages/daily/index')">
          <view class="tn-text-xxl tn-text-bold tn-color-blue">{{ stats.days }}</view>
          <view class="tn-text-xs tn-color-gray tn-margin-top-xs">修行天数</view>
        </view>
        <view class="tn-flex-1 tn-text-center" style="border-left: 1rpx solid #F0F0F0; border-right: 1rpx solid #F0F0F0;" @click="tn('/pages/diary/index')">
          <view class="tn-text-xxl tn-text-bold tn-color-orange">{{ stats.merit }}</view>
          <view class="tn-text-xs tn-color-gray tn-margin-top-xs">累计功德</view>
        </view>
        <view class="tn-flex-1 tn-text-center">
          <view class="tn-text-xxl tn-text-bold tn-color-green">{{ stats.level }}</view>
          <view class="tn-text-xs tn-color-gray tn-margin-top-xs">当前境界</view>
        </view>
      </view>

      <!-- 核心功能入口 -->
      <view class="tn-margin-top-lg">
        <view class="tn-text-bold tn-text-lg tn-margin-left tn-margin-bottom-sm">修行法门</view>
        
        <view class="tn-flex tn-flex-wrap tn-margin-left-sm tn-margin-right-sm">
          <!-- 每日功课 -->
          <view class="tn-flex-1 tn-padding-sm tn-margin-xs tn-bg-white tn-radius tn-shadow-sm" @click="tn('/pages/daily/index')">
            <view class="tn-flex tn-flex-col-center">
              <view class="icon-circle tn-bg-blue--light tn-color-blue">
                <view class="tn-icon-calendar-fill"></view>
              </view>
              <view class="tn-margin-left-sm">
                <view class="tn-text-bold">每日功课</view>
                <view class="tn-text-xs tn-color-gray tn-margin-top-xs">日省吾身</view>
              </view>
            </view>
          </view>
          
          <!-- 善行日记 -->
          <view class="tn-flex-1 tn-padding-sm tn-margin-xs tn-bg-white tn-radius tn-shadow-sm" @click="tn('/pages/diary/index')">
            <view class="tn-flex tn-flex-col-center">
              <view class="icon-circle tn-bg-orange--light tn-color-orange">
                <view class="tn-icon-star-fill"></view>
              </view>
              <view class="tn-margin-left-sm">
                <view class="tn-text-bold">善行日记</view>
                <view class="tn-text-xs tn-color-gray tn-margin-top-xs">积功累德</view>
              </view>
            </view>
          </view>
        </view>

        <view class="tn-flex tn-flex-wrap tn-margin-left-sm tn-margin-right-sm">
          <!-- 月度计划 -->
          <view class="tn-flex-1 tn-padding-sm tn-margin-xs tn-bg-white tn-radius tn-shadow-sm" @click="tn('/pages/plan/index')">
            <view class="tn-flex tn-flex-col-center">
              <view class="icon-circle tn-bg-purplered--light tn-color-purplered">
                <view class="tn-icon-flag-fill"></view>
              </view>
              <view class="tn-margin-left-sm">
                <view class="tn-text-bold">月度计划</view>
                <view class="tn-text-xs tn-color-gray tn-margin-top-xs">立志笃行</view>
              </view>
            </view>
          </view>
          
          <!-- 悟道札记 -->
          <view class="tn-flex-1 tn-padding-sm tn-margin-xs tn-bg-white tn-radius tn-shadow-sm" @click="tn('/pages/notes/index')">
            <view class="tn-flex tn-flex-col-center">
              <view class="icon-circle tn-bg-indigo--light tn-color-indigo">
                <view class="tn-icon-flower-fill"></view>
              </view>
              <view class="tn-margin-left-sm">
                <view class="tn-text-bold">悟道札记</view>
                <view class="tn-text-xs tn-color-gray tn-margin-top-xs">妙悟真心</view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 今日状态提示 -->
      <view class="tn-margin tn-bg-blue--light tn-color-blue tn-padding tn-radius" v-if="!isTodayChecked">
        <view class="tn-flex tn-flex-row-between tn-flex-col-center" @click="tn('/pages/daily/check')">
          <view class="tn-flex tn-flex-col-center">
            <view class="tn-icon-notice tn-text-xl"></view>
            <view class="tn-margin-left-sm">今日功课尚未完成，前往打卡</view>
          </view>
          <view class="tn-icon-right"></view>
        </view>
      </view>

    </view>
    
    <view class='tn-tabbar-height'></view>
  </view>
</template>

<script>
  export default {
    name: 'Home',
    data(){
      return {
        greeting: '道友，早安',
        dailyQuote: '上善若水，水善利万物而不争。',
        isTodayChecked: false,
        navOpacity: 0,
        stats: {
          days: 0,
          merit: 0,
          level: 1
        }
      }
    },
    computed: {
      navBackgroundColor() {
        return `rgba(255, 255, 255, ${this.navOpacity})`
      }
    },
    onPageScroll(e) {
      const top = e.scrollTop
      const threshold = 100 // 滚动阈值，单位px
      if (top <= 0) {
        this.navOpacity = 0
      } else if (top < threshold) {
        this.navOpacity = top / threshold
      } else {
        this.navOpacity = 1
      }
    },
    created() {
      this.setGreeting();
    },
    onShow() {
      this.loadData();
    },
    methods: {
      tn(url) {
        uni.navigateTo({ url });
      },
      setGreeting() {
        const hour = new Date().getHours();
        if (hour < 6) this.greeting = '夜深了，注意休息';
        else if (hour < 9) this.greeting = '道友，早安';
        else if (hour < 12) this.greeting = '上午好，精进修行';
        else if (hour < 14) this.greeting = '午安，小憩养神';
        else if (hour < 18) this.greeting = '下午好';
        else this.greeting = '晚上好，静心反省';
      },
      async loadData() {
        const db = uniCloud.database();
        const uid = uniCloud.getCurrentUserInfo().uid;
        if (!uid) return;

        // 1. 获取用户信息中的统计数据
        try {
           const userRes = await db.collection('uni-id-users')
             .where('_id == $cloudEnv_uid')
             .field('dao_profile')
             .get();
           
           if(userRes.result.data.length > 0 && userRes.result.data[0].dao_profile) {
             const p = userRes.result.data[0].dao_profile;
             this.stats.days = p.continuous_days || 0;
             this.stats.merit = p.total_merit || 0;
             this.stats.level = p.level || 1;
           }
        } catch(e) {
          console.error('获取用户信息失败', e);
        }

        // 2. 检查今日打卡
        try {
          const now = new Date();
          const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
          const taskRes = await db.collection('daily_tasks')
            .where(`date == "${dateStr}" && user_id == $cloudEnv_uid`)
            .count();
            
          this.isTodayChecked = taskRes.result.total > 0;
        } catch(e) {
          console.error('检查打卡失败', e);
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .index {
    min-height: 100vh;
    background-color: #F8F8F8;
  }
  .tn-tabbar-height {
  	min-height: 120rpx;
  	height: calc(140rpx + env(safe-area-inset-bottom) / 2);
  }
  .icon-circle {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
  }
</style>