<template>
  <tn-popup v-model="visible" mode="bottom" :borderRadius="24" :safeAreaInsetBottom="true">
    <view class="profile-update-box">
      <view class="profile-header">
        <view class="profile-title">完善修行档案</view>
        <view class="profile-desc">请设置您的头像和道号</view>
      </view>

      <view class="profile-form">
        <!-- 头像选择 -->
        <view class="avatar-choose-box">
          <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image :src="tempAvatar || currentAvatar || '/static/logo.png'" class="temp-avatar" mode="aspectFill" />
            <view class="camera-icon">
              <text class="tn-icon-camera-fill"></text>
            </view>
          </button>
          <view class="input-tip">点击图标选择头像</view>
        </view>

        <!-- 昵称输入 -->
        <view class="nickname-box">
          <view class="input-label">道号</view>
          <input type="nickname" class="nickname-input" placeholder="请输入您的道号" v-model="tempNickname"
            @blur="onNicknameBlur" @change="onNicknameChange" />
        </view>

        <!-- 提交按钮 -->
        <button class="submit-btn" @click="submitProfile" :loading="submitting">
          确认开启修行
        </button>
      </view>
    </view>
  </tn-popup>
</template>

<script>
import { updateUserProfile } from '@/libs/auth'

export default {
  name: 'ProfilePopup',
  props: {
    // 双向绑定显示状态
    value: {
      type: Boolean,
      default: false
    },
    // 当前头像
    currentAvatar: {
      type: String,
      default: ''
    },
    // 当前昵称
    currentNickname: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      tempAvatar: '',
      tempNickname: '',
      submitting: false
    }
  },
  watch: {
    value(val) {
      this.visible = val
      if (val) {
        // 打开时初始化数据
        this.tempAvatar = this.currentAvatar || ''
        this.tempNickname = this.currentNickname || ''
      }
    },
    visible(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    // 昵称输入框失焦回调
    onNicknameBlur(e) {
      this.tempNickname = e.detail.value
    },

    onNicknameChange(e) {
      this.tempNickname = e.detail.value
    },

    // 选择头像回调
    async onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      if (!avatarUrl) return

      this.tempAvatar = avatarUrl // 先显示临时路径

      // 立即上传
      uni.showLoading({
        title: '上传头像中...'
      })
      try {
        const result = await uniCloud.uploadFile({
          filePath: avatarUrl,
          cloudPath: `avatar/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`
        })

        this.tempAvatar = result.fileID // 更新为云端路径
        uni.hideLoading()
      } catch (err) {
        uni.hideLoading()
        uni.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        })
      }
    },

    // 提交个人资料
    async submitProfile() {
      if (!this.tempNickname) {
        uni.showToast({
          title: '请输入道号',
          icon: 'none'
        })
        return
      }
      if (!this.tempAvatar) {
        uni.showToast({
          title: '请选择头像',
          icon: 'none'
        })
        return
      }

      this.submitting = true

      try {
        await updateUserProfile({
          nickname: this.tempNickname,
          avatar: this.tempAvatar
        })

        this.visible = false
        uni.showToast({
          title: '资料完善成功',
          icon: 'success'
        })
        
        // 通知父组件更新成功
        this.$emit('success')

      } catch (e) {
        uni.showToast({
          title: e.message || '保存失败，请重试',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 道心录配色
$primary: #3D8B8F;
$primary-light: #5AABAD;
$text: #2D3436;
$text-secondary: #636E72;
$text-hint: #B2BEC3;

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
          box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);

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