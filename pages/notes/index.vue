<template>
  <view class="notes-page tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="" fixed customBack :backgroundColor="navBgColor" :bottomShadow="false">
      <view slot="back" class="nav-back" @click="goBack">
        <view class="back-btn">
          <text class="tn-icon-left" :style="{color: navTextColor}"></text>
        </view>
      </view>
      <view class="nav-title" :style="{color: navTextColor}">悟道札记</view>
    </tn-nav-bar>

    <view class="page-wrapper">
      <!-- 顶部背景 -->
      <view class="header-bg"></view>
      
      <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
        
        <!-- 头部卡片 -->
        <view class="header-card">
          <view class="header-icon">
            <text class="tn-icon-edit"></text>
          </view>
          <view class="header-info">
            <view class="header-title">记录修行感悟</view>
            <view class="header-desc">妙悟真心，明心见性</view>
          </view>
          <view class="note-count">{{ notes.length }} 篇</view>
        </view>

        <!-- 札记列表 -->
        <view class="list-section">
          <view v-if="notes.length > 0" class="notes-list">
            <view 
              v-for="(item, index) in notes" 
              :key="index" 
              class="note-card"
              @click="goDetail(item._id)"
            >
              <view class="note-timeline">
                <view class="timeline-dot"></view>
                <view class="timeline-line" v-if="index < notes.length - 1"></view>
              </view>
              
              <view class="note-content">
                <view class="note-header">
                  <view class="note-title">{{ item.title }}</view>
                  <view class="note-mood" v-if="item.mood">
                    <text class="tn-icon-mood"></text>
                    <text>{{ item.mood }}</text>
                  </view>
                </view>
                
                <view class="note-date">{{ formatDate(item.create_time) }}</view>
                
                <view class="note-text">{{ item.content }}</view>
                
                <!-- 图片预览 -->
                <view v-if="item.images && item.images.length > 0" class="note-images">
                  <image 
                    :src="item.images[0]" 
                    mode="aspectFill" 
                    class="preview-image"
                  />
                  <view v-if="item.images.length > 1" class="image-count">
                    +{{ item.images.length - 1 }}
                  </view>
                </view>

                <!-- 标签 -->
                <view class="note-tags" v-if="item.tags && item.tags.length > 0">
                  <view 
                    v-for="(tag, tagIndex) in item.tags.slice(0, 3)" 
                    :key="tagIndex"
                    class="tag-item"
                  >
                    # {{ tag }}
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <view v-else class="empty-state">
            <view class="empty-icon">
              <text class="tn-icon-edit"></text>
            </view>
            <view class="empty-text">暂无札记</view>
            <view class="empty-hint">记录修行中的点滴感悟</view>
          </view>
        </view>

      </view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="fab-btn" @click="goCreate">
      <text class="tn-icon-add"></text>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        notes: [],
        scrollTop: 0
      }
    },
    computed: {
      navBgColor() {
        return this.scrollTop > 50 ? '#FFFEFB' : 'transparent';
      },
      navTextColor() {
        return this.scrollTop > 50 ? '#2D3436' : '#FFFFFF';
      }
    },
    onPageScroll(e) {
      this.scrollTop = e.scrollTop;
    },
    onShow() {
      this.loadNotes();
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      goCreate() {
        uni.navigateTo({
          url: '/pages/notes/create'
        });
      },
      goDetail(id) {
        uni.navigateTo({
          url: '/pages/notes/detail?id=' + id
        });
      },
      async loadNotes() {
        const token = uni.getStorageSync('uni_id_token');
        if (!token) {
          this.notes = [];
          return;
        }
        
        const uid = uniCloud.getCurrentUserInfo().uid || uni.getStorageSync('uni_id_user_uid');
        if (!uid) return;

        try {
          const waterApi = uniCloud.importObject('water-api');
          const res = await waterApi.getNotes({ uid });
          
          if (res.errCode === 0) {
            this.notes = res.data;
          } else {
            console.error('获取札记失败:', res.errMsg);
          }
        } catch (e) {
          console.error('数据加载失败', e);
        }
      },
      formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
      }
    }
  }
</script>

