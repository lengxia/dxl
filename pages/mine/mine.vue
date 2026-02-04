<template>
  <view class="mine-page tn-safe-area-inset-bottom">

    <!-- 顶部自定义导航 -->
    <tn-nav-bar :isBack="false" :bottomShadow="false" backgroundColor="transparent">
      <view class="custom-nav" @click="tn('/pages/mine/set')">
        <view class="nav-icon">
          <text class="tn-icon-set" style="font-size: 44rpx; color: #FFFFFF;"></text>
        </view>
      </view>
    </tn-nav-bar>
    
    <!-- 顶部背景 -->
    <view class="header-bg">
      <view class="header-pattern"></view>
    </view>
    
    <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      
      <!-- 用户信息卡片 -->
      <view class="user-section">
        <view class="user-card">
          <view class="avatar-wrapper">
            <view class="avatar-ring">
              <image 
                :src="userInfo.avatar || 'https://resource.tuniaokj.com/images/avatar/default_avatar.jpg'" 
                class="avatar-image"
                mode="aspectFill"
              />
            </view>
            <view class="level-badge">Lv.{{ stats.level }}</view>
          </view>
          
          <view class="user-info">
            <view class="user-name">{{ userInfo.nickname || '修行者' }}</view>
            <view class="user-motto">潜心修行，福慧双增</view>
          </view>
          
          <view class="edit-btn" @click="tn('/pages/mine/set')">
            <text class="tn-icon-right"></text>
          </view>
        </view>
      </view>
      
      <!-- 修行概览 -->
      <view class="merit-section">
        <view class="merit-card">
          <view class="merit-header">
            <view class="merit-icon">
              <text class="tn-icon-diamond"></text>
            </view>
            <view class="merit-info">
              <view class="merit-label">累计功德</view>
              <view class="merit-value">{{ stats.merit }}</view>
            </view>
          </view>
          <view class="merit-footer">
            <view class="level-name">{{ stats.level_name }}</view>
            <view class="practice-btn" @click="tn('/pages/daily/index')">
              <text>去修持</text>
              <text class="tn-icon-right" style="margin-left: 8rpx; font-size: 24rpx;"></text>
            </view>
          </view>
          <view class="merit-decoration"></view>
        </view>
      </view>
      
      <!-- 功能菜单 -->
      <view class="menu-section">
        <view class="menu-card">
          
          <view class="menu-item" @click="tn('/pages/mine/set')">
            <view class="menu-icon" style="background: linear-gradient(135deg, #3D8B8F, #5AABAD);">
              <text class="tn-icon-set-fill"></text>
            </view>
            <view class="menu-content">
              <view class="menu-title">系统设置</view>
              <view class="menu-desc">个人资料、账号管理</view>
            </view>
            <view class="menu-arrow">
              <text class="tn-icon-right"></text>
            </view>
          </view>
          
          <view class="menu-divider"></view>

          <view class="menu-item" @click="tn('/pages/mine/about')">
            <view class="menu-icon" style="background: linear-gradient(135deg, #C9A86C, #D4B87A);">
              <text class="tn-icon-flower-fill"></text>
            </view>
            <view class="menu-content">
              <view class="menu-title">关于道心录</view>
              <view class="menu-desc">了解我们的初心</view>
            </view>
            <view class="menu-arrow">
              <text class="tn-icon-right"></text>
            </view>
          </view>
          
          <view class="menu-divider"></view>
          
          <button class="menu-item btn-reset" open-type="feedback">
            <view class="menu-icon" style="background: linear-gradient(135deg, #E07A5F, #F09A7F);">
              <text class="tn-icon-message-fill"></text>
            </view>
            <view class="menu-content">
              <view class="menu-title">问题反馈</view>
              <view class="menu-desc">帮助我们做得更好</view>
            </view>
            <view class="menu-arrow">
              <text class="tn-icon-right"></text>
            </view>
          </button>
          
        </view>
      </view>

      <!-- 底部心语 -->
      <view class="footer-section">
        <view class="footer-text">道不远人，勤修不辍</view>
      </view>

    </view>

    <view class='tn-tabbar-height'></view>

  </view>
</template>

