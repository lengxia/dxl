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
              {{ isLoggingIn ? '登录中...' : (userInfo.nickname || '点击登录') }}
            </view>
            <view class="user-motto" v-if="!isAnonymous && !isLoggingIn">潜心修行，福慧双增</view>
            <view class="user-motto wechat-login-btn" v-else-if="!isLoggingIn" @click="handleWechatAuth()">
              <text class="tn-icon-wechat" style="margin-right: 10rpx;"></text>
              点击登录同步数据
            </view>
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

    <!-- 完善资料弹窗 -->
    <tn-popup v-model="showProfileUpdate" mode="bottom" :borderRadius="24" :safeAreaInsetBottom="true">
      <view class="profile-update-box">
        <view class="profile-header">
          <view class="profile-title">完善修行档案</view>
          <view class="profile-desc">请设置您的头像和道号</view>
        </view>
        
        <view class="profile-form">
          <!-- 头像选择 -->
          <view class="avatar-choose-box">
          <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
              <image 
                :src="tempAvatar || userInfo.avatar || '/static/logo.png'" 
                class="temp-avatar" 
                mode="aspectFill"
              />
              <view class="camera-icon">
                <text class="tn-icon-camera-fill"></text>
              </view>
            </button>
            <view class="input-tip">点击图标选择头像</view>
          </view>
          
          <!-- 昵称输入 -->
          <view class="nickname-box">
            <view class="input-label">道号</view>
            <input 
              type="nickname" 
              class="nickname-input" 
              placeholder="请输入您的道号" 
              v-model="tempNickname"
              @blur="onNicknameBlur"
              @change="onNicknameChange"
            />
          </view>
          
          <!-- 提交按钮 -->
          <button class="submit-btn" @click="submitProfile" :loading="submitting">
            确认开启修行
          </button>
        </view>
      </view>
    </tn-popup>

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
        },
        isAnonymous: false,
        showAuthGuide: false,
        showProfileUpdate: false,
        tempAvatar: '',
        tempNickname: '',
        submitting: false,
        isLoggingIn: false
      }
    },
    computed: {
      vuexUser() {
        return this.$store.state.vuex_user || {};
      }
    },
    watch: {
      // 监听 Vuex 用户数据变化，实时更新页面显示
      vuexUser: {
        handler(newVal) {
          console.log('Mine页面监听到Vuex用户数据变化:', newVal);
          if (newVal && newVal.nickname) {
            this.userInfo.nickname = newVal.nickname;
            this.userInfo.avatar = newVal.avatar || '';
            this.isAnonymous = false;
          }
        },
        deep: true,
        immediate: true
      }
    },
    onShow() {
      console.log('Mine onShow 触发');
      // #ifdef MP-WEIXIN
      // 检查登录状态
      const token = uni.getStorageSync('uni_id_token');
      if (!token) {
        // 未登录，尝试静默登录
        console.log('Mine页面：未登录，尝试静默登录...');
        this.handleWechatAuth(true); // true 表示是静默模式，不显示loading
      } else {
        // 已登录，加载数据
        console.log('Mine页面：Token存在，检查状态并加载数据');
        this.checkLoginStatus();
        this.loadUserInfo();
      }
      // #endif
      
      // #ifndef MP-WEIXIN
      this.checkLoginStatus();
      this.loadUserInfo();
      // #endif
    },
    methods: {
      tn(e) {
        uni.navigateTo({
          url: e,
        });
      },
      // 已废弃，保留空函数以防其他组件调用报错
      handleAuthGuide() {
        // do nothing
      },
      // 检查登录状态
      checkLoginStatus() {
        const token = uni.getStorageSync('uni_id_token');
        
        if (!token) {
          // 没有 token，显示未登录状态
          this.userInfo.nickname = '点击登录';
          this.userInfo.avatar = '';
          this.isAnonymous = true;
        } else {
          // 有 token，检查 Vuex 中的用户信息
          if (this.vuexUser && this.vuexUser.nickname) {
            this.userInfo.nickname = this.vuexUser.nickname;
            this.userInfo.avatar = this.vuexUser.avatar || '';
            this.isAnonymous = false;
          } else {
            // 有 token 但 Vuex 没有用户信息，可能是异常状态
            this.userInfo.nickname = '未知用户';
            this.userInfo.avatar = '';
            this.isAnonymous = true;
          }
        }
      },
      // 处理头像点击（微信小程序可以选择头像）
      handleAvatarClick() {
        // #ifdef MP-WEIXIN
        if (this.isAnonymous) {
          this.handleWechatAuth();
          return;
        }
        
        // 已登录用户可以更换头像
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            this.uploadAvatar(res.tempFilePaths[0]);
          }
        });
        // #endif
      },
      // 上传头像
      async uploadAvatar(filePath) {
        uni.showLoading({ title: '上传中...' });
        
        try {
          const result = await uniCloud.uploadFile({
            filePath: filePath,
            cloudPath: `avatar/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`
          });
          
          // 更新到数据库
          // 优先从 uniCloud 获取用户ID，如果没有再从本地存储获取
          let uid = uniCloud.getCurrentUserInfo().uid || uni.getStorageSync('uni_id_user_uid');
          if (!uid) {
            uni.hideLoading();
            uni.showToast({ title: '请重新登录', icon: 'none' });
            return;
          }
          
          // 使用 water-api 云对象更新头像
          const waterApi = uniCloud.importObject('water-api');
          await waterApi.updateUserInfo({
            uid: uid,
            data: {
              avatar: result.fileID
            }
          });
          
          this.userInfo.avatar = result.fileID;
          
          // 更新Vuex
          this.$store.commit('$tStore', {
            name: 'vuex_user',
            value: {
              ...this.vuexUser,
              avatar: result.fileID
            }
          });
          
          uni.hideLoading();
          uni.showToast({ title: '头像更新成功', icon: 'success' });
        } catch(e) {
          uni.hideLoading();
          console.error('上传头像失败', e);
          uni.showToast({ title: '上传失败', icon: 'none' });
        }
      },
      // 微信授权登录
      async handleWechatAuth(isSilent = false) {
        // #ifdef MP-WEIXIN
        if (!isSilent) {
          uni.showLoading({ title: '登录中...' });
        }
        
        try {
          // 1. 获取微信code
          const loginRes = await new Promise((resolve, reject) => {
            uni.login({
              provider: 'weixin',
              onlyAuthorize: true,
              success: resolve,
              fail: reject
            });
          });
          
          // 2. 调用云对象进行登录
          const uniIdCo = uniCloud.importObject("uni-id-co", {
            customUI: true
          })
          const loginResult = await uniIdCo.loginByWeixin({
            code: loginRes.code
          })

          if (loginResult.token) {
             uni.setStorageSync('uni_id_token', loginResult.token)
             if (loginResult.tokenExpired) {
               uni.setStorageSync('uni_id_token_expired', loginResult.tokenExpired)
             }
             
             // 获取用户ID并添加到 userInfo 中
             const uid = loginResult.uid || uniCloud.getCurrentUserInfo().uid;
             const userInfoWithUid = {
               ...loginResult.userInfo,
               uid: uid
             };
             
             this.updateLocalUser(userInfoWithUid);
          }
          
          uni.hideLoading();
          
          // 增加 userInfo 的空值检查
          const userInfo = loginResult.userInfo || {};
          const isDefaultNickname = !userInfo.nickname || 
                                    userInfo.nickname.indexOf('微信用户') > -1 ||
                                    userInfo.nickname === '修行者';
          const isNoAvatar = !userInfo.avatar;
          
          if (loginResult.type === 'register' || isDefaultNickname || isNoAvatar) {
            this.showProfileUpdate = true;
          } else {
            uni.showToast({ title: '登录成功', icon: 'success' });
          }
          
          // 重新加载完整数据
          setTimeout(() => {
            this.loadUserInfo();
          }, 500);
          
        } catch(e) {
          uni.hideLoading();
          console.error('微信授权失败:', e);
          uni.showToast({ title: e.message || '登录失败，请重试', icon: 'none' });
        }
        // #endif
        
        // #ifndef MP-WEIXIN
        uni.showToast({ title: '仅支持微信小程序', icon: 'none' });
        // #endif
      },

      // 辅助方法：更新本地用户状态
      updateLocalUser(user) {
        // 保存用户ID到本地存储，供loadUserInfo使用
        const uidToSave = user.uid || user._id;
        if (uidToSave) {
          uni.setStorageSync('uni_id_user_uid', uidToSave);
        }
        
        // 更新Vuex
        this.$store.commit('$tStore', {
          name: 'vuex_user',
          value: {
            uid: uidToSave,
            nickname: user.nickname,
            avatar: user.avatar,
            isAnonymous: false
          }
        });
        
        // 更新本地显示
        this.userInfo.nickname = user.nickname || '修行者';
        this.userInfo.avatar = user.avatar || '';
        this.isAnonymous = false;
        
        // 如果有暂存的头像/昵称，也可以回填
        if (user.avatar) this.tempAvatar = user.avatar;
        if (user.nickname) this.tempNickname = user.nickname;
      },

      // 选择头像回调
      async onChooseAvatar(e) {
        const { avatarUrl } = e.detail;
        if (!avatarUrl) return;
        
        this.tempAvatar = avatarUrl; // 先显示临时路径
        
        // 立即上传
        uni.showLoading({ title: '上传头像中...' });
        try {
          const result = await uniCloud.uploadFile({
            filePath: avatarUrl,
            cloudPath: `avatar/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`
          });
          
          this.tempAvatar = result.fileID; // 更新为云端路径
          uni.hideLoading();
        } catch (err) {
          uni.hideLoading();
          console.error('头像上传失败', err);
          uni.showToast({ title: '上传失败，请重试', icon: 'none' });
        }
      },

      // 昵称输入框失焦回调
      onNicknameBlur(e) {
        this.tempNickname = e.detail.value;
      },
      
      onNicknameChange(e) {
        this.tempNickname = e.detail.value;
      },

      // 提交个人资料 - 通过云函数更新避免权限问题
      async submitProfile() {
        if (!this.tempNickname) {
          uni.showToast({ title: '请输入道号', icon: 'none' });
          return;
        }
        if (!this.tempAvatar) {
          uni.showToast({ title: '请选择头像', icon: 'none' });
          return;
        }
        
        this.submitting = true;
        
        try {
          // 获取用户ID
          const uid = uniCloud.getCurrentUserInfo().uid || uni.getStorageSync('uni_id_user_uid');
          
          if (!uid) {
            throw new Error('未获取到用户ID，请重新登录');
          }

          // 改用 water-api 更新，避免 uni-id-co 的上下文丢失问题
          const waterApi = uniCloud.importObject('water-api');
          const result = await waterApi.updateUserInfo({
            uid: uid,
            data: {
              nickname: this.tempNickname,
              avatar: this.tempAvatar
            }
          });
          
          if (result.errCode !== 0) {
            throw new Error(result.errMsg || '更新失败');
          }
          
          // 更新本地用户状态
          this.updateLocalUser({
            uid: uid,
            nickname: this.tempNickname,
            avatar: this.tempAvatar
          });
          
          this.showProfileUpdate = false;
          uni.showToast({ title: '资料完善成功', icon: 'success' });
          
          // 刷新数据
          this.loadUserInfo();
          
        } catch (e) {
          console.error('更新资料失败', e);
          uni.showToast({ title: '保存失败，请重试', icon: 'none' });
        } finally {
          this.submitting = false;
        }
      },
      async loadUserInfo() {
        // 检查是否真正登录（有有效的 token）
        const token = uni.getStorageSync('uni_id_token');
        if (!token) {
          console.log('未登录，跳过数据加载');
          return;
        }
        
        // 优先从 uniCloud 获取用户ID，如果没有再从本地存储获取
        const currentUid = uniCloud.getCurrentUserInfo().uid;
        const storageUid = uni.getStorageSync('uni_id_user_uid');
        let uid = currentUid || storageUid;
        
        if (!uid) {
          return;
        }

        // 如果从 getCurrentUserInfo 获取到了 uid，保存到本地存储
        if (currentUid && !storageUid) {
          uni.setStorageSync('uni_id_user_uid', uid);
        }

        try {
           // 使用 water-api 云对象获取用户信息
           const waterApi = uniCloud.importObject('water-api');
           const res = await waterApi.getUserInfo({ uid: uid });
           
           if(res.errCode === 0 && res.data) {
             const u = res.data;
             this.userInfo.nickname = u.nickname || '修行者';
             this.userInfo.avatar = u.avatar || '';
             if(u.dao_profile) {
               this.stats.merit = u.dao_profile.total_merit || 0;
               const level = u.dao_profile.level || 1;
               this.stats.level = level;
               const levelNames = ['初入道门', '筑基初成', '开光境界', '融合之境', '心动大成', '金丹圆满'];
               this.stats.level_name = levelNames[Math.min(level - 1, levelNames.length - 1)] || '初入道门';
             }
           } else {
             // 清理无效的登录状态
             uni.removeStorageSync('uni_id_token');
             uni.removeStorageSync('uni_id_token_expired');
             uni.removeStorageSync('uni_id_user_uid');
             this.isAnonymous = true;
           }
        } catch(e) {
          console.error('获取用户信息失败', e);
          // 如果是匿名身份错误，清除token
          if (e.message && e.message.indexOf('匿名') > -1) {
            uni.removeStorageSync('uni_id_token');
            uni.removeStorageSync('uni_id_token_expired');
            uni.removeStorageSync('uni_id_user_uid');
            this.isAnonymous = true;
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
  // 授权引导卡片
  .auth-guide-card {
    background: linear-gradient(135deg, #07C160, #00B048);
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
      color: #FFFFFF;
      font-size: 56rpx;
    }
  }
  
  .auth-guide-text {
    flex: 1;
    
    .auth-guide-title {
      font-size: 34rpx;
      font-weight: bold;
      color: #FFFFFF;
      margin-bottom: 8rpx;
    }
    
    .auth-guide-desc {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.5;
    }
  }
  
  .auth-guide-btn {
    background: #FFFFFF;
    color: #07C160;
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
    
    &.wechat-login-btn {
      display: flex;
      align-items: center;
      color: #07C160;
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

  // 完善资料弹窗
  .profile-update-box {
    padding: 50rpx 40rpx;
    background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%);
    border-radius: 32rpx 32rpx 0 0;
    
    .profile-header {
      text-align: center;
      margin-bottom: 60rpx;
      
      .profile-title {
        font-size: 40rpx;
        font-weight: bold;
        color: $text;
        margin-bottom: 16rpx;
        letter-spacing: 2rpx;
      }
      
      .profile-desc {
        font-size: 28rpx;
        color: $text-secondary;
        opacity: 0.8;
      }
    }
    
    .profile-form {
      padding: 0 10rpx;
      
      .avatar-choose-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 60rpx;
        
        .avatar-btn {
          width: 180rpx;
          height: 180rpx;
          padding: 0;
          background: none;
          border-radius: 50%;
          position: relative;
          transition: all 0.3s ease;
          
          &::after {
            border: none;
          }
          
          &:active {
            transform: scale(0.95);
          }
          
          .temp-avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 8rpx solid #FFFFFF;
            box-shadow: 0 20rpx 40rpx rgba(61, 139, 143, 0.15);
          }
          
          .camera-icon {
            position: absolute;
            bottom: 6rpx;
            right: 6rpx;
            width: 56rpx;
            height: 56rpx;
            background: linear-gradient(135deg, $primary, $primary-light);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 4rpx solid #FFFFFF;
            box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
            
            text {
              color: #FFFFFF;
              font-size: 30rpx;
            }
          }
        }
        
        .input-tip {
          font-size: 26rpx;
          color: $text-hint;
          margin-top: 24rpx;
        }
      }
      
      .nickname-box {
        margin-bottom: 70rpx;
        background: #FFFFFF;
        border-radius: 24rpx;
        padding: 30rpx 40rpx;
        display: flex;
        align-items: center;
        box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.03);
        border: 2rpx solid transparent;
        transition: all 0.3s;
        
        &:focus-within {
          border-color: rgba(61, 139, 143, 0.3);
          box-shadow: 0 8rpx 30rpx rgba(61, 139, 143, 0.08);
        }
        
        .input-label {
          font-size: 30rpx;
          color: $text;
          font-weight: 600;
          margin-right: 40rpx;
          min-width: 80rpx;
        }
        
        .nickname-input {
          flex: 1;
          height: 60rpx;
          font-size: 30rpx;
          color: $text;
        }
      }
      
      .submit-btn {
        background: linear-gradient(135deg, $primary, $primary-light);
        color: #FFFFFF;
        font-size: 34rpx;
        font-weight: bold;
        height: 100rpx;
        line-height: 100rpx;
        border-radius: 50rpx;
        box-shadow: 0 20rpx 40rpx rgba(61, 139, 143, 0.25);
        letter-spacing: 4rpx;
        
        &:active {
          transform: scale(0.98);
          box-shadow: 0 10rpx 20rpx rgba(61, 139, 143, 0.2);
        }
      }
    }
  }
</style>
