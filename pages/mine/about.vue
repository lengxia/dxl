<template>
  <view class="about-page tn-safe-area-inset-bottom">
    <!-- 顶部自定义导航 -->
    <tn-nav-bar fixed customBack backgroundColor="#FFFEFB" :bottomShadow="false">
      <view slot="back" class="nav-back" @click="goBack">
        <view class="back-btn">
          <text class="tn-icon-left"></text>
        </view>
      </view>
      <view class="nav-title">关于</view>
    </tn-nav-bar>
    
    <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      
      <!-- 品牌Logo区域 -->
      <view class="logo-section">
        <view class="logo-box">
          <view class="logo-inner">
            <text class="tn-icon-moon-fill"></text>
          </view>
          <view class="logo-ring"></view>
        </view>
        <view class="app-name">道心录</view>
        <view class="app-version">v1.0.0</view>
      </view>

      <!-- 简介卡片 -->
      <view class="intro-section">
        <view class="intro-card">
          <view class="intro-header">
            <view class="intro-icon">
              <text class="tn-icon-flower"></text>
            </view>
            <view class="intro-title">初心</view>
          </view>
          <view class="intro-content">
            <view class="intro-paragraph">
              "道心录"是一款专注于个人修行管理的工具。
            </view>
            <view class="intro-paragraph">
              我们致力于帮助每一位修行者记录每日功课、检视起心动念、规划修行路径、记录感悟心得。
            </view>
            <view class="intro-paragraph">
              愿此工具能助您日日精进，修得圆满智慧。
            </view>
          </view>
        </view>
      </view>

      <!-- 功能特色 -->
      <view class="features-section">
        <view class="section-title">核心功能</view>
        <view class="features-grid">
          <view class="feature-item">
            <view class="feature-icon" style="background: linear-gradient(135deg, #3D8B8F, #5AABAD);">
              <text class="tn-icon-calendar"></text>
            </view>
            <view class="feature-name">每日功课</view>
          </view>
          <view class="feature-item">
            <view class="feature-icon" style="background: linear-gradient(135deg, #C9A86C, #D4B87A);">
              <text class="tn-icon-star"></text>
            </view>
            <view class="feature-name">善行日记</view>
          </view>
          <view class="feature-item">
            <view class="feature-icon" style="background: linear-gradient(135deg, #E07A5F, #F09A7F);">
              <text class="tn-icon-flag"></text>
            </view>
            <view class="feature-name">月度计划</view>
          </view>
          <view class="feature-item">
            <view class="feature-icon" style="background: linear-gradient(135deg, #7B68EE, #9B8AFF);">
              <text class="tn-icon-edit"></text>
            </view>
            <view class="feature-name">悟道札记</view>
          </view>
        </view>
      </view>

      <!-- 底部版权 -->
      <view class="footer-section">
        <view class="footer-divider">
          <view class="divider-line"></view>
          <view class="divider-icon">
            <text class="tn-icon-flower"></text>
          </view>
          <view class="divider-line"></view>
        </view>
        <view class="footer-text">
          道不远人，勤修不辍
        </view>
        <view class="copyright">
          Copyright 2024 DaoXinLu
        </view>
      </view>

    </view>
  </view>
</template>

<script>
  export default {
    name: 'About',
    data(){
      return {}
    },
    methods: {
      goBack() {
        uni.navigateBack();
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
  $bg: #F7F5F0;
  $card-bg: #FFFEFB;
  $text: #2D3436;
  $text-secondary: #636E72;
  $text-hint: #B2BEC3;

  .about-page {
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
        color: $text;
      }
    }
  }
  
  .nav-title {
    font-size: 34rpx;
    font-weight: bold;
    color: $text;
  }
  
  .page-content {
    padding: 30rpx;
    padding-top: 60rpx;
  }

  // Logo区域
  .logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 50rpx;
  }
  
  .logo-box {
    position: relative;
    width: 180rpx;
    height: 180rpx;
    margin-bottom: 30rpx;
  }
  
  .logo-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140rpx;
    height: 140rpx;
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 15rpx 50rpx rgba(61, 139, 143, 0.35);
    z-index: 2;
    
    text {
      font-size: 70rpx;
      color: #FFFFFF;
    }
  }
  
  .logo-ring {
    position: absolute;
    top: 0;
    left: 0;
    width: 180rpx;
    height: 180rpx;
    border: 4rpx solid $accent-light;
    border-radius: 50rpx;
    transform: rotate(15deg);
  }
  
  .app-name {
    font-size: 48rpx;
    font-weight: bold;
    color: $text;
    letter-spacing: 8rpx;
    margin-bottom: 10rpx;
  }
  
  .app-version {
    font-size: 26rpx;
    color: $text-hint;
    background: $bg;
    padding: 6rpx 24rpx;
    border-radius: 20rpx;
  }

  // 简介卡片
  .intro-section {
    margin-bottom: 40rpx;
  }
  
  .intro-card {
    background: $card-bg;
    border-radius: 24rpx;
    padding: 36rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  }
  
  .intro-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
  }
  
  .intro-icon {
    width: 60rpx;
    height: 60rpx;
    background: linear-gradient(135deg, $accent-light, $accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16rpx;
    
    text {
      font-size: 30rpx;
      color: #FFFFFF;
    }
  }
  
  .intro-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text;
  }
  
  .intro-content {
    padding-left: 76rpx;
  }
  
  .intro-paragraph {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.8;
    margin-bottom: 20rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  // 功能特色
  .features-section {
    margin-bottom: 50rpx;
  }
  
  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: $text;
    margin-bottom: 24rpx;
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
  
  .features-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }
  
  .feature-item {
    width: calc(50% - 10rpx);
    background: $card-bg;
    border-radius: 20rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  }
  
  .feature-icon {
    width: 70rpx;
    height: 70rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    
    text {
      font-size: 36rpx;
      color: #FFFFFF;
    }
  }
  
  .feature-name {
    font-size: 28rpx;
    font-weight: 500;
    color: $text;
  }

  // 底部
  .footer-section {
    padding: 40rpx 0 60rpx;
  }
  
  .footer-divider {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
  }
  
  .divider-line {
    flex: 1;
    height: 1rpx;
    background: linear-gradient(90deg, transparent, $accent-light, transparent);
  }
  
  .divider-icon {
    padding: 0 30rpx;
    
    text {
      font-size: 32rpx;
      color: $accent;
    }
  }
  
  .footer-text {
    text-align: center;
    font-size: 28rpx;
    color: $text-secondary;
    letter-spacing: 4rpx;
    margin-bottom: 20rpx;
  }
  
  .copyright {
    text-align: center;
    font-size: 22rpx;
    color: $text-hint;
  }
</style>
