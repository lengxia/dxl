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
        <view class="nav-title">制定计划</view>
      </tn-nav-bar>
    </view>

    <view class="page-content" :style="{paddingTop: (vuex_custom_bar_height + 20) + 'px'}">
      <!-- 基本信息卡片 -->
      <view class="form-card">
        <view class="card-header">
          <view class="card-icon">
            <text class="tn-icon-flag"></text>
          </view>
          <view class="card-title">月度计划</view>
        </view>

        <tn-form :model="form" ref="planForm" :errorType="['message']">
          <!-- 计划月份 -->
          <view class="form-group">
            <view class="form-label required">
              <text class="label-icon tn-icon-calendar"></text>
              <text>计划月份</text>
            </view>
            <view class="form-input-box" @click="showTimePicker = true">
              <text :class="['input-value', !form.year_month ? 'placeholder' : '']">
                {{ form.year_month || '请选择月份' }}
              </text>
              <text class="tn-icon-right input-arrow"></text>
            </view>
          </view>

          <!-- 计划标题 -->
          <view class="form-group">
            <view class="form-label required">
              <text class="label-icon tn-icon-font"></text>
              <text>计划标题</text>
            </view>
            <view class="form-input-box">
              <input 
                v-model="form.title" 
                class="form-input" 
                placeholder="例如：甲辰年二月修行计划"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>
        </tn-form>
      </view>

      <!-- 目标设定 -->
      <view class="goals-section">
        <view class="section-header">
          <view class="section-title">
            <text class="tn-icon-target"></text>
            <text>目标设定</text>
          </view>
          <view class="section-count">{{ form.goals.length }} 个目标</view>
        </view>

        <view 
          v-for="(item, index) in form.goals" 
          :key="index" 
          class="goal-card"
        >
          <view class="goal-header">
            <view class="goal-number">{{ index + 1 }}</view>
            <view class="goal-delete" @click="removeGoal(index)" v-if="form.goals.length > 1">
              <text class="tn-icon-delete"></text>
            </view>
          </view>

          <!-- 分类选择 -->
          <view class="form-group">
            <view class="form-label">
              <text>分类</text>
            </view>
            <view class="category-tags">
              <view 
                v-for="(cate, i) in categories" 
                :key="i" 
                :class="['category-tag', item.category === cate.name ? 'active' : '', cate.class]"
                @click="selectCategory(index, cate.name)"
              >
                <text :class="['tag-icon', cate.icon]"></text>
                <text class="tag-name">{{ cate.name }}</text>
              </view>
            </view>
          </view>

          <!-- 目标内容 -->
          <view class="form-group">
            <view class="form-label">
              <text>内容</text>
            </view>
            <view class="form-input-box">
              <input 
                v-model="item.content" 
                class="form-input" 
                placeholder="目标内容，如：每日诵经一卷"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>

          <!-- 目标天数 -->
          <view class="form-group days-group">
            <view class="form-label">
              <text>目标天数</text>
            </view>
            <view class="days-input">
              <view class="days-btn minus" @click="adjustDays(item, -1)">
                <text class="tn-icon-minus"></text>
              </view>
              <view class="days-value">{{ item.target_days }}</view>
              <view class="days-btn plus" @click="adjustDays(item, 1)">
                <text class="tn-icon-add"></text>
              </view>
              <text class="days-unit">天</text>
            </view>
          </view>
        </view>

        <!-- 添加目标按钮 -->
        <view class="add-goal-btn" @click="addGoal">
          <text class="tn-icon-add"></text>
          <text>添加目标</text>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <view class="submit-btn" @click="submit">
          <text class="tn-icon-check"></text>
          <text>保存计划</text>
        </view>
      </view>
    </view>

    <tn-picker v-model="showTimePicker" mode="time" :params="{year: true, month: true, day: false}" @confirm="onTimeConfirm"></tn-picker>
  </view>
</template>

<script>
  import formPageMixin from '@/libs/form-page-mixin'

  export default {
    mixins: [formPageMixin],
    
    data() {
      return {
        showTimePicker: false,
        categories: [
          { name: '修身', icon: 'tn-icon-sport-jog', class: 'cate-body' },
          { name: '修心', icon: 'tn-icon-flower', class: 'cate-mind' },
          { name: '处世', icon: 'tn-icon-team', class: 'cate-social' },
          { name: '治业', icon: 'tn-icon-computer', class: 'cate-work' }
        ],
        form: {
          year_month: '',
          title: '',
          goals: [
            { category: '修身', content: '', target_days: 15, completed_days: 0 }
          ],
          status: 'planning'
        },
        rules: {
          year_month: [{ required: true, message: '请选择月份' }],
          title: [{ required: true, message: '请输入标题' }]
        }
      }
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      /**
       * 加载表单数据
       */
      async loadFormData(id) {
        const res = await this.$api.call('getMonthlyPlanDetail',
          { id },
          { showLoading: true, loadingText: '加载中...' }
        )
        
        if (res.success && res.data) {
          const data = res.data
          this.form = {
            year_month: data.year_month || '',
            title: data.title || '',
            goals: data.goals || [{ category: '修身', content: '', target_days: 15, completed_days: 0 }],
            status: data.status || 'planning'
          }
        }
      },
      /**
       * 获取API方法名
       */
      getApiMethods() {
        return {
          add: 'addMonthlyPlan',
          update: 'updateMonthlyPlan'
        };
      },
      /**
       * 处理表单数据
       */
      processFormData(formData) {
        if (this.editMode) {
          return {
            year_month: formData.year_month,
            title: formData.title,
            goals: formData.goals,
            status: formData.status,
            update_time: Date.now()
          };
        }
        return formData;
      },
      onTimeConfirm(e) {
        this.form.year_month = `${e.year}-${String(e.month).padStart(2, '0')}`;
      },
      adjustDays(item, delta) {
        const newVal = item.target_days + delta;
        if (newVal >= 1 && newVal <= 31) {
          item.target_days = newVal;
        }
      },
      addGoal() {
        this.form.goals.push({
          category: '修身',
          content: '',
          target_days: 15,
          completed_days: 0
        });
      },
      removeGoal(index) {
        this.form.goals.splice(index, 1);
      },
      selectCategory(goalIndex, category) {
        this.$set(this.form.goals[goalIndex], 'category', category);
      },
      /**
       * 提交表单
       */
      async submit() {
        if (!this.form.year_month) {
          uni.showToast({ title: '请选择月份', icon: 'none' })
          return
        }
        if (!this.form.title) {
          uni.showToast({ title: '请输入标题', icon: 'none' })
          return
        }
        
        // 校验 goals
        for (let g of this.form.goals) {
          if (!g.content) {
            uni.showToast({ title: '请填写目标内容', icon: 'none' })
            return
          }
        }
        
        await this.submitForm();
      }
    }
  }
