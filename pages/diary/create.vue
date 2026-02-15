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
        <view class="nav-title">记录善行</view>
      </tn-nav-bar>
    </view>

    <view class="page-content" :style="{paddingTop: (vuex_custom_bar_height + 20) + 'px'}">
      <!-- 表单卡片 -->
      <view class="form-card">
        <view class="card-header">
          <view class="card-icon">
            <text class="tn-icon-star"></text>
          </view>
          <view class="card-title">善行记录</view>
        </view>

        <tn-form :model="form" ref="diaryForm" :errorType="['message']">
          <!-- 日期选择 -->
          <view class="form-group">
            <view class="form-label">
              <text class="label-icon tn-icon-calendar"></text>
              <text>日期</text>
            </view>
            <view class="form-input-box" @click="showCalendar = true">
              <text class="input-value">{{ form.date }}</text>
              <text class="tn-icon-right input-arrow"></text>
            </view>
          </view>

          <!-- 类型选择 -->
          <view class="form-group">
            <view class="form-label">
              <text class="label-icon tn-icon-category"></text>
              <text>类型</text>
            </view>
            <view class="type-tags">
              <view 
                v-for="(item, index) in types" 
                :key="index" 
                :class="['type-tag', form.deed_type === item ? 'active' : '']"
                @click="form.deed_type = item"
              >
                {{ item }}
              </view>
            </view>
          </view>

          <!-- 事由 -->
          <view class="form-group">
            <view class="form-label required">
              <text class="label-icon tn-icon-edit"></text>
              <text>事由</text>
            </view>
            <view class="form-input-box">
              <input 
                v-model="form.title" 
                class="form-input" 
                placeholder="简述善行..."
                placeholder-class="input-placeholder"
              />
            </view>
          </view>

          <!-- 详情 -->
          <view class="form-group">
            <view class="form-label">
              <text class="label-icon tn-icon-text"></text>
              <text>详情</text>
            </view>
            <view class="form-textarea-box">
              <textarea 
                v-model="form.content" 
                class="form-textarea" 
                placeholder="详细描述过程..."
                placeholder-class="input-placeholder"
                :maxlength="500"
              />
            </view>
          </view>

          <!-- 发心 -->
          <view class="form-group">
            <view class="form-label">
              <text class="label-icon tn-icon-heart"></text>
              <text>发心</text>
            </view>
            <view class="form-input-box">
              <input 
                v-model="form.intention" 
                class="form-input" 
                placeholder="当时的起心动念"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>

          <!-- 回甘 -->
          <view class="form-group">
            <view class="form-label">
              <text class="label-icon tn-icon-flower"></text>
              <text>回甘</text>
            </view>
            <view class="form-input-box">
              <input 
                v-model="form.feeling" 
                class="form-input" 
                placeholder="事后的感受"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>

          <!-- 功德值 -->
          <view class="form-group">
            <view class="form-label">
              <text class="label-icon tn-icon-fire"></text>
              <text>功德值</text>
              <text class="merit-value">{{ form.merit_points }} 分</text>
            </view>
            <view class="slider-box">
              <view class="slider-track">
                <view class="slider-fill" :style="{width: (form.merit_points * 10) + '%'}"></view>
                <view class="slider-thumb" :style="{left: (form.merit_points * 10) + '%'}">
                  <text>{{ form.merit_points }}</text>
                </view>
              </view>
              <slider 
                :value="form.merit_points" 
                :min="1" 
                :max="10" 
                activeColor="#C9A86C"
                backgroundColor="#E8E8E8"
                block-size="24"
                @change="onSliderChange"
              />
            </view>
            <view class="slider-hint">请根据善行的大小和发心的纯粹程度诚实评分</view>
          </view>

          <!-- 公开开关 -->
          <view class="form-group switch-group">
            <view class="switch-left">
              <view class="form-label">
                <text class="label-icon tn-icon-eye"></text>
                <text>公开</text>
              </view>
              <view class="switch-hint">公开后可激励他人</view>
            </view>
            <switch 
              :checked="form.is_public" 
              color="#C9A86C"
              @change="form.is_public = !form.is_public"
            />
          </view>
        </tn-form>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <view class="submit-btn" @click="submit">
          <text class="tn-icon-check"></text>
          <text>铭记善行</text>
        </view>
      </view>
    </view>
    
    <tn-calendar v-model="showCalendar" mode="date" :changeYear="true" :changeMonth="true" @change="onDateChange"></tn-calendar>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        editMode: false, // 是否为编辑模式
        editId: '', // 编辑的记录ID
        showCalendar: false,
        types: ["助人", "爱物", "环保", "孝亲", "其他"],
        form: {
          date: '',
          deed_type: '助人',
          title: '',
          content: '',
          intention: '',
          feeling: '',
          merit_points: 5,
          is_public: false
        },
        rules: {
          title: [{ required: true, message: '请输入事由' }],
          date: [{ required: true, message: '请选择日期' }]
        }
      }
    },
    onLoad(options) {
      // 如果传入了 id 参数，说明是编辑模式
      if (options.id) {
        this.editMode = true;
        this.editId = options.id;
        this.loadExistingData(options.id);
      } else {
        const now = new Date();
        this.form.date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      }
    },
    onReady() {
      this.$refs.diaryForm.setRules(this.rules);
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      onDateChange(e) {
        this.form.date = e.result;
      },
      onSliderChange(e) {
        this.form.merit_points = e.detail.value;
      },
      // 加载已有的日记数据（编辑模式）
      async loadExistingData(id) {
        uni.showLoading({ title: '加载中...' });
        
        try {
          const waterApi = uniCloud.importObject('water-api', { customUI: true });
          const res = await waterApi.getDiaryDetail({ id });
          
          if (res.errCode === 0 && res.data) {
            const data = res.data;
            
            // 回显数据到表单
            this.form = {
              date: data.date || '',
              deed_type: data.deed_type || '助人',
              title: data.title || '',
              content: data.content || '',
              intention: data.intention || '',
              feeling: data.feeling || '',
              merit_points: data.merit_points || 5,
              is_public: data.is_public || false
            };
            
            uni.hideLoading();
          } else {
            uni.hideLoading();
            uni.showToast({ title: '加载失败', icon: 'none' });
          }
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: '加载失败: ' + e.message, icon: 'none' });
        }
      },
      async submit() {
        if (!this.form.title) {
          uni.showToast({ title: '请输入事由', icon: 'none' });
          return;
        }
        
        uni.showLoading({ title: this.editMode ? '更新中' : '记录中' });
        
        try {
          const waterApi = uniCloud.importObject('water-api', { customUI: true });
          
          let res;
          if (this.editMode) {
            // 编辑模式：调用更新接口
            res = await waterApi.updateDiary({
              id: this.editId,
              ...this.form
            });
          } else {
            // 新增模式：调用添加接口
            const data = {
              ...this.form,
              user_id: uniCloud.getCurrentUserInfo().uid || uni.getStorageSync('uni_id_user_uid')
            };
            res = await waterApi.addDiary(data);
          }
          
          if (res.errCode === 0) {
            uni.hideLoading();
            uni.showToast({ title: this.editMode ? '更新成功' : '记录成功', icon: 'success' });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            throw new Error(res.errMsg);
          }
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: '保存失败', icon: 'none' });
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
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
    background: linear-gradient(160deg, $accent 0%, #D4B87A 100%);
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
    background: linear-gradient(135deg, $accent-light, $accent);
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
      color: $warm;
      margin-left: 6rpx;
    }
    
    .label-icon {
      font-size: 30rpx;
      color: $accent;
      margin-right: 12rpx;
    }
    
    .merit-value {
      margin-left: auto;
      color: $accent;
      font-weight: bold;
      font-size: 32rpx;
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

  .form-textarea-box {
    background: #F9F8F5;
    border-radius: 16rpx;
    padding: 24rpx;
  }

  .form-textarea {
    width: 100%;
    min-height: 180rpx;
    font-size: 28rpx;
    color: $text;
    line-height: 1.6;
  }

  .type-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .type-tag {
    padding: 16rpx 32rpx;
    background: #F9F8F5;
    border-radius: 30rpx;
    font-size: 26rpx;
    color: $text-secondary;
    transition: all 0.2s;
    
    &.active {
      background: linear-gradient(135deg, $accent-light, $accent);
      color: #FFFFFF;
      font-weight: 500;
    }
  }

  .slider-box {
    margin-top: 10rpx;
    
    .slider-track {
      display: none;
    }
  }

  .slider-hint {
    font-size: 24rpx;
    color: $text-hint;
    margin-top: 10rpx;
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
    background: linear-gradient(135deg, $accent 0%, #D4B87A 100%);
    border-radius: 50rpx;
    padding: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10rpx 40rpx rgba(201, 168, 108, 0.4);
    
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
