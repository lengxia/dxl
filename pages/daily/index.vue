<template>
  <view class="daily-page tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="" fixed customBack :backgroundColor="navBgColor" :bottomShadow="false">
      <view slot="back" class="nav-back" @click="goBack">
        <view class="back-btn">
          <text class="tn-icon-left" :style="{color: navTextColor}"></text>
        </view>
      </view>
      <view class="nav-title" :style="{color: navTextColor}">每日功课</view>
    </tn-nav-bar>

    <view class="page-wrapper">
      <!-- 顶部背景 -->
      <view class="header-bg"></view>
      
      <!-- 未登录状态 -->
      <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}" v-if="!isLogin">
        <view class="login-guide-card">
          <view class="guide-icon">
            <text class="tn-icon-wechat"></text>
          </view>
          <view class="guide-text">请登录以查看每日功课</view>
          <tn-button 
            shape="round" 
            backgroundColor="#3D8B8F" 
            fontColor="#FFFFFF" 
            width="280rpx"
            shadow
            @click="goBack"
          >
            去登录
          </tn-button>
        </view>
      </view>

      <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}" v-else>
        
        <!-- 头部统计卡片 -->
        <view class="stats-card">
          <view class="stats-header">
            <view class="stats-title">修行数据</view>
            <view class="stats-date">{{ todayStr }}</view>
          </view>
          <view class="stats-grid">
            <view class="stat-item">
              <view class="stat-value primary">{{ stats.continuous_days }}</view>
              <view class="stat-label">连续修持</view>
              <view class="stat-unit">天</view>
            </view>
            <view class="stat-item">
              <view class="stat-value accent">{{ stats.total_score }}</view>
              <view class="stat-label">累计功德</view>
              <view class="stat-unit">分</view>
            </view>
            <view class="stat-item">
              <view class="stat-value warm">{{ stats.level }}</view>
              <view class="stat-label">修行等级</view>
              <view class="stat-unit">级</view>
            </view>
          </view>
        </view>

        <!-- 打卡日历视图 -->
        <view class="calendar-section">
          <view class="section-header">
            <view class="section-title">打卡日历</view>
            <view class="calendar-stats">
              本月打卡 <text class="highlight">{{ monthCheckedCount }}</text> 天
            </view>
          </view>
          <view class="calendar-wrapper">
            <!-- 月份切换 -->
            <view class="calendar-header">
              <view class="month-switch" @click="changeMonth(-1)">
                <text class="tn-icon-left"></text>
              </view>
              <view class="month-text">{{ currentYear }}年{{ currentMonth }}月</view>
              <view class="month-switch" @click="changeMonth(1)">
                <text class="tn-icon-right"></text>
              </view>
            </view>
            
            <!-- 星期标题 -->
            <view class="calendar-weekdays">
              <view class="weekday-item" v-for="(week, index) in weekdays" :key="index">
                {{ week }}
              </view>
            </view>
            
            <!-- 日期网格 -->
            <view class="calendar-days">
              <view 
                v-for="(day, index) in calendarDays" 
                :key="index"
                class="day-item"
                :class="{
                  'is-other-month': day.isOtherMonth,
                  'is-today': day.isToday,
                  'is-checked': day.isChecked
                }"
              >
                <view class="day-number">{{ day.day }}</view>
                <view v-if="day.isChecked && !day.isOtherMonth" class="check-dot"></view>
              </view>
            </view>
          </view>
        </view>

        <!-- 今日功课卡片 -->
        <view class="today-section">
          <view class="section-header">
            <view class="section-title">今日功课</view>
            <tn-tag 
              :backgroundColor="todayTask ? '#E8F5E9' : '#FFF3E0'" 
              :fontColor="todayTask ? '#2E7D32' : '#E65100'"
              shape="circle" 
              size="sm"
            >
              {{ todayTask ? '已完成' : '未完成' }}
            </tn-tag>
          </view>
          
          <view class="today-card">
            <view v-if="!todayTask" class="empty-state">
              <view class="empty-icon">
                <text class="tn-icon-moon"></text>
              </view>
              <view class="empty-text">今日功课尚未开始</view>
              <view class="empty-hint">点击下方按钮开始今日修行</view>
              <tn-button 
                shape="round" 
                backgroundColor="#3D8B8F" 
                fontColor="#FFFFFF" 
                width="280rpx"
                shadow
                @click="goCheck"
              >
                开始打卡
              </tn-button>
            </view>
            
            <view v-else class="task-result">
              <view class="score-display">
                <view class="score-circle">
                  <view class="score-number">{{ todayTask.total_score }}</view>
                  <view class="score-label">今日得分</view>
                </view>
              </view>
              
              <view class="mind-check">
                <view class="check-title">心念检视</view>
                <view class="check-tags">
                  <view v-if="todayTask.mind_check.anxiety" class="tag negative">焦躁</view>
                  <view v-if="todayTask.mind_check.greed" class="tag negative">贪欲</view>
                  <view v-if="todayTask.mind_check.arrogance" class="tag negative">傲慢</view>
                  <view v-if="todayTask.mind_check.anger" class="tag negative">嗔怒</view>
                  <view v-if="!isHasMindIssues(todayTask.mind_check)" class="tag positive">心如止水</view>
                </view>
              </view>

              <view class="edit-btn" @click="goCheck">
                <text class="tn-icon-edit"></text>
                <text>修改记录</text>
              </view>
            </view>
          </view>
        </view>

      </view>
    </view>
  </view>