<script>
  export default {
    name: 'Mine',
    data() {
      return {
        userInfo: {
          nickname: '',
          avatar: ''
        },
        stats: {
          merit: 0,
          level: 1,
          level_name: '初入道门'
        }
      }
    },
    onShow() {
      this.loadUserInfo();
    },
    methods: {
      tn(e) {
        uni.navigateTo({
          url: e,
        });
      },
      async loadUserInfo() {
        const db = uniCloud.database();
        const uid = uniCloud.getCurrentUserInfo().uid;
        if (!uid) return;

        try {
           const userRes = await db.collection('uni-id-users')
             .where('_id == $cloudEnv_uid')
             .field('nickname,avatar,dao_profile')
             .get();
           
           if(userRes.result.data.length > 0) {
             const u = userRes.result.data[0];
             this.userInfo.nickname = u.nickname;
             this.userInfo.avatar = u.avatar;
             
             if(u.dao_profile) {
               this.stats.merit = u.dao_profile.total_merit || 0;
               const level = u.dao_profile.level || 1;
               this.stats.level = level;
               const levelNames = ['初入道门', '筑基初成', '开光境界', '融合之境', '心动大成', '金丹圆满'];
               this.stats.level_name = levelNames[Math.min(level - 1, levelNames.length - 1)] || '初入道门';
             }
           }
        } catch(e) {
          console.error('获取用户信息失败', e);
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  // 道心录配色
  $primary: #3D8B8F;
  $primary-light: #5AABAD;
  $primary-dark: #2A6366;
  $accent: #C9A86C;
  $accent-light: #E8D4A8;
  $warm: #E07A5F;
  $bg: #F7F5F0;
  $card-bg: #FFFEFB;
  $text: #2D3436;
  $text-secondary: #636E72;
  $text-hint: #B2BEC3;

  .mine-page {
    min-height: 100vh;
    background-color: $bg;
  }
  
  .tn-tabbar-height {
    min-height: 120rpx;
    height: calc(140rpx + env(safe-area-inset-bottom) / 2);
  }
  
  .custom-nav {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 30rpx;
    padding-top: 38rpx;
  }
  
  .nav-icon {
    width: 70rpx;
    height: 70rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // 顶部背景
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 450rpx;
    background: linear-gradient(180deg, $primary 0%, $primary-light 100%);
    overflow: hidden;
    
    .header-pattern {
      position: absolute;
      top: -100rpx;
      right: -100rpx;
      width: 400rpx;
      height: 400rpx;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
  }
  
  .page-content {
    position: relative;
    z-index: 1;
    padding: 0 30rpx;
  }

  // 用户信息区
  .user-section {
    padding-top: 40rpx;
    margin-bottom: 30rpx;
  }
  
  .user-card {
    background: $card-bg;
    border-radius: 28rpx;
    padding: 40rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.1);
  }
  
  .avatar-wrapper {
    position: relative;
    margin-right: 30rpx;
  }
  
  .avatar-ring {
    width: 130rpx;
    height: 130rpx;
    border-radius: 50%;
    padding: 6rpx;
    background: linear-gradient(135deg, $primary, $accent);
    
    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 4rpx solid $card-bg;
    }
  }
  
  .level-badge {
    position: absolute;
    bottom: -10rpx;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, $accent, #D4B87A);
    color: #FFFFFF;
    font-size: 20rpx;
    font-weight: bold;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 10rpx rgba(201, 168, 108, 0.4);
  }
  
  .user-info {
    flex: 1;
    
    .user-name {
      font-size: 38rpx;
      font-weight: bold;
      color: $text;
      margin-bottom: 10rpx;
    }
    
    .user-motto {
      font-size: 26rpx;
      color: $text-hint;
    }
  }
  
  .edit-btn {
    width: 60rpx;
    height: 60rpx;
    background: $bg;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    text {
      color: $text-hint;
      font-size: 28rpx;
    }
  }

  // 功德卡片
  .merit-section {
    margin-bottom: 30rpx;
  }
  
  .merit-card {
    background: linear-gradient(135deg, #2D3436 0%, #434A4D 100%);
    border-radius: 24rpx;
    padding: 36rpx;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.15);
  }
  
  .merit-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
  }
  
  .merit-icon {
    width: 80rpx;
    height: 80rpx;
    background: linear-gradient(135deg, $accent, #D4B87A);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    
    text {
      color: #FFFFFF;
      font-size: 40rpx;
    }
  }
  
  .merit-info {
    .merit-label {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 6rpx;
    }
    .merit-value {
      font-size: 52rpx;
      font-weight: bold;
      color: $accent;
    }
  }
  
  .merit-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .level-name {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
    padding: 8rpx 24rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 30rpx;
  }
  
  .practice-btn {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, $accent, #D4B87A);
    color: #2D3436;
    font-size: 26rpx;
    font-weight: bold;
    padding: 16rpx 36rpx;
    border-radius: 30rpx;
    box-shadow: 0 6rpx 20rpx rgba(201, 168, 108, 0.4);
  }
  
  .merit-decoration {
    position: absolute;
    top: -60rpx;
    right: -60rpx;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 50%;
  }

  // 菜单区域
  .menu-section {
    margin-bottom: 40rpx;
  }
  
  .menu-card {
    background: $card-bg;
    border-radius: 24rpx;
    padding: 10rpx 0;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
  }
  
  .btn-reset {
    width: 100%;
    background: transparent;
    border: none;
    text-align: left;
    
    &::after {
      border: none;
    }
  }
  
  .menu-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    
    text {
      color: #FFFFFF;
      font-size: 38rpx;
    }
  }
  
  .menu-content {
    flex: 1;
    
    .menu-title {
      font-size: 30rpx;
      font-weight: 500;
      color: $text;
      margin-bottom: 6rpx;
    }
    
    .menu-desc {
      font-size: 24rpx;
      color: $text-hint;
    }
  }
  
  .menu-arrow {
    text {
      color: $text-hint;
      font-size: 28rpx;
    }
  }
  
  .menu-divider {
    height: 1rpx;
    background: #F0F0F0;
    margin: 0 30rpx;
  }

  // 底部
  .footer-section {
    text-align: center;
    padding: 40rpx 0;
  }
  
  .footer-text {
    font-size: 24rpx;
    color: $text-hint;
    letter-spacing: 4rpx;
  }
</style>
