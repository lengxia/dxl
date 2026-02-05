<template>
  <view class="create-page">
    <!-- 顶部渐变背景 -->
    <view class="page-header">
      <view class="header-bg"></view>
      <tn-nav-bar :isBack="true" fixed customBack backgroundColor="transparent" :bottomShadow="false">
        <view slot="back" class="nav-back" @click="goBack">
          <view class="back-btn">
            <text class="tn-icon-left"></text>
          </view>
        </view>
        <view class="nav-title">撰写札记</view>
      </tn-nav-bar>
    </view>

    <view class="page-content" :style="{paddingTop: (vuex_custom_bar_height + 20) + 'px'}">
      <!-- 表单卡片 -->
      <view class="form-card">
        <view class="card-header">
          <view class="card-icon">
            <text class="tn-icon-edit"></text>
          </view>
          <view class="card-title">悟道札记</view>
        </view>

        <tn-form :model="form" ref="noteForm" :errorType="['message']">
          <!-- 标题 -->
          <view class="form-group">
            <view class="form-label required">
              <text class="label-icon tn-icon-font"></text>
              <text>标题</text>
            </view>
            <view class="form-input-box">
              <input 
                v-model="form.title" 
                class="form-input" 
                placeholder="今日感悟..."
                placeholder-class="input-placeholder"
              />
            </view>
          </view>

          <!-- 正文 -->
          <view class="form-group">
            <view class="form-label required">
              <text class="label-icon tn-icon-text"></text>
              <text>正文</text>
            </view>
            <view class="form-textarea-box large">
              <textarea 
                v-model="form.content" 
                class="form-textarea" 
                placeholder="道可道，非常道..."
                placeholder-class="input-placeholder"
                :maxlength="2000"
              />
              <view class="word-count">{{ form.content.length }}/2000</view>
            </view>
          </view>

          <!-- 心境选择 -->
          <view class="form-group">
            <view class="form-label">
              <text class="label-icon tn-icon-heart"></text>
              <text>心境</text>
            </view>
            <view class="mood-tags">
              <view 
                v-for="(item, index) in moodOptions" 
                :key="index" 
                :class="['mood-tag', form.mood === item.name ? 'active' : '']"
                @click="form.mood = item.name"
              >
                <text class="mood-emoji">{{ item.emoji }}</text>
                <text class="mood-name">{{ item.name }}</text>
              </view>
            </view>
          </view>

          <!-- 标签 -->
          <view class="form-group">
            <view class="form-label">
              <text class="label-icon tn-icon-tag"></text>
              <text>标签</text>
            </view>
            <view class="form-input-box">
              <input 
                v-model="form.tags_str" 
                class="form-input" 
                placeholder="多个标签用逗号分隔，如：读书,修心"
                placeholder-class="input-placeholder"
              />
            </view>
            <view class="quick-tags" v-if="quickTags.length">
              <text class="quick-tag-hint">快捷标签：</text>
              <view 
                v-for="(tag, i) in quickTags" 
                :key="i" 
                class="quick-tag"
                @click="addQuickTag(tag)"
              >
                {{ tag }}
              </view>
            </view>
          </view>

          <!-- 配图 -->
          <view class="form-group">
            <view class="form-label">
              <text class="label-icon tn-icon-image"></text>
              <text>配图</text>
              <text class="label-hint">（选填）</text>
            </view>
            <view class="image-upload-area">
              <view 
                v-for="(img, index) in imageList" 
                :key="index" 
                class="upload-item"
              >
                <image :src="img" mode="aspectFill" class="upload-image"/>
                <view class="remove-btn" @click="removeImage(index)">
                  <text class="tn-icon-close"></text>
                </view>
              </view>
              <view class="upload-add" @click="chooseImage" v-if="imageList.length < 9">
                <text class="tn-icon-add"></text>
                <text class="add-text">添加图片</text>
              </view>
            </view>
          </view>

          <!-- 私密开关 -->
          <view class="form-group switch-group">
            <view class="switch-left">
              <view class="form-label">
                <text class="label-icon tn-icon-lock"></text>
                <text>私密</text>
              </view>
              <view class="switch-hint">设为私密仅自己可见</view>
            </view>
            <switch 
              :checked="form.is_private" 
              color="#7B68EE"
              @change="form.is_private = !form.is_private"
            />
          </view>
        </tn-form>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <view class="submit-btn" @click="submit">
          <text class="tn-icon-check"></text>
          <text>保存札记</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        moodOptions: [
          { name: '平和', emoji: '😌' },
          { name: '喜悦', emoji: '😊' },
          { name: '感悟', emoji: '💡' },
          { name: '焦虑', emoji: '😰' },
          { name: '低落', emoji: '😔' }
        ],
        quickTags: ['读书', '修心', '静坐', '感恩', '反思', '悟道'],
        imageList: [],
        form: {
          title: '',
          content: '',
          mood: '平和',
          tags_str: '',
          images: [],
          is_private: false
        },
        isLoggedIn: false,
        rules: {
          title: [{ required: true, message: '请输入标题' }],
          content: [{ required: true, message: '请输入内容' }]
        }
      }
    },
  onReady() {
    this.$refs.noteForm.setRules(this.rules);
  },
  
  onShow() {
    this.checkLoginStatus();
  },
    methods: {
      async checkLoginStatus() {
        this.isLoggedIn = await this.$uniID.checkLogin();
      },
      
      goBack() {
        uni.navigateBack();
      },
      addQuickTag(tag) {
        if (this.form.tags_str) {
          if (!this.form.tags_str.includes(tag)) {
            this.form.tags_str += ',' + tag;
          }
        } else {
          this.form.tags_str = tag;
        }
      },
      chooseImage() {
        uni.chooseImage({
          count: 9 - this.imageList.length,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            this.imageList = [...this.imageList, ...res.tempFilePaths];
          }
        });
      },
      removeImage(index) {
        this.imageList.splice(index, 1);
      },
      async uploadImages() {
        const urls = [];
        for (let path of this.imageList) {
          try {
            const res = await uniCloud.uploadFile({
              filePath: path,
              cloudPath: `notes/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
            });
            urls.push(res.fileID);
          } catch (e) {
            console.error('上传失败', e);
          }
        }
        return urls;
      },
      async submit() {
        // 检查登录状态
        const isLoggedIn = await this.$uniID.checkLogin();
        if (!isLoggedIn) {
          uni.showModal({
            title: '提示',
            content: '请先登录后再发布札记',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: '/pages/login/index'
                });
              }
            }
          });
          return;
        }

        if (!this.form.title) {
          uni.showToast({ title: '请输入标题', icon: 'none' });
          return;
        }
        if (!this.form.content) {
          uni.showToast({ title: '请输入内容', icon: 'none' });
          return;
        }
        
        uni.showLoading({ title: '保存中' });
        
        try {
          // 处理标签
          const tags = this.form.tags_str.split(/[,，\s]+/).filter(t => t.trim() !== '');
          
          // 上传图片
          let images = [];
          if (this.imageList.length > 0) {
            images = await this.uploadImages();
          }
          
          const data = {
            title: this.form.title,
            content: this.form.content,
            mood: this.form.mood,
            tags: tags,
            images: images,
            is_private: this.form.is_private,
            user_id: this.vuex_user.uid || uni.getStorageSync('uni_id_user_uid') // 使用 user_id
          };

          const waterApi = uniCloud.importObject('water-api');
          const res = await waterApi.addNote(data);
          
          if (res.errCode === 0) {
            uni.hideLoading();
            uni.showToast({ title: '发布成功', icon: 'success' });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            throw new Error(res.errMsg);
          }
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: '发布失败', icon: 'none' });
          console.error('发布失败:', e);
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  $primary: #7B68EE;
  $primary-light: #9B8AFF;
  $accent: #C9A86C;
  $bg: #F7F5F0;
  $card-bg: #FFFEFB;
  $text: #2D3436;
  $text-secondary: #636E72;
  $text-hint: #B2BEC3;

  .create-page {
    min-height: 100vh;
    background-color: $bg;
  }

  .page-header {
    position: relative;
  }

  .header-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 280rpx;
    background: linear-gradient(160deg, $primary 0%, $primary-light 100%);
    z-index: 0;
  }

  .nav-back {
    display: flex;
    align-items: center;
    height: 100%;
    
    .back-btn {
      width: 64rpx;
      height: 64rpx;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      text {
        color: #FFFFFF;
        font-size: 32rpx;
      }
    }
  }

  .nav-title {
    color: #FFFFFF;
    font-size: 34rpx;
    font-weight: bold;
    letter-spacing: 2rpx;
  }

  .page-content {
    position: relative;
    z-index: 1;
    padding: 0 30rpx 60rpx;
  }

  .form-card {
    background: $card-bg;
    border-radius: 28rpx;
    padding: 40rpx 30rpx;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.08);
  }

  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #F0EDE8;
  }

  .card-icon {
    width: 70rpx;
    height: 70rpx;
    background: linear-gradient(135deg, $primary, $primary-light);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    
    text {
      color: #FFFFFF;
      font-size: 36rpx;
    }
  }

  .card-title {
    font-size: 34rpx;
    font-weight: bold;
    color: $text;
  }

  .form-group {
    margin-bottom: 36rpx;
  }

  .form-label {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: $text;
    font-weight: 500;
    
    &.required::after {
      content: '*';
      color: #E07A5F;
      margin-left: 6rpx;
    }
    
    .label-icon {
      font-size: 30rpx;
      color: $primary;
      margin-right: 12rpx;
    }
    
    .label-hint {
      color: $text-hint;
      font-size: 24rpx;
      font-weight: normal;
      margin-left: 8rpx;
    }
  }

  .form-input-box {
    background: #F9F8F5;
    border-radius: 16rpx;
    padding: 24rpx;
    display: flex;
    align-items: center;
  }

  .form-input {
    flex: 1;
    font-size: 28rpx;
    color: $text;
  }

  .input-placeholder {
    color: $text-hint;
  }

  .form-textarea-box {
    background: #F9F8F5;
    border-radius: 16rpx;
    padding: 24rpx;
    position: relative;
    
    &.large {
      .form-textarea {
        min-height: 300rpx;
      }
    }
  }

  .form-textarea {
    width: 100%;
    min-height: 180rpx;
    font-size: 28rpx;
    color: $text;
    line-height: 1.8;
  }

  .word-count {
    text-align: right;
    font-size: 24rpx;
    color: $text-hint;
    margin-top: 10rpx;
  }

  .mood-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .mood-tag {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    background: #F9F8F5;
    border-radius: 30rpx;
    transition: all 0.2s;
    
    .mood-emoji {
      font-size: 32rpx;
      margin-right: 8rpx;
    }
    
    .mood-name {
      font-size: 26rpx;
      color: $text-secondary;
    }
    
    &.active {
      background: linear-gradient(135deg, $primary, $primary-light);
      
      .mood-name {
        color: #FFFFFF;
        font-weight: 500;
      }
    }
  }

  .quick-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-top: 16rpx;
    gap: 12rpx;
  }

  .quick-tag-hint {
    font-size: 24rpx;
    color: $text-hint;
  }

  .quick-tag {
    padding: 8rpx 20rpx;
    background: rgba($primary, 0.1);
    border-radius: 20rpx;
    font-size: 24rpx;
    color: $primary;
  }

  .image-upload-area {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .upload-item {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    border-radius: 16rpx;
    overflow: hidden;
    
    .upload-image {
      width: 100%;
      height: 100%;
    }
    
    .remove-btn {
      position: absolute;
      top: 8rpx;
      right: 8rpx;
      width: 44rpx;
      height: 44rpx;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      text {
        color: #FFFFFF;
        font-size: 24rpx;
      }
    }
  }

  .upload-add {
    width: 200rpx;
    height: 200rpx;
    background: #F9F8F5;
    border: 2rpx dashed #D0D0D0;
    border-radius: 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    text {
      color: $text-hint;
      
      &.tn-icon-add {
        font-size: 48rpx;
        margin-bottom: 8rpx;
      }
    }
    
    .add-text {
      font-size: 24rpx;
    }
  }

  .switch-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #F9F8F5;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 0;
  }

  .switch-left {
    .form-label {
      margin-bottom: 6rpx;
    }
    
    .switch-hint {
      font-size: 24rpx;
      color: $text-hint;
    }
  }

  .submit-section {
    margin-top: 50rpx;
    padding-bottom: 40rpx;
  }

  .submit-btn {
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    border-radius: 50rpx;
    padding: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10rpx 40rpx rgba(123, 104, 238, 0.4);
    
    text {
      color: #FFFFFF;
      font-size: 32rpx;
      font-weight: bold;
      
      &:first-child {
        margin-right: 12rpx;
      }
    }
    
    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
</style>
