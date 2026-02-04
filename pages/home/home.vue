<template>
  <view class="home-page tn-safe-area-inset-bottom">
    <!-- 顶部导航 -->
    <tn-nav-bar fixed :isBack="false" :bottomShadow="false" :backgroundColor="navBackgroundColor">
      <view slot="default" class="custom-nav-content">
        <text class="title-text">道心录</text>
      </view>
    </tn-nav-bar>
    
    <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      
      <!-- 头部问候区域 -->
      <view class="greeting-section">
        <view class="greeting-bg"></view>
        <view class="greeting-content">
          <view class="greeting-row">
            <view class="greeting-left">
              <view class="greeting-text">{{ greeting }}</view>
              <view class="date-text">{{ todayDate }}</view>
            </view>
            <view class="avatar-box" @click="tn('/pages/mine/mine')">
              <image 
                :src="userAvatar || '/static/logo.png'" 
                class="avatar-img"
                mode="aspectFill"
              />
            </view>
          </view>
          
          <!-- 格言卡片 -->
          <view class="quote-card">
            <view class="quote-icon">
              <text class="tn-icon-flower"></text>
            </view>
            <view class="quote-text">"{{ dailyQuote }}"</view>
          </view>
        </view>
      </view>

      <!-- 修行数据概览 -->
      <view class="stats-section">
        <view class="stats-card">
          <view class="stat-item" @click="tn('/pages/daily/index')">
            <view class="stat-value primary">{{ stats.days }}</view>
            <view class="stat-label">修行天数</view>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item" @click="tn('/pages/diary/index')">
            <view class="stat-value accent">{{ stats.merit }}</view>
            <view class="stat-label">累计功德</view>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <view class="stat-value warm">{{ levelName }}</view>
            <view class="stat-label">当前境界</view>
          </view>
        </view>
      </view>

      <!-- 今日状态提示 -->
      <view class="reminder-card" v-if="!isTodayChecked" @click="tn('/pages/daily/check')">
        <view class="reminder-left">
          <view class="reminder-icon">
            <text class="tn-icon-bell"></text>
          </view>
          <view class="reminder-text">
            <view class="reminder-title">今日功课尚未完成</view>
            <view class="reminder-subtitle">点击开始今日修行</view>
          </view>
        </view>
        <view class="reminder-arrow">
          <text class="tn-icon-right"></text>
        </view>
      </view>

      <!-- 核心功能入口 -->
      <view class="features-section">
        <view class="section-header">
          <view class="section-title">修行法门</view>
          <view class="section-line"></view>
        </view>
        
        <view class="feature-grid">
          <!-- 每日功课 -->
          <view class="feature-card" @click="tn('/pages/daily/index')">
            <view class="feature-icon icon-daily">
              <text class="tn-icon-calendar"></text>
            </view>
            <view class="feature-info">
              <view class="feature-name">每日功课</view>
              <view class="feature-desc">日省吾身 检视心念</view>
            </view>
            <view class="feature-arrow">
              <text class="tn-icon-right"></text>
            </view>
          </view>
          
          <!-- 善行日记 -->
          <view class="feature-card" @click="tn('/pages/diary/index')">
            <view class="feature-icon icon-diary">
              <text class="tn-icon-star"></text>
            </view>
            <view class="feature-info">
              <view class="feature-name">善行日记</view>
              <view class="feature-desc">积功累德 广种福田</view>
            </view>
            <view class="feature-arrow">
              <text class="tn-icon-right"></text>
            </view>
          </view>
          
          <!-- 月度计划 -->
          <view class="feature-card" @click="tn('/pages/plan/index')">
            <view class="feature-icon icon-plan">
              <text class="tn-icon-flag"></text>
            </view>
            <view class="feature-info">
              <view class="feature-name">月度计划</view>
              <view class="feature-desc">立志笃行 循序渐进</view>
            </view>
            <view class="feature-arrow">
              <text class="tn-icon-right"></text>
            </view>
          </view>
          
          <!-- 悟道札记 -->
          <view class="feature-card" @click="tn('/pages/notes/index')">
            <view class="feature-icon icon-notes">
              <text class="tn-icon-edit"></text>
            </view>
            <view class="feature-info">
              <view class="feature-name">悟道札记</view>
              <view class="feature-desc">妙悟真心 记录感悟</view>
            </view>
            <view class="feature-arrow">
              <text class="tn-icon-right"></text>
            </view>
          </view>
        </view>
      </view>

      <!-- 修行心语 -->
      <view class="wisdom-section">
        <view class="section-header">
          <view class="section-title">修行心语</view>
          <view class="section-line"></view>
        </view>
        <view class="wisdom-card">
          <view class="wisdom-content">
            <text>道不远人，人自远之。心若澄明，万法皆空。愿每一天的修行，都能让我们离本真更近一步。</text>
          </view>
          <view class="wisdom-author">-- 道心录</view>
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
        userAvatar: '',
        stats: {
          days: 0,
          merit: 0,
          level: 1
        }
      }
    },
    computed: {
      navBackgroundColor() {
        return `rgba(255, 254, 251, ${this.navOpacity})`
      },
      todayDate() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekDay = weekDays[now.getDay()];
        return `${month}月${day}日 星期${weekDay}`;
      },
      levelName() {
        const levelNames = ['初入道门', '筑基初成', '开光境界', '融合之境', '心动大成', '金丹圆满'];
        return levelNames[Math.min(this.stats.level - 1, levelNames.length - 1)] || '初入道门';
      }
    },
    onPageScroll(e) {
      const top = e.scrollTop
      const threshold = 100
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

        try {
           const userRes = await db.collection('uni-id-users')
             .where('_id == $cloudEnv_uid')
             .field('dao_profile,avatar')
             .get();
           
           if(userRes.result.data.length > 0) {
             const user = userRes.result.data[0];
             this.userAvatar = user.avatar || '';
             if(user.dao_profile) {
               const p = user.dao_profile;
               this.stats.days = p.continuous_days || 0;
               this.stats.merit = p.total_merit || 0;
               this.stats.level = p.level || 1;
             }
           }
        } catch(e) {
          console.error('获取用户信息失败', e);
        }

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
  // 道心录配色
  $primary: #3D8B8F;
  $primary-light: #5AABAD;
  $accent: #C9A86C;
  $accent-light: #E8D4A8;
  $warm: #E07A5F;
  $bg: #F7F5F0;
  $card-bg: #FFFEFB;
  $text: #2D3436;
  $text-secondary: #636E72;
  $text-hint: #B2BEC3;

  .home-page {
    min-height: 100vh;
    background-color: $bg;
  }
  
  .tn-tabbar-height {
    min-height: 120rpx;
    height: calc(140rpx + env(safe-area-inset-bottom) / 2);
  }
  
  .custom-nav-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .title-text {
      font-size: 38rpx;
      font-weight: bold;
      color: $text;
      letter-spacing: 6rpx;
    }
  }
  
  .page-content {
    padding: 0 0 30rpx 0;
  }

  // 问候区域
  .greeting-section {
    position: relative;
    padding: 30rpx;
    padding-top: 20rpx;
    margin-bottom: 20rpx;
  }
  
  .greeting-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 340rpx;
    background: linear-gradient(160deg, $primary 0%, $primary-light 100%);
    border-radius: 0 0 50rpx 50rpx;
  }
  
  .greeting-content {
    position: relative;
    z-index: 1;
  }
  
  .greeting-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30rpx;
  }
  
  .greeting-left {
    .greeting-text {
      font-size: 44rpx;
      font-weight: bold;
      color: #FFFFFF;
      margin-bottom: 10rpx;
    }
    .date-text {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  .avatar-box {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    overflow: hidden;
    border: 4rpx solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
    
    .avatar-img {
      width: 100%;
      height: 100%;
    }
  }
  
  .quote-card {
    background: $card-bg;
    border-radius: 24rpx;
    padding: 36rpx;
    box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.08);
    
    .quote-icon {
      width: 60rpx;
      height: 60rpx;
      background: linear-gradient(135deg, $accent-light, $accent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20rpx;
      
      text {
        color: #FFFFFF;
        font-size: 32rpx;
      }
    }
    
    .quote-text {
      font-size: 30rpx;
      color: $text-secondary;
      line-height: 1.8;
      font-style: italic;
    }
  }

  // 数据统计
  .stats-section {
    padding: 0 30rpx;
    margin-bottom: 30rpx;
  }
  
  .stats-card {
    background: $card-bg;
    border-radius: 24rpx;
    padding: 40rpx 20rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  }
  
  .stat-item {
    flex: 1;
    text-align: center;
    
    .stat-value {
      font-size: 48rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
      
      &.primary { color: $primary; }
      &.accent { color: $accent; }
      &.warm { color: $warm; }
    }
    
    .stat-label {
      font-size: 24rpx;
      color: $text-hint;
    }
  }
  
  .stat-divider {
    width: 1rpx;
    height: 60rpx;
    background: #EEEEEE;
  }

  // 提醒卡片
  .reminder-card {
    margin: 0 30rpx 30rpx;
    background: linear-gradient(135deg, $accent, #D4B87A);
    border-radius: 20rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 8rpx 30rpx rgba(201, 168, 108, 0.3);
    
    .reminder-left {
      display: flex;
      align-items: center;
    }
    
    .reminder-icon {
      width: 70rpx;
      height: 70rpx;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 24rpx;
      
      text {
        color: #FFFFFF;
        font-size: 36rpx;
      }
    }
    
    .reminder-text {
      .reminder-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #FFFFFF;
        margin-bottom: 6rpx;
      }
      .reminder-subtitle {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .reminder-arrow {
      text {
        color: rgba(255, 255, 255, 0.8);
        font-size: 32rpx;
      }
    }
  }

  // 功能区域
  .features-section {
    padding: 0 30rpx;
    margin-bottom: 30rpx;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text;
      margin-right: 20rpx;
    }
    
    .section-line {
      flex: 1;
      height: 2rpx;
      background: linear-gradient(90deg, $accent-light, transparent);
    }
  }
  
  .feature-grid {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
  
  .feature-card {
    background: $card-bg;
    border-radius: 20rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
    }
  }
  
  .feature-icon {
    width: 90rpx;
    height: 90rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    
    text {
      font-size: 44rpx;
      color: #FFFFFF;
    }
    
    &.icon-daily {
      background: linear-gradient(135deg, $primary, $primary-light);
    }
    &.icon-diary {
      background: linear-gradient(135deg, $accent, #D4B87A);
    }
    &.icon-plan {
      background: linear-gradient(135deg, $warm, #F09A7F);
    }
    &.icon-notes {
      background: linear-gradient(135deg, #7B68EE, #9B8AFF);
    }
  }
  
  .feature-info {
    flex: 1;
    
    .feature-name {
      font-size: 32rpx;
      font-weight: bold;
      color: $text;
      margin-bottom: 8rpx;
    }
    
    .feature-desc {
      font-size: 24rpx;
      color: $text-hint;
    }
  }
  
  .feature-arrow {
    text {
      color: $text-hint;
      font-size: 28rpx;
    }
  }

  // 心语区域
  .wisdom-section {
    padding: 0 30rpx;
  }
  
  .wisdom-card {
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    border-radius: 24rpx;
    padding: 40rpx;
    box-shadow: 0 10rpx 40rpx rgba(61, 139, 143, 0.2);
    
    .wisdom-content {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.95);
      line-height: 1.8;
      margin-bottom: 20rpx;
    }
    
    .wisdom-author {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.7);
      text-align: right;
    }
  }
</style>
