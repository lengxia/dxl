<template>
  <view class="plan-page tn-safe-area-inset-bottom">
    <!-- 顶部导航栏 -->
    <tn-nav-bar :isBack="true" backTitle="" fixed customBack :backgroundColor="navBgColor" :bottomShadow="false">
      <view slot="back" class="nav-back" @click="goBack">
        <view class="back-btn">
          <text class="tn-icon-left" :style="{color: navTextColor}"></text>
        </view>
      </view>
      <view class="nav-title" :style="{color: navTextColor}">月度计划</view>
    </tn-nav-bar>

    <view class="page-wrapper">
      <!-- 顶部背景 -->
      <view class="header-bg"></view>
      
      <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
        
        <!-- 月份选择与进度 -->
        <view class="month-card">
          <view class="month-selector" @click="showCalendar = true">
            <view class="month-text">{{ currentYear }}年{{ currentMonth }}月</view>
            <text class="tn-icon-down"></text>
          </view>
          <view class="progress-info">
            <view class="progress-circle">
              <view class="progress-value">{{ progress }}%</view>
            </view>
            <view class="progress-label">总进度</view>
          </view>
        </view>

        <!-- 计划列表 -->
        <view class="list-section">
          <view class="section-header">
            <view class="section-title">计划列表</view>
            <view class="plan-count">{{ plans.length }} 项</view>
          </view>
          
          <view v-if="plans.length > 0" class="plan-list">
            <view 
              v-for="(item, index) in plans" 
              :key="index" 
              class="plan-card"
              @click="goDetail(item._id)"
            >
              <view class="plan-header">
                <view class="plan-title">{{ item.title }}</view>
                <view class="plan-status" :class="item.status">
                  {{ statusText(item.status) }}
                </view>
              </view>
              
              <view class="plan-goals">
                {{ getGoalsSummary(item.goals) }}
              </view>
              
              <view class="plan-progress">
                <view class="progress-bar">
                  <view 
                    class="progress-fill" 
                    :style="{width: calculateProgress(item.goals) + '%'}"
                  ></view>
                </view>
                <view class="progress-text">{{ calculateProgress(item.goals) }}%</view>
              </view>
            </view>
          </view>
          
          <view v-else class="empty-state">
            <view class="empty-icon">
              <text class="tn-icon-flag"></text>
            </view>
            <view class="empty-text">本月暂无计划</view>
            <view class="empty-hint">制定计划，开启修行之旅</view>
          </view>
        </view>

      </view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="fab-btn" @click="goCreate">
      <text class="tn-icon-add"></text>
    </view>
    
    <!-- 日历弹窗 -->
    <tn-calendar 
      v-model="showCalendar" 
      mode="date"
      :changeYear="true" 
      :changeMonth="true"
      activeBgColor="#E07A5F" 
      @change="onDateChange"
    ></tn-calendar>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        showCalendar: false,
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1,
        plans: [],
        progress: 0,
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
      this.loadPlans();
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      goCreate() {
        uni.navigateTo({
          url: '/pages/plan/create'
        });
      },
      goDetail(id) {
        uni.navigateTo({
          url: '/pages/plan/detail?id=' + id
        });
      },
      onDateChange(e) {
        const date = new Date(e.result);
        this.currentYear = date.getFullYear();
        this.currentMonth = date.getMonth() + 1;
        this.loadPlans();
      },
      async loadPlans() {
        const db = uniCloud.database();
        const yearMonth = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}`;
        
        try {
          const res = await db.collection('monthly_plans')
            .where(`year_month == "${yearMonth}" && user_id == $cloudEnv_uid`)
            .get();
          
          this.plans = res.result.data;
          this.calculateTotalProgress();
        } catch (e) {
          console.error(e);
        }
      },
      statusText(status) {
        const map = {
          planning: '计划中',
          in_progress: '进行中',
          completed: '已完成'
        };
        return map[status] || '未知';
      },
      getGoalsSummary(goals) {
        if (!goals || goals.length === 0) return '暂无目标';
        return goals.map(g => `[${g.category}] ${g.content}`).slice(0, 2).join('；');
      },
      calculateProgress(goals) {
        if (!goals || goals.length === 0) return 0;
        let total = 0;
        let completed = 0;
        goals.forEach(g => {
          total += g.target_days;
          completed += g.completed_days;
        });
        return total === 0 ? 0 : Math.round((completed / total) * 100);
      },
      calculateTotalProgress() {
        if (this.plans.length === 0) {
          this.progress = 0;
          return;
        }
        let totalPercent = 0;
        this.plans.forEach(p => {
          totalPercent += this.calculateProgress(p.goals);
        });
        this.progress = Math.round(totalPercent / this.plans.length);
      }
    }
  }
</script>

<style lang="scss" scoped>
  // 道心录配色
  $primary: #3D8B8F;
  $primary-light: #5AABAD;
  $accent: #C9A86C;
  $warm: #E07A5F;
  $warm-light: #F09A7F;
  $bg: #F7F5F0;
  $card-bg: #FFFEFB;
  $text: #2D3436;
  $text-secondary: #636E72;
  $text-hint: #B2BEC3;

  .plan-page {
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
    background: linear-gradient(180deg, $warm 0%, $warm-light 100%);
    border-radius: 0 0 60rpx 60rpx;
  }
  
  .page-content {
    position: relative;
    z-index: 1;
    padding: 30rpx;
    padding-bottom: 150rpx;
  }

  // 月份卡片
  .month-card {
    background: $card-bg;
    border-radius: 28rpx;
    padding: 36rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.1);
  }
  
  .month-selector {
    display: flex;
    align-items: center;
    
    .month-text {
      font-size: 38rpx;
      font-weight: bold;
      color: $text;
      margin-right: 10rpx;
    }
    
    text {
      font-size: 28rpx;
      color: $text-hint;
    }
  }
  
  .progress-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .progress-circle {
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, $warm, $warm-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8rpx;
    box-shadow: 0 6rpx 20rpx rgba(224, 122, 95, 0.3);
    
    .progress-value {
      font-size: 30rpx;
      font-weight: bold;
      color: #FFFFFF;
    }
  }
  
  .progress-label {
    font-size: 22rpx;
    color: $text-hint;
  }

  // 列表区域
  .list-section {
    margin-bottom: 30rpx;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: $text;
      position: relative;
      padding-left: 20rpx;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6rpx;
        height: 28rpx;
        background: $warm;
        border-radius: 3rpx;
      }
    }
    
    .plan-count {
      font-size: 24rpx;
      color: $text-hint;
    }
  }
  
  .plan-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }
  
  .plan-card {
    background: $card-bg;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }
  
  .plan-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text;
    flex: 1;
    margin-right: 20rpx;
  }
  
  .plan-status {
    font-size: 22rpx;
    padding: 6rpx 18rpx;
    border-radius: 20rpx;
    
    &.planning {
      background: #F5F5F5;
      color: $text-hint;
    }
    
    &.in_progress {
      background: #E3F2FD;
      color: #1976D2;
    }
    
    &.completed {
      background: #E8F5E9;
      color: #2E7D32;
    }
  }
  
  .plan-goals {
    font-size: 26rpx;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 20rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  
  .plan-progress {
    display: flex;
    align-items: center;
  }
  
  .progress-bar {
    flex: 1;
    height: 12rpx;
    background: #F0F0F0;
    border-radius: 6rpx;
    overflow: hidden;
    margin-right: 20rpx;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, $warm, $warm-light);
    border-radius: 6rpx;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    font-size: 26rpx;
    font-weight: bold;
    color: $warm;
    width: 80rpx;
    text-align: right;
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
      background: linear-gradient(135deg, $warm-light, $warm);
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
    background: linear-gradient(135deg, $warm, $warm-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10rpx 40rpx rgba(224, 122, 95, 0.4);
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