</template>

<script>
  import { checkLogin, getCurrentUid } from '@/libs/auth.js';

  export default {
    data() {
      return {
        todayStr: '',
        todayTask: null,
        scrollTop: 0,
        stats: {
          continuous_days: 0,
          total_score: 0,
          level: 1
        },
        isLogin: false,
        
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1,
        calendarDays: [],
        monthCheckedCount: 0,
        checkedDates: [],         // 已打卡日期列表
        weekdays: ['日', '一', '二', '三', '四', '五', '六'],
        lastLoadDataTime: 0,      // 每日任务加载时间戳
        lastLoadCalendarTime: 0   // 日历数据加载时间戳
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
      const now = new Date();
      this.todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      
      this.isLogin = checkLogin();
      
      if (this.isLogin) {
        // 节流：5秒内不重复加载每日任务
        const nowTime = Date.now();
        if (nowTime - this.lastLoadDataTime >= 5000) {
          this.loadData();
        }
        
        // 节流：8秒内不重复加载日历数据（变化频率更低）
        if (nowTime - this.lastLoadCalendarTime >= 8000) {
          this.loadCalendarData();
        }
      }
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      goCheck() {
        // 如果今日已有打卡记录，传递日期用于编辑模式
        const query = this.todayTask ? `?date=${this.todayStr}` : '';
        uni.navigateTo({
          url: `/pages/daily/check${query}`
        });
      },
      isHasMindIssues(mind) {
        return mind.anxiety || mind.greed || mind.arrogance || mind.anger;
      },
      
      // 切换月份
      changeMonth(offset) {
        this.currentMonth += offset;
        if (this.currentMonth > 12) {
          this.currentMonth = 1;
          this.currentYear++;
        } else if (this.currentMonth < 1) {
          this.currentMonth = 12;
          this.currentYear--;
        }
        
        // 先清空旧数据，立即重新生成日历
        this.checkedDates = [];
        this.generateCalendar();
        
        // 节流：2秒内不重复加载（防止快速点击）
        const nowTime = Date.now();
        if (nowTime - this.lastLoadCalendarTime >= 2000) {
          this.loadCalendarData();
        }
      },
      
      // 生成日历数据
      generateCalendar() {
        const year = this.currentYear;
        const month = this.currentMonth;
        
        // 当月第一天是星期几（0-6）
        const firstDay = new Date(year, month - 1, 1).getDay();
        
        // 当月有多少天
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // 上个月有多少天
        const prevMonthDays = new Date(year, month - 1, 0).getDate();
        
        const days = [];
        
        // 填充上个月的日期
        for (let i = firstDay - 1; i >= 0; i--) {
          days.push({
            day: prevMonthDays - i,
            isOtherMonth: true,
            isToday: false,
            isChecked: false
          });
        }
        
        // 填充当月的日期
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth() + 1;
        const todayDate = today.getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
          days.push({
            day: i,
            isOtherMonth: false,
            isToday: year === todayYear && month === todayMonth && i === todayDate,
            isChecked: this.checkedDates.includes(dateStr)
          });
        }
        
        // 填充下个月的日期，补齐到42个格子（6行 x 7列）
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
          days.push({
            day: i,
            isOtherMonth: true,
            isToday: false,
            isChecked: false
          });
        }
        
        this.calendarDays = days;
        
        // 统计本月打卡天数
        this.monthCheckedCount = days.filter(d => !d.isOtherMonth && d.isChecked).length;
      },
      
      async loadCalendarData() {
        if (!checkLogin()) {
          return;
        }
        
        const uid = getCurrentUid();
        if (!uid) {
          return;
        }
        
        const yearMonth = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}`;
        
        try {
          const waterApi = uniCloud.importObject('water-api', { customUI: true });
          const res = await waterApi.getMonthlyCheckIns({ uid, yearMonth });
          
          if (res.errCode === 0) {
            this.checkedDates = res.data || [];
            this.monthCheckedCount = this.checkedDates.length;
            this.generateCalendar();
            this.lastLoadCalendarTime = Date.now();  // 更新加载时间
          } else {
            this.checkedDates = [];
            this.monthCheckedCount = 0;
            this.generateCalendar();
            this.lastLoadCalendarTime = Date.now();
          }
        } catch (e) {
          // 数据库资源耗尽错误
          if (e.message && e.message.indexOf('resource exhausted') > -1) {
            uni.showToast({ 
              title: '服务器繁忙，请稍后再试', 
              icon: 'none',
              duration: 2000
            });
            return;
          }
        }
      },
      async loadData() {
        if (!checkLogin()) {
          return;
        }
        
        const uid = getCurrentUid();
        if (!uid) {
          return;
        }
        
        try {
          const waterApi = uniCloud.importObject('water-api', { customUI: true });
          const res = await waterApi.getDailyTask({ date: this.todayStr, uid });
          
          if (res.errCode === 0 && res.data) {
            this.todayTask = res.data;
            this.lastLoadDataTime = Date.now();  // 更新加载时间
          } else {
            this.todayTask = null;
            this.lastLoadDataTime = Date.now();
          }
        } catch (e) {
          // 数据库资源耗尽错误
          if (e.message && e.message.indexOf('resource exhausted') > -1) {
            uni.showToast({ 
              title: '服务器繁忙，请稍后再试', 
              icon: 'none',
              duration: 2000
            });
            return;
          }
          // 如果是匿名身份错误，清除token
          if (e.message && e.message.indexOf('匿名') > -1) {
            uni.removeStorageSync('uni_id_token');
            uni.removeStorageSync('uni_id_token_expired');
            uni.removeStorageSync('uni_id_user_uid');
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
  $accent: #C9A86C;
  $accent-light: #E8D4A8;
  $warm: #E07A5F;
  $bg: #F7F5F0;
  $card-bg: #FFFEFB;
  $text: #2D3436;
  $text-secondary: #636E72;
  $text-hint: #B2BEC3;

  .daily-page {
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
    height: 400rpx;
    background: linear-gradient(180deg, $primary 0%, $primary-light 100%);
    border-radius: 0 0 60rpx 60rpx;
  }
  
  .page-content {
    position: relative;
    z-index: 1;
    padding: 30rpx;
  }
  
  // 登录引导
  .login-guide-card {
    background: #FFFFFF;
    border-radius: 28rpx;
    padding: 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.05);
    margin-top: 40rpx;
    
    .guide-icon {
      width: 120rpx;
      height: 120rpx;
      background: rgba(61, 139, 143, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30rpx;
      
      text {
        font-size: 60rpx;
        color: $primary;
      }
    }
    
    .guide-text {
      font-size: 30rpx;
      color: $text;
      margin-bottom: 40rpx;
      font-weight: bold;
    }
  }

  // 统计卡片
  .stats-card {
    background: $card-bg;
    border-radius: 28rpx;
    padding: 36rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 10rpx 50rpx rgba(0, 0, 0, 0.1);
  }
  
  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .stats-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text;
    }
    
    .stats-date {
      font-size: 24rpx;
      color: $text-hint;
    }
  }
  
  .stats-grid {
    display: flex;
    justify-content: space-around;
  }
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      font-size: 52rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
      
      &.primary { color: $primary; }
      &.accent { color: $accent; }
      &.warm { color: $warm; }
    }
    
    .stat-label {
      font-size: 24rpx;
      color: $text-hint;
      margin-bottom: 4rpx;
    }
    
    .stat-unit {
      font-size: 20rpx;
      color: $text-hint;
    }
  }

  // 日历区域
  .calendar-section {
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
        background: $primary;
        border-radius: 3rpx;
      }
    }
    
    .calendar-stats {
      font-size: 24rpx;
      color: $text-hint;
      
      .highlight {
        color: $primary;
        font-weight: bold;
        font-size: 28rpx;
      }
    }
  }
  
  .calendar-wrapper {
    background: $card-bg;
    border-radius: 24rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding: 0 10rpx;
    
    .month-switch {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: $bg;
      
      text {
        font-size: 32rpx;
        color: $text;
      }
    }
    
    .month-text {
      font-size: 32rpx;
      font-weight: bold;
      color: $text;
    }
  }
  
  .calendar-weekdays {
    display: flex;
    margin-bottom: 16rpx;
    
    .weekday-item {
      flex: 1;
      text-align: center;
      font-size: 24rpx;
      color: $text-hint;
      padding: 12rpx 0;
    }
  }
  
  .calendar-days {
    display: flex;
    flex-wrap: wrap;
    
    .day-item {
      width: calc(100% / 7);
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      margin-bottom: 10rpx;
      
      .day-number {
        font-size: 28rpx;
        color: $text;
      }
      
      .check-dot {
        width: 8rpx;
        height: 8rpx;
        background: $primary;
        border-radius: 50%;
        margin-top: 4rpx;
      }
      
      &.is-other-month {
        .day-number {
          color: $text-hint;
          opacity: 0.3;
        }
      }
      
      &.is-today {
        .day-number {
          background: linear-gradient(135deg, $primary, $primary-light);
          color: #FFFFFF;
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      }
      
      &.is-checked:not(.is-today) {
        .day-number {
          color: $primary;
          font-weight: bold;
        }
      }
    }
  }

  // 今日功课
  .today-section {
    margin-bottom: 30rpx;
  }
  
  .today-card {
    background: $card-bg;
    border-radius: 24rpx;
    padding: 40rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0;
    
    .empty-icon {
      width: 120rpx;
      height: 120rpx;
      background: linear-gradient(135deg, $accent-light, $accent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30rpx;
      
      text {
        font-size: 60rpx;
        color: #FFFFFF;
      }
    }
    
    .empty-text {
      font-size: 32rpx;
      font-weight: bold;
      color: $text;
      margin-bottom: 10rpx;
    }
    
    .empty-hint {
      font-size: 26rpx;
      color: $text-hint;
      margin-bottom: 40rpx;
    }
  }
  
  .task-result {
    .score-display {
      display: flex;
      justify-content: center;
      margin-bottom: 30rpx;
    }
    
    .score-circle {
      width: 200rpx;
      height: 200rpx;
      background: linear-gradient(135deg, $primary, $primary-light);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10rpx 40rpx rgba(61, 139, 143, 0.3);
      
      .score-number {
        font-size: 60rpx;
        font-weight: bold;
        color: #FFFFFF;
      }
      
      .score-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .mind-check {
      background: $bg;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 24rpx;
      
      .check-title {
        font-size: 26rpx;
        font-weight: bold;
        color: $text;
        margin-bottom: 16rpx;
      }
      
      .check-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
      }
      
      .tag {
        font-size: 24rpx;
        padding: 8rpx 20rpx;
        border-radius: 20rpx;
        
        &.negative {
          background: #FFEBEE;
          color: #C62828;
        }
        
        &.positive {
          background: #E8F5E9;
          color: #2E7D32;
        }
      }
    }
    
    .edit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx;
      border: 2rpx solid $primary;
      border-radius: 40rpx;
      color: $primary;
      font-size: 28rpx;
      
      text:first-child {
        margin-right: 10rpx;
      }
    }
  }
</style>