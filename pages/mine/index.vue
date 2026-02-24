<template>
  <view class="mine-page tn-safe-area-inset-bottom">
    <!-- 顶部自定义导航 -->
    <tn-nav-bar
      :isBack="false"
      :bottomShadow="false"
      backgroundColor="transparent"
    >
      <view class="custom-nav" @click="tn('/pages/mine/set')">
        <view class="nav-icon">
          <text
            class="tn-icon-set"
            style="font-size: 44rpx; color: #ffffff"
          ></text>
        </view>
      </view>
    </tn-nav-bar>

    <!-- 顶部背景 -->
    <view class="header-bg">
      <view class="header-pattern"></view>
    </view>

    <view
      class="page-content"
      :style="{ paddingTop: vuex_custom_bar_height + 'px' }"
    >
      <!-- 用户信息卡片 -->
      <view class="user-section">
        <view class="user-card">
          <view class="avatar-wrapper" @click="handleAvatarClick">
            <view class="avatar-ring">
              <image
                :src="userInfo.avatar || '/static/logo.png'"
                class="avatar-image"
                mode="aspectFill"
              />
            </view>
            <view class="level-badge">Lv.{{ stats.level }}</view>
          </view>

          <view class="user-info">
            <view class="user-name" @click="handleWechatAuth()">
              {{ isAnonymous ? "点击登录" : userInfo.nickname }}
            </view>
            <view class="user-motto" v-if="!isAnonymous"
              >潜心修行，福慧双增</view
            >
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
              <text
                class="tn-icon-right"
                style="margin-left: 8rpx; font-size: 24rpx"
              ></text>
            </view>
          </view>
          <view class="merit-decoration"></view>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="menu-section">
        <view class="menu-card">
          <view class="menu-item" @click="tn('/pages/mine/set')">
            <view
              class="menu-icon"
              style="background: linear-gradient(135deg, #3d8b8f, #5aabad)"
            >
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
            <view
              class="menu-icon"
              style="background: linear-gradient(135deg, #c9a86c, #d4b87a)"
            >
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
            <view
              class="menu-icon"
              style="background: linear-gradient(135deg, #e07a5f, #f09a7f)"
            >
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

    <view class="tn-tabbar-height"></view>

    <!-- 完善资料弹窗 -->
    <profile-popup
      v-model="showProfileUpdate"
      :current-avatar="userInfo.avatar"
      :current-nickname="userInfo.nickname"
      @success="onProfileUpdated"
    ></profile-popup>
  </view>
</template>

<script>
import { checkLogin, getCurrentUid, loginByWeixin } from "@/libs/auth";
import { LEVEL_NAMES } from "@/common/constants";
import ProfilePopup from "./components/profile-popup.vue";

