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
        <view class="nav-title">计划详情</view>
      </tn-nav-bar>
    </view>

    <view class="page-content" :style="{paddingTop: (vuex_custom_bar_height + 20) + 'px'}" v-if="plan">
      <!-- 头部卡片 -->
      <view class="header-card">
        <view class="header-top">
          <view class="plan-title">{{ plan.title }}</view>
          <view :class="['status-badge', plan.status]">
            {{ statusText(plan.status) }}
          </view>
        </view>
        <view class="header-meta">
          <view class="meta-item">
            <text class="tn-icon-calendar"></text>
            <text>{{ plan.year_month }}</text>
          </view>
          <view class="meta-item">
            <text class="tn-icon-target"></text>
            <text>{{ plan.goals.length }} 个目标</text>
          </view>
        </view>
        
        <!-- 总体进度 -->
        <view class="overall-progress">
          <view class="progress-header">
            <text class="progress-label">总体完成度</text>
            <text class="progress-value">{{ overallProgress }}%</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{width: overallProgress + '%'}"></view>
          </view>
        </view>
      </view>

      <!-- 目标列表 -->
      <view class="goals-section">
        <view class="section-title">
          <text class="tn-icon-list"></text>
          <text>目标清单</text>
        </view>
        
        <view 
          v-for="(goal, index) in plan.goals" 
          :key="index" 
          class="goal-card"
        >
          <view class="goal-header">
            <view :class="['goal-category', categoryClass(goal.category)]">
              <text :class="categoryIcon(goal.category)"></text>
              <text>{{ goal.category }}</text>
            </view>
            <view class="goal-progress-text">
              <text class="completed">{{ goal.completed_days }}</text>
              <text class="separator">/</text>
              <text class="target">{{ goal.target_days }}</text>
              <text class="unit">天</text>
            </view>
          </view>
          
          <view class="goal-content">{{ goal.content }}</view>
          
          <view class="goal-progress-bar">
            <view 
              class="progress-fill" 
              :class="categoryClass(goal.category)"
              :style="{width: calculateProgress(goal) + '%'}"
            ></view>
          </view>
          
          <view class="goal-actions">
            <view 
              :class="['check-btn', goal.completed_days >= goal.target_days ? 'completed' : '']"
              @click="incrementProgress(index)"
            >
              <text class="tn-icon-check"></text>
              <text>{{ goal.completed_days >= goal.target_days ? '已完成' : '打卡+1' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 删除按钮 -->
      <view class="action-section">
        <view class="delete-btn" @click="deletePlan">
          <text class="tn-icon-delete"></text>
          <text>删除计划</text>
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view class="loading-state" v-else :style="{paddingTop: (vuex_custom_bar_height + 100) + 'px'}">
      <tn-loading mode="flower" color="#E07A5F"></tn-loading>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        id: '',
        plan: null
      }
    },
    computed: {
      overallProgress() {
        if (!this.plan || !this.plan.goals.length) return 0;
        let totalTarget = 0;
        let totalCompleted = 0;
        this.plan.goals.forEach(g => {
          totalTarget += g.target_days;
          totalCompleted += g.completed_days;
        });
        if (totalTarget === 0) return 0;
        return Math.round((totalCompleted / totalTarget) * 100);
      }
    },
    onLoad(options) {
      if (options.id) {
        this.id = options.id;
        this.loadData();
      }
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      async loadData() {
        const db = uniCloud.database();
        try {
          const res = await db.collection('monthly_plans').doc(this.id).get();
          if (res.result.data && res.result.data.length > 0) {
            this.plan = res.result.data[0];
          }
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
        return map[status] || status;
      },
      categoryIcon(cate) {
        const map = { 
          '修身': 'tn-icon-heart', 
          '修心': 'tn-icon-flower', 
          '处世': 'tn-icon-peoples', 
          '治业': 'tn-icon-work' 
        };
        return map[cate] || 'tn-icon-star';
      },
      categoryClass(cate) {
        const map = { 
          '修身': 'cate-body', 
          '修心': 'cate-mind', 
          '处世': 'cate-social', 
          '治业': 'cate-work' 
        };
        return map[cate] || '';
      },
      calculateProgress(goal) {
        if (!goal.target_days) return 0;
        const p = Math.round((goal.completed_days / goal.target_days) * 100);
        return p > 100 ? 100 : p;
      },
      async incrementProgress(index) {
        const goal = this.plan.goals[index];
        if (goal.completed_days >= goal.target_days) {
          uni.showToast({ title: '目标已完成', icon: 'none' });
          return;
        }
        
        goal.completed_days++;
        
        const db = uniCloud.database();
        try {
          await db.collection('monthly_plans').doc(this.id).update({
            goals: this.plan.goals,
            update_time: db.command.set(Date.now())
          });
          uni.showToast({ title: '打卡成功', icon: 'success' });
        } catch (e) {
          goal.completed_days--;
          uni.showToast({ title: '操作失败', icon: 'none' });
        }
      },
      deletePlan() {
        uni.showModal({
          title: '确认删除',
          content: '删除后将无法恢复，确定要删除这个计划吗？',
          confirmColor: '#E07A5F',
          success: async (res) => {
            if (res.confirm) {
              uni.showLoading({ title: '删除中' });
              const db = uniCloud.database();
              try {
                await db.collection('monthly_plans').doc(this.id).remove();
                uni.hideLoading();
                uni.showToast({ title: '已删除', icon: 'success' });
                setTimeout(() => {
                  uni.navigateBack();
                }, 1500);
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
  $primary: #3D8B8F;
  $primary-light: #5AABAD;
  $accent: #C9A86C;
  $warm: #E07A5F;
  $purple: #7B68EE;
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
    height: 380rpx;
    background: linear-gradient(160deg, $warm 0%, #F09A7F 100%);
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

  .header-card {
    background: $card-bg;
    border-radius: 28rpx;
    padding: 40rpx 30rpx;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.08);
    margin-bottom: 30rpx;
  }

  .header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20rpx;
  }

  .plan-title {
    flex: 1;
    font-size: 38rpx;
    font-weight: bold;
    color: $text;
    line-height: 1.4;
    margin-right: 20rpx;
  }

  .status-badge {
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: 500;
    white-space: nowrap;
    
    &.planning {
      background: rgba($accent, 0.15);
      color: $accent;
    }
    &.in_progress {
      background: rgba($primary, 0.15);
      color: $primary;
    }
    &.completed {
      background: rgba(#66BB6A, 0.15);
      color: #66BB6A;
    }
  }

  .header-meta {
    display: flex;
    gap: 30rpx;
    margin-bottom: 30rpx;
  }

  .meta-item {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: $text-secondary;
    
    text:first-child {
      color: $warm;
      margin-right: 8rpx;
    }
  }

  .overall-progress {
    background: #F9F8F5;
    border-radius: 20rpx;
    padding: 24rpx;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  .progress-label {
    font-size: 26rpx;
    color: $text-secondary;
  }

  .progress-value {
    font-size: 28rpx;
    font-weight: bold;
    color: $warm;
  }

  .progress-bar {
    height: 16rpx;
    background: #E8E8E8;
    border-radius: 8rpx;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, $warm, #F09A7F);
      border-radius: 8rpx;
      transition: width 0.3s ease;
    }
  }

  .goals-section {
    margin-bottom: 30rpx;
  }

  .section-title {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    font-weight: bold;
    color: $text;
    margin-bottom: 24rpx;
    
    text:first-child {
      color: $warm;
      margin-right: 12rpx;
    }
  }

  .goal-card {
    background: $card-bg;
    border-radius: 24rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  }

  .goal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  .goal-category {
    display: flex;
    align-items: center;
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    
    text:first-child {
      margin-right: 8rpx;
    }
    
    &.cate-body {
      background: rgba($primary, 0.1);
      color: $primary;
    }
    &.cate-mind {
      background: rgba($purple, 0.1);
      color: $purple;
    }
    &.cate-social {
      background: rgba($accent, 0.1);
      color: $accent;
    }
    &.cate-work {
      background: rgba($warm, 0.1);
      color: $warm;
    }
  }

  .goal-progress-text {
    display: flex;
    align-items: baseline;
    
    .completed {
      font-size: 36rpx;
      font-weight: bold;
      color: $warm;
    }
    .separator {
      font-size: 28rpx;
      color: $text-hint;
      margin: 0 6rpx;
    }
    .target {
      font-size: 28rpx;
      color: $text-secondary;
    }
    .unit {
      font-size: 24rpx;
      color: $text-hint;
      margin-left: 6rpx;
    }
  }

  .goal-content {
    font-size: 30rpx;
    color: $text;
    margin-bottom: 20rpx;
    line-height: 1.5;
  }

  .goal-progress-bar {
    height: 12rpx;
    background: #F0EDE8;
    border-radius: 6rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
    
    .progress-fill {
      height: 100%;
      border-radius: 6rpx;
      transition: width 0.3s ease;
      
      &.cate-body {
        background: linear-gradient(90deg, $primary, $primary-light);
      }
      &.cate-mind {
        background: linear-gradient(90deg, $purple, #9B8AFF);
      }
      &.cate-social {
        background: linear-gradient(90deg, $accent, #D4B87A);
      }
      &.cate-work {
        background: linear-gradient(90deg, $warm, #F09A7F);
      }
    }
  }

  .goal-actions {
    display: flex;
    justify-content: flex-end;
  }

  .check-btn {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, $warm, #F09A7F);
    padding: 14rpx 30rpx;
    border-radius: 30rpx;
    
    text {
      color: #FFFFFF;
      font-size: 26rpx;
      
      &:first-child {
        margin-right: 8rpx;
      }
    }
    
    &.completed {
      background: #E8E8E8;
      
      text {
        color: $text-hint;
      }
    }
    
    &:active:not(.completed) {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }

  .action-section {
    margin-top: 20rpx;
  }

  .delete-btn {
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
