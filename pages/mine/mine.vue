<template>
  <view class="mine tn-safe-area-inset-bottom">

    <!-- 顶部自定义导航 -->
    <tn-nav-bar :isBack="false" :bottomShadow="false" backgroundColor="none">
      <view class="custom-nav tn-flex tn-flex-col-center tn-flex-row-left" @click="tn('/pages/mine/set')">
        <view class="custom-nav__back">
          <view class="tn-icon-set tn-color-cat" style="font-size: 50rpx;"></view>
        </view>
      </view>
    </tn-nav-bar>
    
    <view class="top-backgroup">
      <image src='https://resource.tuniaokj.com/images/my/my-bg4.png' mode='widthFix' class='backgroud-image'></image>
    </view>
    
    <view class="about__wrap" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      <!-- 用户信息 -->
      <view class="tn-flex tn-flex-row-between tn-flex-col-center tn-margin-bottom" style="margin-top: -450rpx;">
        <view class="justify-content-item">
          <view class="tn-flex tn-flex-col-center tn-flex-row-left">
            <view class="logo-pic tn-shadow">
              <view class="logo-image">
                <view class="tn-shadow-blur" :style="'background-image:url(' + (userInfo.avatar || 'https://resource.tuniaokj.com/images/avatar/default_avatar.jpg') + ');width: 110rpx;height: 110rpx;background-size: cover;'">
                </view>
              </view>
            </view>
            <view class="tn-padding-right">
              <view class="tn-padding-right tn-padding-left-sm">
                <text class="tn-color-cat tn-text-xl tn-text-bold">{{ userInfo.nickname || '各位道友' }}</text>
              </view>
              <view class="tn-padding-right tn-padding-top-xs tn-padding-left-sm tn-text-ellipsis">
                <text class="tn-color-gray">潜心修行，福慧双增</text>
              </view>
            </view>
          </view>
        </view>
        <view class="justify-content-item" @click="tn('/pages/mine/set')">
          <view class="tn-icon-right tn-color-gray"></view>
        </view>
      </view>
      
      <!-- 修行概览卡片 -->
      <view class="tn-margin-top-xl">
        <view class="button-vip tn-flex tn-flex-row-between tn-flex-col-center tn-shadow-blur" style="background: linear-gradient(-120deg, #3E445A, #31374A, #2B3042, #262B3C);">
          <view class="tn-margin-left">
            <view class='title' style="color: #F1C68E;">
              <text class="tn-text-bold tn-text-xl">{{ stats.merit }} 功德</text>
            </view>
            <view class='tn-color-white tn-text-sm tn-padding-top-sm'>当前境界：{{ stats.level_name || '初入道门' }}</view>
          </view>
          <view class="tn-margin-right">
            <tn-button shape="round" backgroundColor="#F1C68E" fontColor="#634738" padding="10rpx 0" width="160rpx" shadow @click="tn('/pages/daily/index')">
              <text class="tn-text-bold">去修持</text>
            </tn-button>
          </view>
        </view>
      </view>
      
      <!-- 常用功能菜单 -->
      <view class="about-shadow tn-margin-top-lg tn-margin-bottom-lg tn-padding-top-sm tn-padding-bottom-sm tn-bg-white">
        
        <!-- 系统设置 -->
        <tn-list-cell :hover="true" :unlined="true" :radius="true" :fontSize="30" @click="tn('/pages/mine/set')">
          <view class="tn-flex tn-flex-col-center">
            <view class="icon1__item--icon tn-flex tn-flex-row-center tn-flex-col-center" style="color: #7C8191;">
              <view class="tn-icon-set-fill"></view>
            </view>
            <view class="tn-margin-left-sm tn-flex-1">系统设置</view>
            <view class="tn-color-gray tn-icon-right"></view>
          </view>
        </tn-list-cell>

        <!-- 关于道心录 -->
        <tn-list-cell :hover="true" :unlined="true" :radius="true" :fontSize="30" @click="tn('/pages/mine/about')">
          <view class="tn-flex tn-flex-col-center">
            <view class="icon1__item--icon tn-flex tn-flex-row-center tn-flex-col-center" style="color: #7C8191;">
              <view class="tn-icon-moon-fill"></view>
            </view>
            <view class="tn-margin-left-sm tn-flex-1">关于道心录</view>
            <view class="tn-color-gray tn-icon-right"></view>
          </view>
        </tn-list-cell>
        
        <!-- 问题反馈 -->
        <tn-list-cell :hover="true" :unlined="true" :radius="true" :fontSize="30">
          <button class="tn-flex tn-flex-col-center tn-button--clear-style" open-type="feedback">
            <view class="icon1__item--icon tn-flex tn-flex-row-center tn-flex-col-center" style="color: #7C8191;">
              <view class="tn-icon-message-fill"></view>
            </view>
            <view class="tn-flex tn-flex-row-between" style="width: 100%;">
              <view class="tn-margin-left-sm">问题反馈</view>
              <view class="tn-color-gray tn-icon-right"></view>
            </view>
          </button>
        </tn-list-cell>
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
        // 获取用户信息和统计数据
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
               // 简单根据积分判断境界（实际逻辑可封装）
               const level = u.dao_profile.level || 1;
               this.stats.level_name = `第${level}重境界`;
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
  .mine{
    max-height: 100vh;
  }
  /* 底部安全边距 start*/
  .tn-tabbar-height {
  	min-height: 120rpx;
  	height: calc(140rpx + env(safe-area-inset-bottom) / 2);
    height: calc(140rpx + constant(safe-area-inset-bottom));
  }
  
  .tn-color-cat{
    color: #1D2541;
  }

  /* 自定义导航栏内容 start */
  .custom-nav {
    height: 100%;
    &__back {
      margin: auto 5rpx;
      font-size: 40rpx;
      margin-right: 10rpx;
      flex-basis: 5%;
      width: 100rpx;
      position: absolute;
    }
  }

  /* 用户头像 start */
  .logo-image {
    width: 110rpx;
    height: 110rpx;
    position: relative;
    overflow: hidden;
    border-radius: 50%;
  }

  .logo-pic {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: top;
    border: 8rpx solid rgba(255,255,255,0.05);
    box-shadow: 0rpx 0rpx 80rpx 0rpx rgba(0, 0, 0, 0.15);
    border-radius: 50%;
    overflow: hidden;
  }

  /* 页面 start*/
  .about-shadow {
    border-radius: 15rpx;
    box-shadow: 0rpx 0rpx 50rpx 0rpx rgba(0, 0, 0, 0.07);
  }

  .about__wrap {
    position: relative;
    z-index: 1;
    margin: 20rpx 30rpx;
  }
  
  .button-vip {
    width: 100%;
    height: 150rpx;
    border-radius: 15rpx;
    position: relative;
    z-index: 1;
    
    &::after {
      content: " ";
      position: absolute;
      z-index: -1;
      width: 100%;
      height: 100%;
      left: 0;
      bottom: 0;
      border-radius: inherit;
      opacity: 1;
      transform: scale(1, 1);
      background-size: 100% 100%;
      background-image: url(https://resource.tuniaokj.com/images/cool_bg_image/icon_bg.png);
    }    
  }
  
  /* 图标容器1 start */
  .icon1 {
    &__item {
      background-color: #FFFFFF;
      border-radius: 10rpx;
      padding: 30rpx;
      margin: 20rpx 10rpx;
      transform: scale(1);
      transition: transform 0.3s linear;
      transform-origin: center center;
  
      &--icon {
        width: 40rpx;
        height: 40rpx;
        font-size: 40rpx;
        border-radius: 50%;
        position: relative;
        z-index: 1;
  
        &::after {
          content: " ";
          position: absolute;
          z-index: -1;
          width: 100%;
          height: 100%;
          left: 0;
          bottom: 0;
          border-radius: inherit;
          opacity: 1;
          transform: scale(1, 1);
          background-size: 100% 100%;
          background-image: url(https://resource.tuniaokj.com/images/cool_bg_image/icon_bg.png);
        }
      }
    }
  }
  
  /* 顶部背景图 start */
  .top-backgroup {
    height: 450rpx;
    z-index: -1;
    .backgroud-image {
      width: 100%;
      height: 450rpx;
    }
  }
</style>