export default {
  name: "Mine",
  components: {
    ProfilePopup,
  },
  data() {
    return {
      userInfo: {
        nickname: "",
        avatar: "",
      },
      stats: {
        merit: 0,
        level: 1,
        level_name: LEVEL_NAMES[0],
      },
      isAnonymous: true,
      isLogin: false, // 添加登录状态
      _lastUserId: null, // 记录上次加载的用户ID，防止重复加载
      showProfileUpdate: false,
    };
  },
  onShow() {
    // 每次显示时更新登录状态
    this.isLogin = checkLogin();
  },
  computed: {
    vuexUser() {
      return this.$store.state.vuex_user || {};
    },
  },
  watch: {
    // 监听 Vuex 用户数据变化，使用 _lastUserId 防止重复加载
    vuexUser: {
      handler(newVal) {
        // 只在用户 ID 变化时更新，避免重复调用
        if (newVal && newVal._id !== this._lastUserId) {
          this._lastUserId = newVal._id;
          this.loadUserInfo(newVal);
        }
      },
      deep: false, // 关闭深度监听，改用 ID 判断
      immediate: true,
    },
  },
  mounted() {},
  methods: {
    // 供父组件调用的显示生命周期
    componentShow() {
      this.isLogin = checkLogin();
    },
    tn(e) {
      uni.navigateTo({
        url: e,
        fail: (err) => {
          // 如果navigateTo失败（通常是因为目标是tabbar页面），尝试switchTab
          if (err.errMsg && err.errMsg.indexOf("tabbar") > -1) {
            uni.switchTab({
              url: e,
            });
          }
        },
      });
    },
    // 处理头像点击
    handleAvatarClick() {
      // 使用 mixin 提供的 isLogin 属性判断登录状态
      if (!this.isLogin) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }
      // 唤起完善资料弹窗
      this.showProfileUpdate = true;
    },

    // 资料更新回调
    onProfileUpdated() {
      // updateUserProfile 已触发自动同步，Vuex watch 会自动更新视图
      // 无需额外操作
    },

    // 微信授权登录
    async handleWechatAuth(isSilent = false) {
      // 使用 mixin 提供的 isLogin 属性判断登录状态
      if (this.isLogin) {
        return;
      }
      const { success, result, error } = await loginByWeixin(isSilent);
      if (success) {
        const userInfo = result.userInfo || {};
        // 增加 userInfo 的空值检查
        const isDefaultNickname =
          !userInfo.nickname ||
          userInfo.nickname.indexOf("微信用户") > -1 ||
          userInfo.nickname === "修行者";
        const isNoAvatar = !userInfo.avatar;

        if (result.type === "register" || isDefaultNickname || isNoAvatar) {
          this.showProfileUpdate = true;
        }
        // 刷新数据
        this.loadUserInfo(userInfo);
      } else {
        if (!isSilent) {
          uni.showToast({
            title: error?.message || "登录失败",
            icon: "none",
          });
        }
      }
    },
    async loadUserInfo(user) {
      this.userInfo.nickname = user.nickname;
      this.userInfo.avatar = user.avatar || "";
      this.isAnonymous = user.isAnonymous;
      if (user.dao_profile) {
        this.stats.merit = user.dao_profile.total_merit || 0;
        const level = user.dao_profile.level || 1;
        this.stats.level = level;
        this.stats.level_name =
          LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] ||
          LEVEL_NAMES[0];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// 道心录配色
$primary: #3d8b8f;
$primary-light: #5aabad;
$primary-dark: #2a6366;
$accent: #c9a86c;
$accent-light: #e8d4a8;
$warm: #e07a5f;
$bg: #f7f5f0;
$card-bg: #fffefb;
$text: #2d3436;
$text-secondary: #636e72;
$text-hint: #b2bec3;

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
  justify-content: flex-start;
  padding-left: 40rpx;
  padding-top: 20rpx;
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
// 授权引导卡片
.auth-guide-card {
  background: linear-gradient(135deg, #07c160, #00b048);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 40rpx rgba(7, 193, 96, 0.3);
  animation: slideDown 0.5s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-guide-content {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.auth-guide-icon {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;

  text {
    color: #ffffff;
    font-size: 56rpx;
  }
}

.auth-guide-text {
  flex: 1;

  .auth-guide-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 8rpx;
  }

  .auth-guide-desc {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;
  }
}

.auth-guide-btn {
  background: #ffffff;
  color: #07c160;
  font-size: 30rpx;
  font-weight: bold;
  padding: 24rpx;
  border-radius: 50rpx;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);

  &:active {
    transform: scale(0.98);
  }
}

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
  background: linear-gradient(135deg, $accent, #d4b87a);
  color: #ffffff;
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

    &.wechat-login-btn {
      display: flex;
      align-items: center;
      color: #07c160;
      font-weight: 500;
    }
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
  background: linear-gradient(135deg, #2d3436 0%, #434a4d 100%);
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
  background: linear-gradient(135deg, $accent, #d4b87a);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;

  text {
    color: #ffffff;
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
  background: linear-gradient(135deg, $accent, #d4b87a);
  color: #2d3436;
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
  padding: 30rpx; // 恢复与其他 item 一致的 padding
  margin: 0;
  line-height: inherit;
  border-radius: 0;

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
    color: #ffffff;
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
  background: #f0f0f0;
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
