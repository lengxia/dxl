<template>
  <view class="avatar-page">
    <!-- 顶部导航 -->
    <tn-nav-bar fixed customBack backgroundColor="transparent" :bottomShadow="false">
      <view slot="back" class="nav-back" @click="goBack">
        <view class="back-btn">
          <text class="tn-icon-left"></text>
        </view>
      </view>
      <view class="nav-title">上传头像</view>
      <view slot="right" class="nav-right" @click="saveAvatar" v-if="cropperImageUrl">
        <text>保存</text>
      </view>
    </tn-nav-bar>
    
    <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      <!-- 选择图片按钮 -->
      <view class="action-bar">
        <view class="action-btn" @click="chooseImage">
          <text class="tn-icon-image"></text>
          <text>选择图片</text>
        </view>
        <view class="action-btn secondary" @click="switchBorderRect" v-if="imageUrl">
          <text class="tn-icon-refresh"></text>
          <text>{{ isRound ? '方形裁剪' : '圆形裁剪' }}</text>
        </view>
      </view>
      
      <!-- 提示文字 -->
      <view class="tips" v-if="!imageUrl">
        <view class="tips-icon">
          <text class="tn-icon-camera"></text>
        </view>
        <text class="tips-text">点击上方按钮选择一张图片</text>
        <text class="tips-hint">支持从相册选择或拍照</text>
      </view>
    </view>
    
    <!-- 裁剪组件 -->
    <tn-cropper
      :imageUrl="imageUrl"
      :isRound="isRound"
      @cropper="cropperFinish"
    ></tn-cropper>
    
    <!-- 预览弹窗 -->
    <tn-popup
      v-model="showCropperImage"
      :marginTop="vuex_custom_bar_height"
      length="80%"
      mode="center"
      :closeBtn="true"
      :maskClosable="true"
    >
      <view class="preview-popup">
        <view class="preview-title">预览效果</view>
        <view class="preview-image-box">
          <image :src="cropperImageUrl" class="preview-image" :class="isRound ? 'round' : ''" mode="aspectFit"></image>
        </view>
        <view class="preview-actions">
          <view class="preview-btn cancel" @click="showCropperImage = false">
            <text>重新裁剪</text>
          </view>
          <view class="preview-btn confirm" @click="confirmUpload">
            <text>确认上传</text>
          </view>
        </view>
      </view>
    </tn-popup>
  </view>
</template>