<style lang="scss" scoped>
  // 道心录配色
  $primary: #3D8B8F;
  $primary-light: #5AABAD;
  $accent: #C9A86C;
  $purple: #7B68EE;
  $purple-light: #9B8AFF;
  $bg: #F7F5F0;
  $card-bg: #FFFEFB;
  $text: #2D3436;
  $text-secondary: #636E72;
  $text-hint: #B2BEC3;

  .notes-page {
    min-height: 100vh;
    background-color: $bg;
  }
  
  .nav-back {
    display: flex;
    align-items: center;
    height: 100%;
    padding-left: 20rpx;
    
    .back-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      text {
        font-size: 36rpx;
      }
    }
  }
  
  .nav-title {
    font-size: 34rpx;
    font-weight: bold;
  }
  
  .page-wrapper {
    position: relative;
  }
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 350rpx;
    background: linear-gradient(180deg, $purple 0%, $purple-light 100%);
    border-radius: 0 0 60rpx 60rpx;
  }
  
  .page-content {
    position: relative;
    z-index: 1;
    padding: 30rpx;
    padding-bottom: 150rpx;
  }

  // 头部卡片
  .header-card {
    background: $card-bg;
    border-radius: 28rpx;
    padding: 36rpx;
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.1);
  }
  
  .header-icon {
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, $purple, $purple-light);
    border-radius: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    box-shadow: 0 8rpx 24rpx rgba(123, 104, 238, 0.3);
    
    text {
      font-size: 48rpx;
      color: #FFFFFF;
    }
  }
  
  .header-info {
    flex: 1;
    
    .header-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text;
      margin-bottom: 8rpx;
    }
    
    .header-desc {
      font-size: 24rpx;
      color: $text-hint;
    }
  }
  
  .note-count {
    font-size: 28rpx;
    font-weight: bold;
    color: $purple;
    background: rgba(123, 104, 238, 0.1);
    padding: 12rpx 24rpx;
    border-radius: 30rpx;
  }

  // 列表区域
  .list-section {
    margin-bottom: 30rpx;
  }
  
  .notes-list {
    display: flex;
    flex-direction: column;
  }
  
  .note-card {
    display: flex;
    margin-bottom: 10rpx;
  }
  
  .note-timeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 60rpx;
    padding-top: 30rpx;
  }
  
  .timeline-dot {
    width: 20rpx;
    height: 20rpx;
    background: linear-gradient(135deg, $purple, $purple-light);
    border-radius: 50%;
    box-shadow: 0 4rpx 12rpx rgba(123, 104, 238, 0.4);
  }
  
  .timeline-line {
    flex: 1;
    width: 4rpx;
    background: linear-gradient(180deg, rgba(123, 104, 238, 0.4), rgba(123, 104, 238, 0.1));
    margin-top: 10rpx;
  }
  
  .note-content {
    flex: 1;
    background: $card-bg;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
    margin-bottom: 20rpx;
  }
  
  .note-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10rpx;
  }
  
  .note-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text;
    flex: 1;
    margin-right: 20rpx;
  }
  
  .note-mood {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: $purple;
    background: rgba(123, 104, 238, 0.1);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    
    text:first-child {
      margin-right: 6rpx;
    }
  }
  
  .note-date {
    font-size: 24rpx;
    color: $text-hint;
    margin-bottom: 16rpx;
  }
  
  .note-text {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    margin-bottom: 16rpx;
  }
  
  .note-images {
    position: relative;
    display: inline-block;
    margin-bottom: 16rpx;
    
    .preview-image {
      width: 200rpx;
      height: 150rpx;
      border-radius: 12rpx;
      object-fit: cover;
    }
    
    .image-count {
      position: absolute;
      right: 10rpx;
      bottom: 10rpx;
      background: rgba(0, 0, 0, 0.5);
      color: #FFFFFF;
      font-size: 22rpx;
      padding: 4rpx 12rpx;
      border-radius: 10rpx;
    }
  }
  
  .note-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }
  
  .tag-item {
    font-size: 22rpx;
    color: $text-hint;
    background: $bg;
    padding: 6rpx 16rpx;
    border-radius: 16rpx;
  }

  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 0;
    
    .empty-icon {
      width: 140rpx;
      height: 140rpx;
      background: linear-gradient(135deg, $purple-light, $purple);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30rpx;
      
      text {
        font-size: 70rpx;
        color: #FFFFFF;
      }
    }
    
    .empty-text {
      font-size: 34rpx;
      font-weight: bold;
      color: $text;
      margin-bottom: 10rpx;
    }
    
    .empty-hint {
      font-size: 26rpx;
      color: $text-hint;
    }
  }

  // 悬浮按钮
  .fab-btn {
    position: fixed;
    bottom: 100rpx;
    right: 40rpx;
    width: 110rpx;
    height: 110rpx;
    background: linear-gradient(135deg, $purple, $purple-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10rpx 40rpx rgba(123, 104, 238, 0.4);
    z-index: 99;
    
    text {
      font-size: 48rpx;
      color: #FFFFFF;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
</style>
