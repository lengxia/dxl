<template>
  <view class="detail-page">
    <!-- 顶部渐变背景 -->
    <view class="page-header">
      <view class="header-bg"></view>
      <tn-nav-bar :isBack="true" fixed customBack backgroundColor="transparent" :bottomShadow="false">
        <view slot="back" class="nav-back" @click="goBack">
          <view class="back-btn">
            <text class="tn-icon-left"></text>
          </view>
        </view>
        <view class="nav-title">札记详情</view>
      </tn-nav-bar>
    </view>

    <view class="page-content" :style="{paddingTop: (vuex_custom_bar_height + 20) + 'px'}" v-if="note">
      <!-- 主卡片 -->
      <view class="detail-card">
        <!-- 心境标签 -->
        <view class="mood-row">
          <view class="mood-badge">
            <text class="mood-emoji">{{ moodEmoji(note.mood) }}</text>
            <text class="mood-name">{{ note.mood }}</text>
          </view>
          <view class="privacy-badge" v-if="note.is_private">
            <text class="tn-icon-lock"></text>
            <text>私密</text>
          </view>
        </view>

        <!-- 标题 -->
        <view class="detail-title">{{ note.title }}</view>
        
        <!-- 日期 -->
        <view class="detail-date">
          <text class="tn-icon-time"></text>
          <text>{{ formatDate(note.create_time) }}</text>
        </view>

        <!-- 正文内容 -->
        <view class="detail-content">
          <text>{{ note.content }}</text>
        </view>

        <!-- 图片展示 -->
        <view class="image-gallery" v-if="note.images && note.images.length > 0">
          <view 
            v-for="(img, idx) in note.images" 
            :key="idx" 
            class="gallery-item"
            @click="previewImage(idx)"
          >
            <image :src="img" mode="aspectFill" class="gallery-image"/>
          </view>
        </view>
        
        <!-- 标签 -->
        <view class="tags-section" v-if="note.tags && note.tags.length > 0">
          <view 
            v-for="(tag, i) in note.tags" 
            :key="i" 
            class="tag-item"
          >
            <text class="tn-icon-tag"></text>
            <text>{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <view class="edit-btn" @click="editNote">
          <text class="tn-icon-edit"></text>
          <text>修改札记</text>
        </view>
        <view class="delete-btn" @click="deleteNote">
          <text class="tn-icon-delete"></text>
          <text>删除札记</text>
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view class="loading-state" v-else :style="{paddingTop: (vuex_custom_bar_height + 100) + 'px'}">
      <tn-loading mode="flower" color="#7B68EE"></tn-loading>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        id: '',
        note: null
      }
    },
    onLoad(options) {
      if (options.id) {
        this.id = options.id;
        this.loadData();
      }
    },
    onShow() {
      // 从编辑页返回时重新加载数据
      if (this.id) {
        this.loadData();
      }
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      async loadData() {
        try {
          const waterApi = uniCloud.importObject('water-api', { customUI: true });
          const res = await waterApi.getNoteDetail({ id: this.id });
          if (res.errCode === 0 && res.data) {
            this.note = res.data;
          }
        } catch (e) {
          // 加载失败
        }
      },
      moodEmoji(mood) {
        const map = {
          '平和': '😌',
          '喜悦': '😊',
          '感悟': '💡',
          '焦虑': '😰',
          '低落': '😔'
        };
        return map[mood] || '😌';
      },
      formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}年${month}月${day}日 ${hours}:${minutes}`;
      },
      previewImage(current) {
        uni.previewImage({
          current: current,
          urls: this.note.images
        });
      },
      editNote() {
        // 跳转到创建页面，携带 ID 参数进入编辑模式
        uni.navigateTo({
          url: `/pages/notes/create?id=${this.id}`
        });
      },
      deleteNote() {
        uni.showModal({
          title: '确认删除',
          content: '删除后将无法恢复，确定要删除这条札记吗？',
          confirmColor: '#E07A5F',
          success: async (res) => {
            if (res.confirm) {
              uni.showLoading({ title: '删除中' });
              try {
                const waterApi = uniCloud.importObject('water-api', { customUI: true });
                const res = await waterApi.deleteNote({ id: this.id });
                
                if (res.errCode === 0) {
                  uni.hideLoading();
                  uni.showToast({ title: '已删除', icon: 'success' });
                  setTimeout(() => {
                    uni.navigateBack();
                  }, 1500);
                } else {
                  throw new Error(res.errMsg);
                }
              } catch (e) {
                uni.hideLoading();
                uni.showToast({ title: '删除失败', icon: 'none' });
              }
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  $primary: #7B68EE;
  $primary-light: #9B8AFF;
  $accent: #C9A86C;
  $warm: #E07A5F;
  $bg: #F7F5F0;
  $card-bg: #FFFEFB;
  $text: #2D3436;
  $text-secondary: #636E72;
  $text-hint: #B2BEC3;

  .detail-page {
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
    height: 320rpx;
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

  .detail-card {
    background: $card-bg;
    border-radius: 28rpx;
    padding: 40rpx 30rpx;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.08);
  }

  .mood-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
  }

  .mood-badge {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, rgba($primary, 0.1), rgba($primary-light, 0.1));
    padding: 12rpx 24rpx;
    border-radius: 30rpx;
    
    .mood-emoji {
      font-size: 36rpx;
      margin-right: 10rpx;
    }
    
    .mood-name {
      font-size: 26rpx;
      color: $primary;
      font-weight: 500;
    }
  }

  .privacy-badge {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: $text-hint;
    
    text:first-child {
      margin-right: 6rpx;
    }
  }

  .detail-title {
    font-size: 40rpx;
    font-weight: bold;
    color: $text;
    line-height: 1.4;
    margin-bottom: 20rpx;
  }

  .detail-date {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: $text-secondary;
    margin-bottom: 30rpx;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #F0EDE8;
    
    text:first-child {
      margin-right: 10rpx;
      color: $primary;
    }
  }

  .detail-content {
    font-size: 32rpx;
    color: $text;
    line-height: 2;
    margin-bottom: 30rpx;
    white-space: pre-wrap;
  }

  .image-gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 30rpx;
  }

  .gallery-item {
    width: calc(33.33% - 12rpx);
    aspect-ratio: 1;
    border-radius: 16rpx;
    overflow: hidden;
  }

  .gallery-image {
    width: 100%;
    height: 100%;
  }

  .tags-section {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #F0EDE8;
  }

  .tag-item {
    display: flex;
    align-items: center;
    background: #F9F8F5;
    padding: 12rpx 20rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    color: $text-secondary;
    
    text:first-child {
      color: $primary;
      margin-right: 8rpx;
      font-size: 22rpx;
    }
  }

  .action-section {
    margin-top: 40rpx;
    display: flex;
    gap: 20rpx;
  }

  .edit-btn {
    flex: 1;
    background: linear-gradient(135deg, $primary, $primary-light);
    border-radius: 50rpx;
    padding: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    text {
      color: #FFFFFF;
      font-size: 28rpx;
      font-weight: 500;
      
      &:first-child {
        margin-right: 10rpx;
      }
    }
    
    &:active {
      opacity: 0.9;
    }
  }

  .delete-btn {
    flex: 1;
    background: #FFFEFB;
    border: 2rpx solid #FFE4E1;
    border-radius: 50rpx;
    padding: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    text {
      color: #E07A5F;
      font-size: 28rpx;
      
      &:first-child {
        margin-right: 10rpx;
      }
    }
    
    &:active {
      background: #FFF5F5;
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .loading-text {
      margin-top: 20rpx;
      font-size: 28rpx;
      color: $text-hint;
    }
  }
</style>
