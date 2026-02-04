<template>
  <view class="diary-page tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="" fixed customBack :backgroundColor="navBgColor" :bottomShadow="false">
      <view slot="back" class="nav-back" @click="goBack">
        <view class="back-btn">
          <text class="tn-icon-left" :style="{color: navTextColor}"></text>
        </view>
      </view>
      <view class="nav-title" :style="{color: navTextColor}">善行日记</view>
    </tn-nav-bar>

    <view class="page-wrapper">
      <!-- 顶部背景 -->
      <view class="header-bg"></view>
      
      <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
        
        <!-- 统计概览卡片 -->
        <view class="stats-card">
          <view class="stats-icon">
            <text class="tn-icon-star-fill"></text>
          </view>
          <view class="stats-info">
            <view class="stats-row">
              <view class="stats-item">
                <view class="stats-value">{{ totalMerit }}</view>
                <view class="stats-label">功德分</view>
              </view>
              <view class="stats-divider"></view>
              <view class="stats-item">
                <view class="stats-value">{{ totalCount }}</view>
                <view class="stats-label">件善事</view>
              </view>
            </view>
            <view class="stats-period">{{ currentMonth }}月累计</view>
          </view>
        </view>

        <!-- 列表区域 -->
        <view class="list-section">
          <view class="section-header">
            <view class="section-title">善行记录</view>
          </view>
          
          <view v-if="diaries.length > 0" class="diary-list">
            <view 
              v-for="(item, index) in diaries" 
              :key="index" 
              class="diary-card"
              @click="goDetail(item._id)"
            >
              <view class="diary-header">
                <view class="diary-type" :style="{background: typeGradient(item.deed_type)}">
                  {{ item.deed_type }}
                </view>
                <view class="diary-date">{{ item.date }}</view>
              </view>
              
              <view class="diary-title">{{ item.title }}</view>
              
              <view class="diary-content">{{ item.content }}</view>
              
              <view class="diary-footer">
                <view class="diary-intention" v-if="item.intention">
                  <text class="tn-icon-heart"></text>
                  <text>{{ item.intention }}</text>
                </view>
                <view class="diary-merit">
                  <text class="tn-icon-diamond"></text>
                  <text>+{{ item.merit_points }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view v-else class="empty-state">
            <view class="empty-icon">
              <text class="tn-icon-star"></text>
            </view>
            <view class="empty-text">勿以善小而不为</view>
            <view class="empty-hint">点击下方按钮记录第一件善事</view>
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
        currentMonth: new Date().getMonth() + 1,
        diaries: [],
        totalMerit: 0,
        totalCount: 0,
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
      this.loadData();
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      goCreate() {
        uni.navigateTo({
          url: '/pages/diary/create'
        });
      },
      goDetail(id) {
        uni.navigateTo({
          url: '/pages/diary/detail?id=' + id
        });
      },
      async loadData() {
        const db = uniCloud.database();
        
        try {
          const res = await db.collection('good_deeds')
            .where('user_id == $cloudEnv_uid')
            .orderBy('date', 'desc')
            .get();
          
          this.diaries = res.result.data;
          
          const monthPrefix = `${new Date().getFullYear()}-${String(this.currentMonth).padStart(2,'0')}`;
          
          let m = 0;
          let c = 0;
          this.diaries.forEach(d => {
            if (d.date.startsWith(monthPrefix)) {
              m += d.merit_points;
              c += 1;
            }
          });
          this.totalMerit = m;
          this.totalCount = c;
          
        } catch (e) {
          console.error(e);
        }
      },
      typeGradient(type) {
        const map = {
          '助人': 'linear-gradient(135deg, #E07A5F, #F09A7F)',
          '爱物': 'linear-gradient(135deg, #3D8B8F, #5AABAD)',
          '环保': 'linear-gradient(135deg, #26A69A, #4DB6AC)',
          '孝亲': 'linear-gradient(135deg, #7B68EE, #9B8AFF)',
          '其他': 'linear-gradient(135deg, #78909C, #90A4AE)'
        };
        return map[type] || map['其他'];
      }
    }
  }
</script>

<style lang="scss" scoped>
  // 道心录配色
  $primary: #3D8B8F;
  $primary-light: #5AABAD;
  $accent: #C9A86C;
  $accent-light: #E8D4A8;
  $warm: #E07A5F;
  $bg: #F7F5F0;
  $card-bg: #FFFEFB;
  $text: #2D3436;
  $text-secondary: #636E72;
  $text-hint: #B2BEC3;

  .diary-page {
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
    background: linear-gradient(180deg, $accent 0%, #D4B87A 100%);
    border-radius: 0 0 60rpx 60rpx;
  }
  
  .page-content {
    position: relative;
    z-index: 1;
    padding: 30rpx;
    padding-bottom: 150rpx;
  }

  // 统计卡片
  .stats-card {
    background: $card-bg;
    border-radius: 28rpx;
    padding: 36rpx;
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.1);
  }
  
  .stats-icon {
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, $accent, #D4B87A);
    border-radius: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 30rpx;
    box-shadow: 0 8rpx 24rpx rgba(201, 168, 108, 0.3);
    
    text {
      font-size: 48rpx;
      color: #FFFFFF;
    }
  }
  
  .stats-info {
    flex: 1;
  }
  
  .stats-row {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
  }
  
  .stats-item {
    .stats-value {
      font-size: 44rpx;
      font-weight: bold;
      color: $text;
    }
    
    .stats-label {
      font-size: 22rpx;
      color: $text-hint;
    }
  }
  
  .stats-divider {
    width: 1rpx;
    height: 50rpx;
    background: #EEEEEE;
    margin: 0 40rpx;
  }
  
  .stats-period {
    font-size: 24rpx;
    color: $accent;
    font-weight: 500;
  }

  // 列表区域
  .list-section {
    margin-bottom: 30rpx;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text;
      margin-right: 20rpx;
    }
    
    &::after {
      content: '';
      flex: 1;
      height: 2rpx;
      background: linear-gradient(90deg, $accent-light, transparent);
    }
  }
  
  .diary-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
  
  .diary-card {
    background: $card-bg;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .diary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }
  
  .diary-type {
    font-size: 22rpx;
    color: #FFFFFF;
    padding: 6rpx 18rpx;
    border-radius: 20rpx;
    font-weight: 500;
  }
  
  .diary-date {
    font-size: 24rpx;
    color: $text-hint;
  }
  
  .diary-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text;
    margin-bottom: 12rpx;
  }
  
  .diary-content {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    margin-bottom: 20rpx;
  }
  
  .diary-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx solid #F5F5F5;
  }
  
  .diary-intention {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: $text-hint;
    
    text:first-child {
      margin-right: 8rpx;
      color: $warm;
    }
  }
  
  .diary-merit {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    font-weight: bold;
    color: $accent;
    
    text:first-child {
      margin-right: 6rpx;
    }
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
      background: linear-gradient(135deg, $accent-light, $accent);
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
    background: linear-gradient(135deg, $accent, #D4B87A);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10rpx 40rpx rgba(201, 168, 108, 0.4);
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
