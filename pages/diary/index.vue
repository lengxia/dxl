<template>
  <view class="diary-page tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="" fixed customBack :backgroundColor="navBgColor" :bottomShadow="false">
      <view slot="back" class="nav-back" @click="goBack">
        <view class="back-btn">
          <text class="tn-icon-left" :style="{color: navTextColor}"></text>
        </view>
      </view>
      <view class="nav-title" :style="{color: navTextColor}">善行日记</view>
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
          <view class="guide-text">请登录以查看善行日记</view>
          <tn-button 
            shape="round" 
            backgroundColor="#C9A86C" 
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
        
        <!-- 统计概览卡片 -->
        <view class="stats-card">
          <view class="stats-icon">
            <text class="tn-icon-star-fill"></text>
          </view>
          <view class="stats-info">
            <view class="stats-row">
              <view class="stats-item">
                <view class="stats-value">{{ totalMerit }}</view>
                <view class="stats-label">功德分</view>
              </view>
              <view class="stats-divider"></view>
              <view class="stats-item">
                <view class="stats-value">{{ totalCount }}</view>
                <view class="stats-label">件善事</view>
              </view>
            </view>
            <view class="stats-period">{{ currentMonth }}月累计</view>
          </view>
        </view>

        <!-- 列表区域 -->
        <view class="list-section">
          <view class="section-header">
            <view class="section-title">善行记录</view>
          </view>
          
          <view v-if="diaries.length > 0" class="diary-list">
            <view 
              v-for="(item, index) in diaries" 
              :key="index" 
              class="diary-card"
              @click="goDetail(item._id)"
            >
              <view class="diary-header">
                <view class="diary-type" :style="{background: typeGradient(item.deed_type)}">
                  {{ item.deed_type }}
                </view>
                <view class="diary-date">{{ item.date }}</view>
              </view>
              
              <view class="diary-title">{{ item.title }}</view>
              
              <view class="diary-content">{{ item.content }}</view>
              
              <view class="diary-footer">
                <view class="diary-intention" v-if="item.intention">
                  <text class="tn-icon-heart"></text>
                  <text>{{ item.intention }}</text>
                </view>
                <view class="diary-merit">
                  <text class="tn-icon-diamond"></text>
                  <text>+{{ item.merit_points }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view v-else class="empty-state">
            <view class="empty-icon">
              <text class="tn-icon-star"></text>
            </view>
            <view class="empty-text">勿以善小而不为</view>
            <view class="empty-hint">点击下方按钮记录第一件善事</view>
          </view>
        </view>

      </view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="fab-btn" @click="goCreate">
      <text class="tn-icon-add"></text>
    </view>
  </view>
</template>

<script>
  import { checkLogin, getCurrentUid } from '@/libs/auth.js';

  export default {
    data() {
      return {
        diaries: [],
        scrollTop: 0,
        isLogin: false,
        lastLoadTime: 0  // 添加节流时间戳
      }
    },
    computed: {
      navBgColor() {
        return this.scrollTop > 50 ? '#FFFEFB' : 'transparent';
      },
      navTextColor() {
        return this.scrollTop > 50 ? '#2D3436' : '#FFFFFF';
      },
      totalMerit() {
        return this.diaries.reduce((sum, d) => sum + (d.merit_points || 0), 0);
      },
      totalCount() {
        return this.diaries.length;
      },
      currentMonth() {
        return new Date().getMonth() + 1;
      }
    },
    onPageScroll(e) {
      this.scrollTop = e.scrollTop;
    },
    onShow() {
      // 节流：5秒内不重复加载
      const now = Date.now();
      if (now - this.lastLoadTime < 5000) {
        return;
      }
      
      this.isLogin = checkLogin();
      
      if (this.isLogin) {
        this.loadData();
      }
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      goCreate() {
        uni.navigateTo({
          url: '/pages/diary/create'
        });
      },
      goDetail(id) {
        uni.navigateTo({
          url: '/pages/diary/detail?id=' + id
        });
      },
      async loadData() {
        if (!checkLogin()) {
          this.isLogin = false;
          return;
        }
        
        const uid = getCurrentUid();
        if (!uid) {
          return;
        }
        
        try {
          const waterApi = uniCloud.importObject('water-api', { customUI: true });
          const res = await waterApi.getDiaries({ uid });
          
          if (res.errCode === 0) {
            this.diaries = res.data;
            this.lastLoadTime = Date.now();  // 更新加载时间
          } else {
            this.diaries = [];
          }
        } catch (e) {
          // 数据库资源耗尽错误
          if (e.message && e.message.indexOf('resource exhausted') > -1) {
            uni.showToast({ 
              title: '服务器繁忙，请稍后再试', 
              icon: 'none',
              duration: 2000
            });
            return;
          }
          // 如果是匿名身份错误，清除token
          if (e.message && e.message.indexOf('匿名') > -1) {
            uni.removeStorageSync('uni_id_token');
            uni.removeStorageSync('uni_id_token_expired');
          }
        }
      },
      typeGradient(type) {
        const map = {
          '助人': 'linear-gradient(135deg, #E07A5F, #F09A7F)',
          '爱物': 'linear-gradient(135deg, #3D8B8F, #5AABAD)',
          '环保': 'linear-gradient(135deg, #26A69A, #4DB6AC)',
          '孝亲': 'linear-gradient(135deg, #7B68EE, #9B8AFF)',
          '其他': 'linear-gradient(135deg, #78909C, #90A4AE)'
        };
        return map[type] || map['其他'];
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

  .diary-page {
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
    height: 350rpx;
    background: linear-gradient(180deg, $accent 0%, #D4B87A 100%);
    border-radius: 0 0 60rpx 60rpx;
  }
  
  .page-content {
    position: relative;
    z-index: 1;
    padding: 30rpx;
    padding-bottom: 150rpx;
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
      background: rgba(201, 168, 108, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30rpx;
      
      text {
        font-size: 60rpx;
        color: $accent;
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
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.1);
  }
  
  .stats-icon {
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, $accent, #D4B87A);
    border-radius: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 30rpx;
    box-shadow: 0 8rpx 24rpx rgba(201, 168, 108, 0.3);
    
    text {
      font-size: 48rpx;
      color: #FFFFFF;
    }
  }
  
  .stats-info {
    flex: 1;
  }
  
  .stats-row {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
  }
  
  .stats-item {
    .stats-value {
      font-size: 44rpx;
      font-weight: bold;
      color: $text;
    }
    
    .stats-label {
      font-size: 22rpx;
      color: $text-hint;
    }
  }
  
  .stats-divider {
    width: 1rpx;
    height: 50rpx;
    background: #EEEEEE;
    margin: 0 40rpx;
  }
  
  .stats-period {
    font-size: 24rpx;
    color: $accent;
    font-weight: 500;
  }

  // 列表区域
  .list-section {
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
        background: $accent;
        border-radius: 3rpx;
      }
    }
  }
  
  .diary-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
  
  .diary-card {
    background: $card-bg;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .diary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }
  
  .diary-type {
    font-size: 22rpx;
    color: #FFFFFF;
    padding: 6rpx 18rpx;
    border-radius: 20rpx;
    font-weight: 500;
  }
  
  .diary-date {
    font-size: 24rpx;
    color: $text-hint;
  }
  
  .diary-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text;
    margin-bottom: 12rpx;
  }
  
  .diary-content {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    margin-bottom: 20rpx;
  }
  
  .diary-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx solid #F5F5F5;
  }
  
  .diary-intention {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: $text-hint;
    
    text:first-child {
      margin-right: 8rpx;
      color: $warm;
    }
  }
  
  .diary-merit {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    font-weight: bold;
    color: $accent;
    
    text:first-child {
      margin-right: 6rpx;
    }
  }

  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 0;
    
    .empty-icon {
      width: 140rpx;
      height: 140rpx;
      background: linear-gradient(135deg, $accent-light, $accent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30rpx;
      
      text {
        font-size: 70rpx;
        color: #FFFFFF;
      }
    }
    
    .empty-text {
      font-size: 34rpx;
      font-weight: bold;
      color: $text;
      margin-bottom: 10rpx;
    }
    
    .empty-hint {
      font-size: 26rpx;
      color: $text-hint;
    }
  }

  // 悬浮按钮
  .fab-btn {
    position: fixed;
    bottom: 100rpx;
    right: 40rpx;
    width: 110rpx;
    height: 110rpx;
    background: linear-gradient(135deg, $accent, #D4B87A);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10rpx 40rpx rgba(201, 168, 108, 0.4);
    z-index: 99;
    
    text {
      font-size: 48rpx;
      color: #FFFFFF;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
</style>
