<template>
  <view class="about-page tn-safe-area-inset-bottom">
    <!-- 顶部自定义导航 -->
    <tn-nav-bar fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class='tn-custom-nav-bar__back' @click="goBack">
        <text class='icon tn-icon-left tn-color-black'></text>
        <text class='icon tn-icon-home-capsule-fill tn-color-black'></text>
      </view>
    </tn-nav-bar>
    
    <view class="tn-margin-top-xl tn-padding-top-xl" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      
      <!-- 品牌Logo区域 -->
      <view class="tn-flex tn-flex-col-center tn-flex-row-center tn-margin-top-xl">
        <view class="logo-box tn-shadow-lg tn-flex tn-flex-col-center tn-flex-row-center">
          <!-- 暂用图标代替，后续可替换为项目Logo -->
          <text class="tn-icon-moon-fill tn-text-xxl tn-color-white" style="font-size: 80rpx;"></text>
        </view>
      </view>
      
      <!-- 应用名称与版本 -->
      <view class="tn-text-center tn-margin-top-lg">
        <view class="tn-text-xxl tn-text-bold">道心录</view>
        <view class="tn-text-sm tn-color-gray tn-margin-top-xs">v1.0.0</view>
      </view>

      <!-- 简介卡片 -->
      <view class="tn-margin-xl tn-padding tn-bg-white tn-radius tn-shadow-sm">
        <view class="tn-text-center tn-text-bold tn-text-lg tn-margin-bottom">初心</view>
        <view class="tn-text-df tn-color-gray--dark" style="line-height: 1.8; text-align: justify;">
          “道心录”是一款专注于个人修行管理的工具。
          <br/><br/>
          我们致力于帮助每一位修行者记录每日功课、检视起心动念、规划修行路径、记录感悟心得。
          <br/><br/>
          愿此工具能助您日日精进，修得圆满智慧。
        </view>
      </view>

      <!-- 底部版权 -->
      <view class="tn-text-center tn-margin-top-xl tn-padding-bottom-xl">
        <view class="tn-text-xs tn-color-gray">
          Copyright © 2024 DaoXinLu
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
  .about-page {
    min-height: 100vh;
    background-color: #F8F8F8;
  }
  
  .tn-custom-nav-bar__back {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    box-sizing: border-box;
    background-color: transparent;
    border-radius: 1000rpx;
    border: 1rpx solid transparent;
    font-size: 18px;
    
    .icon {
      display: block;
      flex: 1;
      margin: auto;
      text-align: center;
    }
  }
  
  .logo-box {
    width: 180rpx;
    height: 180rpx;
    background: linear-gradient(135deg, #01BEFF, #43e97b);
    border-radius: 40rpx;
  }
</style>