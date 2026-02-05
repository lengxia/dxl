<template>
  <view class="daily-page tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="" fixed customBack :backgroundColor="navBgColor" :bottomShadow="false">
      <view slot="back" class="nav-back" @click="goBack">
        <view class="back-btn">
          <text class="tn-icon-left" :style="{color: navTextColor}"></text>
        </view>
      </view>
      <view class="nav-title" :style="{color: navTextColor}">每日功课</view>
    </tn-nav-bar>

    <view class="page-wrapper">
      <!-- 顶部背景 -->
      <view class="header-bg"></view>
      
      <!-- 未登录状态 -->
      <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}" v-if="!isLogin">
        <view class="login-guide-card">
          <view class="guide-icon">
            <text class="tn-icon-wechat"></text>
          </view>
          <view class="guide-text">请登录以查看每日功课</view>
          <tn-button 
            shape="round" 
            backgroundColor="#3D8B8F" 
            fontColor="#FFFFFF" 
            width="280rpx"
            shadow
            @click="goBack"
          >
            去登录
          </tn-button>
        </view>
      </view>

      <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}" v-else>
        
        <!-- 头部统计卡片 -->
        <view class="stats-card">
          <view class="stats-header">
            <view class="stats-title">修行数据</view>
            <view class="stats-date">{{ todayStr }}</view>
          </view>
          <view class="stats-grid">
            <view class="stat-item">
              <view class="stat-value primary">{{ stats.continuous_days }}</view>
              <view class="stat-label">连续修持</view>
              <view class="stat-unit">天</view>
            </view>
            <view class="stat-item">
              <view class="stat-value accent">{{ stats.total_score }}</view>
              <view class="stat-label">累计功德</view>
              <view class="stat-unit">分</view>
            </view>
            <view class="stat-item">
              <view class="stat-value warm">{{ stats.level }}</view>
              <view class="stat-label">修行等级</view>
              <view class="stat-unit">级</view>
            </view>
          </view>
        </view>

        <!-- 日历打卡视图 -->
        <view class="calendar-section">
          <view class="section-header">
            <view class="section-title">打卡日历</view>
          </view>
          <view class="calendar-wrapper">
            <tn-calendar 
              :show="true" 
              mode="date"
              :activeBgColor="'#3D8B8F'"
              :popup="false"
              :changeYear="false"
              :changeMonth="true"
            ></tn-calendar>
          </view>
        </view>

        <!-- 今日功课卡片 -->
        <view class="today-section">
          <view class="section-header">
            <view class="section-title">今日功课</view>
            <tn-tag 
              :backgroundColor="todayTask ? '#E8F5E9' : '#FFF3E0'" 
              :fontColor="todayTask ? '#2E7D32' : '#E65100'"
              shape="circle" 
              size="sm"
            >
              {{ todayTask ? '已完成' : '未完成' }}
            </tn-tag>
          </view>
          
          <view class="today-card">
            <view v-if="!todayTask" class="empty-state">
              <view class="empty-icon">
                <text class="tn-icon-moon"></text>
              </view>
              <view class="empty-text">今日功课尚未开始</view>
              <view class="empty-hint">点击下方按钮开始今日修行</view>
              <tn-button 
                shape="round" 
                backgroundColor="#3D8B8F" 
                fontColor="#FFFFFF" 
                width="280rpx"
                shadow
                @click="goCheck"
              >
                开始打卡
              </tn-button>
            </view>
            
            <view v-else class="task-result">
              <view class="score-display">
                <view class="score-circle">
                  <view class="score-number">{{ todayTask.total_score }}</view>
                  <view class="score-label">今日得分</view>
                </view>
              </view>
              
              <view class="mind-check">
                <view class="check-title">心念检视</view>
                <view class="check-tags">
                  <view v-if="todayTask.mind_check.anxiety" class="tag negative">焦躁</view>
                  <view v-if="todayTask.mind_check.greed" class="tag negative">贪欲</view>
                  <view v-if="todayTask.mind_check.arrogance" class="tag negative">傲慢</view>
                  <view v-if="todayTask.mind_check.anger" class="tag negative">嗔怒</view>
                  <view v-if="!isHasMindIssues(todayTask.mind_check)" class="tag positive">心如止水</view>
                </view>
              </view>

              <view class="edit-btn" @click="goCheck">
                <text class="tn-icon-edit"></text>
                <text>修改记录</text>
              </view>
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
        scrollTop: 0,
        stats: {
          continuous_days: 0,
          total_score: 0,
          level: 1
        },
        isLogin: false
      }
    },
    computed: {
      navBgColor() {
        return this.scrollTop > 50 ? '#FFFEFB' : 'transparent';
      },
      navTextColor() {
        return this.scrollTop > 50 ? '#2D3436' : '#FFFFFF';
      }
    },
    onPageScroll(e) {
      this.scrollTop = e.scrollTop;
    },
    onShow() {
      const now = new Date();
      this.todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      
      const token = uni.getStorageSync('uni_id_token');
      this.isLogin = !!token;
      
      if (this.isLogin) {
        this.loadData();
      }
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
        // 检查是否真正登录（有有效的 token）
        const token = uni.getStorageSync('uni_id_token');
        if (!token) {
          console.log('未登录，跳过数据加载');
          return;
        }
        
        // 优先从 uniCloud 获取用户ID，如果没有再从本地存储获取
        let uid = uniCloud.getCurrentUserInfo().uid || uni.getStorageSync('uni_id_user_uid');
        if (!uid) {
          console.log('无法获取用户ID，跳过数据加载');
          return;
        }
        
        // 如果从 getCurrentUserInfo 获取到了 uid，保存到本地存储
        if (uniCloud.getCurrentUserInfo().uid && !uni.getStorageSync('uni_id_user_uid')) {
          uni.setStorageSync('uni_id_user_uid', uid);
          console.log('保存用户ID到本地存储:', uid);
        }
        
        try {
          const waterApi = uniCloud.importObject('water-api');
          const res = await waterApi.getDailyTask({
            date: this.todayStr,
            uid: uid
          });
          
          if (res.errCode === 0 && res.data) {
            this.todayTask = res.data;
          } else {
            this.todayTask = null;
          }
        } catch (e) {
          console.error('数据加载失败', e);
          // 如果是匿名身份错误，清除token
          if (e.message && e.message.indexOf('匿名') > -1) {
            uni.removeStorageSync('uni_id_token');
            uni.removeStorageSync('uni_id_token_expired');
            uni.removeStorageSync('uni_id_user_uid');
          }
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

  .daily-page {
    min-height: 100vh;
    background-color: $bg;
  }
  
  .nav-back {
    display: flex;
    align-items: center;
    height: 100%;
    padding-left: 20rpx;
    
    .back-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      text {
        font-size: 36rpx;
      }
    }
  }
  
  .nav-title {
    font-size: 34rpx;
    font-weight: bold;
  }
  
  .page-wrapper {
    position: relative;
  }
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 400rpx;
    background: linear-gradient(180deg, $primary 0%, $primary-light 100%);
    border-radius: 0 0 60rpx 60rpx;
  }
  
  .page-content {
    position: relative;
    z-index: 1;
    padding: 30rpx;
  }
  
  // 登录引导
  .login-guide-card {
    background: #FFFFFF;
    border-radius: 28rpx;
    padding: 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.05);
    margin-top: 40rpx;
    
    .guide-icon {
      width: 120rpx;
      height: 120rpx;
      background: rgba(61, 139, 143, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30rpx;
      
      text {
        font-size: 60rpx;
        color: $primary;
      }
    }
    
    .guide-text {
      font-size: 30rpx;
      color: $text;
      margin-bottom: 40rpx;
      font-weight: bold;
    }
  }

  // 统计卡片
  .stats-card {
    background: $card-bg;
    border-radius: 28rpx;
    padding: 36rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.1);
  }
  
  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .stats-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text;
    }
    
    .stats-date {
      font-size: 24rpx;
      color: $text-hint;
    }
  }
  
  .stats-grid {
    display: flex;
    justify-content: space-around;
  }
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      font-size: 52rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
      
      &.primary { color: $primary; }
      &.accent { color: $accent; }
      &.warm { color: $warm; }
    }
    
    .stat-label {
      font-size: 24rpx;
      color: $text-hint;
      margin-bottom: 4rpx;
    }
    
    .stat-unit {
      font-size: 20rpx;
      color: $text-hint;
    }
  }

  // 日历区域
  .calendar-section {
    margin-bottom: 30rpx;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: $text;
      position: relative;
      padding-left: 20rpx;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6rpx;
        height: 28rpx;
        background: $primary;
        border-radius: 3rpx;
      }
    }
  }
  
  .calendar-wrapper {
    background: $card-bg;
    border-radius: 24rpx;
    padding: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  }

  // 今日功课
  .today-section {
    margin-bottom: 30rpx;
  }
  
  .today-card {
    background: $card-bg;
    border-radius: 24rpx;
    padding: 40rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0;
    
    .empty-icon {
      width: 120rpx;
      height: 120rpx;
      background: linear-gradient(135deg, $accent-light, $accent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30rpx;
      
      text {
        font-size: 60rpx;
        color: #FFFFFF;
      }
    }
    
    .empty-text {
      font-size: 32rpx;
      font-weight: bold;
      color: $text;
      margin-bottom: 10rpx;
    }
    
    .empty-hint {
      font-size: 26rpx;
      color: $text-hint;
      margin-bottom: 40rpx;
    }
  }
  
  .task-result {
    .score-display {
      display: flex;
      justify-content: center;
      margin-bottom: 30rpx;
    }
    
    .score-circle {
      width: 200rpx;
      height: 200rpx;
      background: linear-gradient(135deg, $primary, $primary-light);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10rpx 40rpx rgba(61, 139, 143, 0.3);
      
      .score-number {
        font-size: 60rpx;
        font-weight: bold;
        color: #FFFFFF;
      }
      
      .score-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .mind-check {
      background: $bg;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 24rpx;
      
      .check-title {
        font-size: 26rpx;
        font-weight: bold;
        color: $text;
        margin-bottom: 16rpx;
      }
      
      .check-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
      }
      
      .tag {
        font-size: 24rpx;
        padding: 8rpx 20rpx;
        border-radius: 20rpx;
        
        &.negative {
          background: #FFEBEE;
          color: #C62828;
        }
        
        &.positive {
          background: #E8F5E9;
          color: #2E7D32;
        }
      }
    }
    
    .edit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx;
      border: 2rpx solid $primary;
      border-radius: 40rpx;
      color: $primary;
      font-size: 28rpx;
      
      text:first-child {
        margin-right: 10rpx;
      }
    }
  }
</style>
