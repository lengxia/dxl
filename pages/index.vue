<template>
  <view class="start-index">
    <view v-if="tabberPageLoadFlag[0]" :style="{display: currentIndex === 0 ? '' : 'none'}">
      <scroll-view class="custom-tabbar-page" scroll-y enable-back-to-top @scrolltolower="tabbarPageScrollLower">
        <Home ref="home"></Home>
      </scroll-view>
    </view>
    <view v-if="tabberPageLoadFlag[1]" :style="{display: currentIndex === 1 ? '' : 'none'}">
      <scroll-view class="custom-tabbar-page" scroll-y enable-back-to-top @scrolltolower="tabbarPageScrollLower">
        <Mine ref="mine"></Mine>
      </scroll-view>
    </view>
    
    <tn-tabbar
      v-model="currentIndex"
      :list="tabbarList"
      activeColor="#3D8B8F"
      inactiveColor="#B2BEC3"
      activeIconColor="#3D8B8F"
      :animation="true"
      :safeAreaInsetBottom="true"
      @change="switchTabbar"
    ></tn-tabbar>

    <!-- 首次启动欢迎弹窗 -->
    <tn-modal 
      v-model="showWelcomeModal" 
      :custom="true" 
      :showCloseBtn="false" 
      padding="0"
      width="600rpx"
      radius="24"
    >
      <view class="welcome-modal">
        <view class="welcome-bg">
          <view class="welcome-icon">
            <text class="tn-icon-moon-fill"></text>
          </view>
        </view>
        <view class="welcome-content">
          <view class="welcome-title">欢迎使用道心录</view>
          <view class="welcome-desc">
            道不远人，勤修不辍。<br/>
            开启您的每日修行之旅。
          </view>
          <tn-button 
            shape="round" 
            backgroundColor="#3D8B8F" 
            fontColor="#FFFFFF" 
            width="100%"
            height="90rpx"
            shadow
            @click="confirmWelcome"
          >
            立即开启
          </tn-button>
        </view>
      </view>
    </tn-modal>
  </view>
</template>

<script>
  import Home from './home/home.vue'
  import Mine from './mine/index.vue'
  
  export default {
    components: {
      Home,
      Mine
    },
    data() {
      return {
        // 底部tabbar菜单数据
        tabbarList: [
          {
            title: '首页',
            activeIcon: 'home-smile-fill',
            inactiveIcon: 'home-smile'
          },
          {
            title: '我的',
            activeIcon: 'my-fill',
            inactiveIcon: 'my'
          }
        ],
        // tabbar当前被选中的序号
        currentIndex: 0,
        // 自定义底栏对应页面的加载情况
        tabberPageLoadFlag: [],
        showWelcomeModal: false
      }
    },
    onLoad(options) {
      console.log('index.vue onLoad - options:', options);
      const index = Number(options.index || 0)
      // 根据底部tabbar菜单列表设置对应页面的加载情况
      this.tabberPageLoadFlag = this.tabbarList.map((item, tabbar_index) => {
        return index === tabbar_index
      })
      this.switchTabbar(index)
      
      // #ifdef MP-WEIXIN
      // 检查是否需要显示授权引导
      const hasShownAuthGuide = uni.getStorageSync('has_shown_auth_guide');
      const localToken = uni.getStorageSync('uni_id_token');
      
      // 首次启动且未登录，显示欢迎弹窗
      if (!hasShownAuthGuide && !localToken) {
        this.showWelcomeModal = true;
      }
      // #endif
    },
    onShow() {
      // Mine组件会自我管理登录逻辑
    },
    methods: {
      // 切换导航
      switchTabbar(index) {
        this._switchTabbarPage(index)
      },
      
      // 瀑布流导航页面滚动到底部
      tabbarPageScrollLower(e) {
      },
      
      // 切换导航页面
      _switchTabbarPage(index) {
        const selectPageFlag = this.tabberPageLoadFlag[index]
        if (selectPageFlag === undefined) {
          return
        }
        if (selectPageFlag === false) {
          this.tabberPageLoadFlag[index] = true
        }
        this.currentIndex = index
      },
      
      // 确认欢迎引导
      confirmWelcome() {
        this.showWelcomeModal = false;
        uni.setStorageSync('has_shown_auth_guide', true);
        uni.setStorageSync('need_immediate_auth', true);
        
        // 跳转到个人中心
        if (this.currentIndex !== 1) {
          this.switchTabbar(1);
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .start-index {
    background-color: #F7F5F0;
  }
  
  .custom-tabbar-page {
    height: calc(100vh - env(safe-area-inset-bottom) - 100rpx);
  }
  
  // 欢迎弹窗样式
  .welcome-modal {
    .welcome-bg {
      height: 200rpx;
      background: linear-gradient(135deg, #3D8B8F, #5AABAD);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .welcome-icon {
        width: 100rpx;
        height: 100rpx;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        text {
          font-size: 50rpx;
          color: #FFFFFF;
        }
      }
    }
    
    .welcome-content {
      padding: 50rpx 40rpx;
      text-align: center;
      
      .welcome-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #2D3436;
        margin-bottom: 20rpx;
      }
      
      .welcome-desc {
        font-size: 28rpx;
        color: #636E72;
        line-height: 1.6;
        margin-bottom: 50rpx;
      }
    }
  }
</style>