<script>
  export default {
    name: 'AvatarUpload',
    data() {
      return {
        imageUrl: '',
        isRound: true,
        showCropperImage: false,
        cropperImageUrl: ''
      }
    },
    onLoad() {
      this.updateCustomBarInfo()
    },
    methods: {
      goBack() {
        const pages = getCurrentPages()
        if (pages && pages.length > 0) {
          const firstPage = pages[0]
          if (pages.length == 1 && (!firstPage.route || firstPage.route != 'pages/index')) {
            uni.reLaunch({
              url: '/pages/index'
            })
          } else {
            uni.navigateBack({
              delta: 1
            })
          }
        } else {
          uni.reLaunch({
            url: '/pages/index'
          })
        }
      },
      async updateCustomBarInfo() {
        let customBarHeight = this.vuex_custom_bar_height
        let statusBarHeight = this.vuex_status_bar_height
        if (!customBarHeight) {
          try {
            const navBarInfo = await this.$t.updateCustomBar()
            customBarHeight = navBarInfo.customBarHeight
            statusBarHeight = navBarInfo.statusBarHeight
          } catch(e) {
            setTimeout(() => {
              this.updateCustomBarInfo()
            }, 10)
            return
          }
        }
        this.$t.vuex('vuex_status_bar_height', statusBarHeight)
        this.$t.vuex('vuex_custom_bar_height', customBarHeight)
      },
      chooseImage() {
        uni.chooseImage({
          count: 1,
          sizeType: ['original', 'compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            const tempFilePaths = res.tempFilePaths[0]
            this.imageUrl = tempFilePaths
          }
        })
      },
      switchBorderRect() {
        this.isRound = !this.isRound
      },
      cropperFinish(res) {
        this.showCropperImage = true
        if (res.url) {
          this.cropperImageUrl = res.url
        }
        if (res.base64) {
          this.cropperImageUrl = `${res.base64}`
        }
      },
      saveAvatar() {
        if (this.cropperImageUrl) {
          this.showCropperImage = true
        }
      },
      async confirmUpload() {
        if (!this.cropperImageUrl) return;
        
        uni.showLoading({ title: '上传中' });
        
        try {
          // 将base64转为临时文件再上传
          const filePath = this.cropperImageUrl;
          
          // 上传到云存储
          const uploadRes = await uniCloud.uploadFile({
            filePath: filePath,
            cloudPath: `avatars/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`
          });
          
          const avatarUrl = uploadRes.fileID;
          
          // 更新用户头像
          const db = uniCloud.database();
          await db.collection('uni-id-users')
            .where('_id == $cloudEnv_uid')
            .update({
              avatar: avatarUrl
            });
          
          uni.hideLoading();
          uni.showToast({ title: '上传成功', icon: 'success' });
          
          // 更新本地缓存的用户信息
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
          
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: '上传失败', icon: 'none' });
          console.error(e);
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  $primary: #3D8B8F;
  $accent: #C9A86C;
  $warm: #E07A5F;
  $bg: #1a1a1a;
  $card-bg: #FFFEFB;
  $text: #FFFFFF;
  $text-secondary: rgba(255, 255, 255, 0.7);
  $text-hint: rgba(255, 255, 255, 0.5);

  .avatar-page {
    min-height: 100vh;
    background-color: $bg;
  }

  .nav-back {
    display: flex;
    align-items: center;
    height: 100%;
    
    .back-btn {
      width: 64rpx;
      height: 64rpx;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      text {
        color: $text;
        font-size: 32rpx;
      }
    }
  }

  .nav-title {
    color: $text;
    font-size: 34rpx;
    font-weight: bold;
    letter-spacing: 2rpx;
  }

  .nav-right {
    padding: 12rpx 24rpx;
    background: $accent;
    border-radius: 30rpx;
    
    text {
      color: #FFFFFF;
      font-size: 28rpx;
      font-weight: 500;
    }
  }

  .page-content {
    position: relative;
    z-index: 100;
  }

  .action-bar {
    display: flex;
    justify-content: center;
    gap: 30rpx;
    padding: 40rpx 30rpx;
  }

  .action-btn {
    display: flex;
    align-items: center;
    padding: 20rpx 36rpx;
    background: $accent;
    border-radius: 40rpx;
    
    text {
      color: #FFFFFF;
      font-size: 28rpx;
      
      &:first-child {
        margin-right: 10rpx;
        font-size: 32rpx;
      }
    }
    
    &.secondary {
      background: rgba(255, 255, 255, 0.15);
      border: 2rpx solid rgba(255, 255, 255, 0.3);
    }
    
    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }

  .tips {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 30rpx;
  }

  .tips-icon {
    width: 120rpx;
    height: 120rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;
    
    text {
      font-size: 56rpx;
      color: $text-hint;
    }
  }

  .tips-text {
    font-size: 30rpx;
    color: $text-secondary;
    margin-bottom: 12rpx;
  }

  .tips-hint {
    font-size: 26rpx;
    color: $text-hint;
  }

  // 预览弹窗
  .preview-popup {
    padding: 40rpx;
  }

  .preview-title {
    text-align: center;
    font-size: 34rpx;
    font-weight: bold;
    color: #2D3436;
    margin-bottom: 40rpx;
  }

  .preview-image-box {
    display: flex;
    justify-content: center;
    margin-bottom: 40rpx;
  }

  .preview-image {
    width: 300rpx;
    height: 300rpx;
    border: 4rpx solid #F0F0F0;
    
    &.round {
      border-radius: 50%;
    }
  }

  .preview-actions {
    display: flex;
    gap: 24rpx;
  }

  .preview-btn {
    flex: 1;
    padding: 28rpx;
    border-radius: 50rpx;
    text-align: center;
    
    text {
      font-size: 30rpx;
      font-weight: 500;
    }
    
    &.cancel {
      background: #F5F5F5;
      
      text {
        color: #666666;
      }
    }
    
    &.confirm {
      background: linear-gradient(135deg, $accent, #D4B87A);
      
      text {
        color: #FFFFFF;
      }
    }
    
    &:active {
      opacity: 0.9;
    }
  }
</style>