</script>

<style lang="scss" scoped>
  $primary: #3D8B8F;
  $primary-light: #5AABAD;
  $accent: #C9A86C;
  $warm: #E07A5F;
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
    background: linear-gradient(135deg, $warm, #F09A7F);
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
    margin-bottom: 32rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
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
      color: $warm;
      margin-left: 6rpx;
    }
    
    .label-icon {
      font-size: 30rpx;
      color: $warm;
      margin-right: 12rpx;
    }
  }

  .form-input-box {
    background: #F9F8F5;
    border-radius: 16rpx;
    padding: 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .input-value {
      color: $text;
      font-size: 28rpx;
      
      &.placeholder {
        color: $text-hint;
      }
    }
    
    .input-arrow {
      color: $text-hint;
      font-size: 24rpx;
    }
  }

  .form-input {
    flex: 1;
    font-size: 28rpx;
    color: $text;
  }

  .input-placeholder {
    color: $text-hint;
  }

  // 目标设定区域
  .goals-section {
    margin-top: 30rpx;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
  }

  .section-title {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    font-weight: bold;
    color: $text;
    
    text:first-child {
      color: $warm;
      margin-right: 12rpx;
    }
  }

  .section-count {
    font-size: 26rpx;
    color: $text-hint;
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
    margin-bottom: 24rpx;
  }

  .goal-number {
    width: 50rpx;
    height: 50rpx;
    background: linear-gradient(135deg, $warm, #F09A7F);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 26rpx;
    font-weight: bold;
  }

  .goal-delete {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    text {
      color: #F56C6C;
      font-size: 36rpx;
    }
  }

  .category-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .category-tag {
    display: flex;
    align-items: center;
    padding: 14rpx 24rpx;
    background: #F9F8F5;
    border-radius: 30rpx;
    transition: all 0.2s;
    cursor: pointer;
    border: 2rpx solid transparent;
    
    .tag-icon {
      font-size: 28rpx;
      margin-right: 8rpx;
      color: $text-hint;
    }
    
    .tag-name {
      font-size: 26rpx;
      color: $text-secondary;
    }
    
    &:active:not(.active) {
      transform: scale(0.95);
      background: #F0EDE8;
    }
    
    &.active {
      border: 2rpx solid transparent;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
      transform: scale(1.05);
      
      &.cate-body {
        background: linear-gradient(135deg, $primary, $primary-light);
      }
      &.cate-mind {
        background: linear-gradient(135deg, #7B68EE, #9B8AFF);
      }
      &.cate-social {
        background: linear-gradient(135deg, $accent, #D4B87A);
      }
      &.cate-work {
        background: linear-gradient(135deg, $warm, #F09A7F);
      }
      
      .tag-icon, .tag-name {
        color: #FFFFFF;
        font-weight: 500;
      }
      
      .tag-name {
        font-weight: 500;
      }
    }
  }

  .days-group {
    .form-label {
      margin-bottom: 20rpx;
    }
  }

  .days-input {
    display: flex;
    align-items: center;
  }

  .days-btn {
    width: 70rpx;
    height: 70rpx;
    background: #F9F8F5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    text {
      font-size: 32rpx;
      color: $text-secondary;
    }
    
    &.plus {
      background: linear-gradient(135deg, $warm, #F09A7F);
      
      text {
        color: #FFFFFF;
      }
    }
    
    &:active {
      opacity: 0.8;
    }
  }

  .days-value {
    width: 100rpx;
    text-align: center;
    font-size: 48rpx;
    font-weight: bold;
    color: $warm;
  }

  .days-unit {
    font-size: 28rpx;
    color: $text-secondary;
    margin-left: 16rpx;
  }

  .add-goal-btn {
    background: $card-bg;
    border: 2rpx dashed #D0D0D0;
    border-radius: 24rpx;
    padding: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    text {
      color: $warm;
      font-size: 28rpx;
      
      &:first-child {
        font-size: 32rpx;
        margin-right: 12rpx;
      }
    }
    
    &:active {
      background: #F9F8F5;
    }
  }

  .submit-section {
    margin-top: 50rpx;
    padding-bottom: 40rpx;
  }

  .submit-btn {
    background: linear-gradient(135deg, $warm 0%, #F09A7F 100%);
    border-radius: 50rpx;
    padding: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10rpx 40rpx rgba(224, 122, 95, 0.4);
    
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
