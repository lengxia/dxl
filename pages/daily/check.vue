<template>
  <view class="check-page tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="" fixed customBack backgroundColor="#FFFEFB" :bottomShadow="false">
      <view slot="back" class="nav-back" @click="goBack">
        <view class="back-btn">
          <text class="tn-icon-left"></text>
        </view>
      </view>
      <view class="nav-title">功课打卡</view>
    </tn-nav-bar>

    <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      
      <!-- 实时得分展示 -->
      <view class="score-section">
        <view class="score-card">
          <view class="score-bg"></view>
          <view class="score-content">
            <view class="score-label">当前功德分</view>
            <view class="score-value">{{ currentScore }}</view>
            <view class="score-hint">继续完善以获得更高分数</view>
          </view>
        </view>
      </view>

      <tn-form :model="form" ref="checkForm">
        
        <!-- 1. 心念检视 -->
        <view class="form-section">
          <view class="section-header">
            <view class="section-icon">
              <text class="tn-icon-moon"></text>
            </view>
            <view class="section-info">
              <view class="section-title">心念检视</view>
              <view class="section-desc">今日是否有以下负面念头？（每项 -10分）</view>
            </view>
          </view>
          <view class="section-card">
            <view class="checkbox-grid">
              <view 
                class="checkbox-item" 
                :class="{active: form.mind_check.anxiety}"
                @click="form.mind_check.anxiety = !form.mind_check.anxiety"
              >
                <view class="checkbox-icon">
                  <text v-if="form.mind_check.anxiety" class="tn-icon-success"></text>
                </view>
                <view class="checkbox-label">焦躁</view>
              </view>
              <view 
                class="checkbox-item"
                :class="{active: form.mind_check.greed}"
                @click="form.mind_check.greed = !form.mind_check.greed"
              >
                <view class="checkbox-icon">
                  <text v-if="form.mind_check.greed" class="tn-icon-success"></text>
                </view>
                <view class="checkbox-label">贪欲</view>
              </view>
              <view 
                class="checkbox-item"
                :class="{active: form.mind_check.arrogance}"
                @click="form.mind_check.arrogance = !form.mind_check.arrogance"
              >
                <view class="checkbox-icon">
                  <text v-if="form.mind_check.arrogance" class="tn-icon-success"></text>
                </view>
                <view class="checkbox-label">傲慢</view>
              </view>
              <view 
                class="checkbox-item"
                :class="{active: form.mind_check.anger}"
                @click="form.mind_check.anger = !form.mind_check.anger"
              >
                <view class="checkbox-icon">
                  <text v-if="form.mind_check.anger" class="tn-icon-success"></text>
                </view>
                <view class="checkbox-label">嗔怒</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 2. 身体状况 -->
        <view class="form-section">
          <view class="section-header">
            <view class="section-icon" style="background: linear-gradient(135deg, #C9A86C, #D4B87A);">
              <text class="tn-icon-heart"></text>
            </view>
            <view class="section-info">
              <view class="section-title">身体状况</view>
              <view class="section-desc">记录今日身体调养情况</view>
            </view>
          </view>
          <view class="section-card">
            <view class="form-row">
              <view class="row-label">
                <text>饮水</text>
                <text class="row-hint">8杯达标 (+5分)</text>
              </view>
              <view class="row-control">
                <view class="number-box">
                  <view class="num-btn" @click="changeWater(-1)">-</view>
                  <view class="num-value">{{ form.body_check.water_cups }}</view>
                  <view class="num-btn" @click="changeWater(1)">+</view>
                </view>
                <text class="unit">杯</text>
              </view>
            </view>
            
            <view class="form-divider"></view>

            <view class="form-row">
              <view class="row-label">
                <text>练功</text>
                <text class="row-hint">每30分钟 (+10分)</text>
              </view>
              <view class="row-control">
                <view class="number-box">
                  <view class="num-btn" @click="changeExercise(-10)">-</view>
                  <view class="num-value">{{ form.body_check.exercise_minutes }}</view>
                  <view class="num-btn" @click="changeExercise(10)">+</view>
                </view>
                <text class="unit">分钟</text>
              </view>
            </view>
            
            <view class="form-divider"></view>
            
            <view class="form-row">
              <view class="row-label">
                <text>胃肠状态</text>
              </view>
              <view class="row-control">
                <view class="radio-group">
                  <view 
                    class="radio-item" 
                    :class="{active: form.body_check.stomach_status === '舒适'}"
                    @click="form.body_check.stomach_status = '舒适'"
                  >舒适</view>
                  <view 
                    class="radio-item negative" 
                    :class="{active: form.body_check.stomach_status === '不适'}"
                    @click="form.body_check.stomach_status = '不适'"
                  >不适(-5)</view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 3. 经教修持 -->
        <view class="form-section">
          <view class="section-header">
            <view class="section-icon" style="background: linear-gradient(135deg, #7B68EE, #9B8AFF);">
              <text class="tn-icon-book"></text>
            </view>
            <view class="section-info">
              <view class="section-title">经教修持</view>
              <view class="section-desc">今日读经修行记录</view>
            </view>
          </view>
          <view class="section-card">
            <view class="form-row">
              <view class="row-label">
                <text>诵经</text>
                <text class="row-hint">每遍 (+10分)</text>
              </view>
              <view class="row-control">
                <view class="number-box">
                  <view class="num-btn" @click="changeScripture(-1)">-</view>
                  <view class="num-value">{{ form.practice_check.scripture_count }}</view>
                  <view class="num-btn" @click="changeScripture(1)">+</view>
                </view>
                <text class="unit">遍</text>
              </view>
            </view>
            
            <view class="form-divider"></view>

            <view class="form-row">
              <view class="row-label">
                <text>抄经</text>
                <text class="row-hint">每100字 (+5分)</text>
              </view>
              <view class="row-control">
                <input 
                  v-model="form.practice_check.writing_words" 
                  type="number" 
                  placeholder="字数"
                  class="text-input"
                />
                <text class="unit">字</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 备注 -->
        <view class="form-section">
          <view class="section-header">
            <view class="section-icon" style="background: linear-gradient(135deg, #E07A5F, #F09A7F);">
              <text class="tn-icon-edit"></text>
            </view>
            <view class="section-info">
              <view class="section-title">修行小结</view>
              <view class="section-desc">记录今日感悟（选填）</view>
            </view>
          </view>
          <view class="section-card">
            <textarea 
              v-model="form.notes" 
              placeholder="今日修行有何收获与感悟..."
              class="notes-textarea"
              :maxlength="500"
            ></textarea>
          </view>
        </view>

      </tn-form>

      <view class="submit-section">
        <tn-button 
          backgroundColor="#3D8B8F" 
          fontColor="#FFFFFF" 
          shape="round" 
          width="100%"
          shadow
          fontBold
          @click="submit"
        >
          完成今日功课
        </tn-button>
      </view>
      
      <view style="height: 60rpx;"></view>
    </view>
  </view>
</template>

<script>
  import { getCurrentUid, updateStoreUser } from '@/libs/auth.js'
  
  export default {
    data() {
      return {
        editMode: false, // 是否为编辑模式
        editDate: '', // 编辑的日期
        form: {
          mind_check: {
            anxiety: false,
            greed: false,
            arrogance: false,
            anger: false
          },
          body_check: {
            water_cups: 0,
            stomach_status: '舒适',
            exercise_minutes: 0
          },
          practice_check: {
            scripture_count: 0,
            writing_words: 0
          },
          notes: ''
        }
      }
    },
    onLoad(options) {
      // 如果传入了 date 参数，说明是编辑模式
      if (options.date) {
        this.editMode = true;
        this.editDate = options.date;
        this.loadExistingData(options.date);
      }
    },
    computed: {
      currentScore() {
        let score = 100;
        
        const mind = this.form.mind_check;
        if (mind.anxiety) score -= 10;
        if (mind.greed) score -= 10;
        if (mind.arrogance) score -= 10;
        if (mind.anger) score -= 10;

        const body = this.form.body_check;
        if (body.water_cups >= 8) score += 5;
        if (body.stomach_status === '不适') score -= 5;
        score += Math.floor(body.exercise_minutes / 30) * 10;

        const practice = this.form.practice_check;
        score += practice.scripture_count * 10;
        const writingScore = Math.min(Math.floor(Number(practice.writing_words || 0) / 100) * 5, 20);
        score += writingScore;

        return score;
      }
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      changeWater(delta) {
        const newVal = this.form.body_check.water_cups + delta;
        if (newVal >= 0 && newVal <= 20) {
          this.form.body_check.water_cups = newVal;
        }
      },
      changeExercise(delta) {
        const newVal = this.form.body_check.exercise_minutes + delta;
        if (newVal >= 0 && newVal <= 300) {
          this.form.body_check.exercise_minutes = newVal;
        }
      },
      changeScripture(delta) {
        const newVal = this.form.practice_check.scripture_count + delta;
        if (newVal >= 0) {
          this.form.practice_check.scripture_count = newVal;
        }
      },
      // 加载已有的打卡数据（编辑模式）
      async loadExistingData(date) {
        const uid = uni.getStorageSync('uni_id_user_uid');
        if (!uid) {
          uni.showToast({ title: '请先登录', icon: 'none' });
          return;
        }
                
        try {
          const waterApi = uniCloud.importObject('water-api');
          const res = await waterApi.getDailyTask({
            date,
            uid
          });
          
          if (res.errCode === 0 && res.data) {
            const data = res.data;
            
            // 回显数据到表单
            this.form.mind_check = data.mind_check || {
              anxiety: false,
              greed: false,
              arrogance: false,
              anger: false
            };
            
            this.form.body_check = {
              water_cups: data.body_check?.water_cups || 0,
              stomach_status: data.body_check?.stomach_status || '舒适',
              exercise_minutes: data.body_check?.exercise_minutes || 0
            };
            
            this.form.practice_check = {
              scripture_count: data.practice_check?.scripture_count || 0,
              writing_words: data.practice_check?.writing_words || 0
            };
            
            this.form.notes = data.notes || '';
            
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
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        
        // 使用统一的 getCurrentUid 方法
        const uid = getCurrentUid();
        if (!uid) {
          uni.showToast({ title: '请重新登录', icon: 'none' });
          return;
        }
        
        const bodyCheck = {
          ...this.form.body_check,
          water_cups: Number(this.form.body_check.water_cups),
          exercise_minutes: Number(this.form.body_check.exercise_minutes)
        };
        
        const practiceCheck = {
          ...this.form.practice_check,
          scripture_count: Number(this.form.practice_check.scripture_count),
          writing_words: Number(this.form.practice_check.writing_words)
        };

        const data = {
          date: dateStr,
          user_id: uid,
          mind_check: this.form.mind_check,
          body_check: bodyCheck,
          practice_check: practiceCheck,
          total_score: this.currentScore,
          update_time: Date.now(),
          create_time: Date.now(),
          notes: this.form.notes
        };

        uni.showLoading({ title: '记录中' });
        
        if (!uid) {
          uni.hideLoading();
          uni.showToast({ title: '请重新登录', icon: 'none' });
          return;
        }
        try {
          const waterApi = uniCloud.importObject('water-api', { customUI: true });
          const res = await waterApi.submitDailyTask(data);
          
          if (res.errCode === 0) {
            // 更新全局状态，通知首页刷新
            this.$store.commit('$tStore', {
              name: 'vuex_last_daily_date',
              value: dateStr
            });
            if(this.editMode === false){
              // 更新用户修行数据
              const currentProfile = (this.$store.state.vuex_user && this.$store.state.vuex_user.dao_profile) || {};
              updateStoreUser({
                dao_profile: {
                  continuous_days: (currentProfile.continuous_days || 0) + 1,
                }
              });
            }
            
            uni.hideLoading();
            uni.showToast({ title: '功德圆满', icon: 'success' });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            throw new Error(res.errMsg || '提交失败');
          }
        } catch (e) {
          uni.hideLoading();
          console.error(e);
          uni.showToast({ title: '保存失败: ' + (e.message || e.errMsg), icon: 'none', duration: 3000 });
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

  .check-page {
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
        color: $text;
      }
    }
  }
  
  .nav-title {
    font-size: 34rpx;
    font-weight: bold;
    color: $text;
  }
  
  .page-content {
    padding: 30rpx;
  }

  // 得分展示
  .score-section {
    margin-bottom: 30rpx;
  }
  
  .score-card {
    position: relative;
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    border-radius: 28rpx;
    padding: 50rpx 40rpx;
    overflow: hidden;
    box-shadow: 0 10rpx 40rpx rgba(61, 139, 143, 0.3);
  }
  
  .score-bg {
    position: absolute;
    top: -50rpx;
    right: -50rpx;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
  
  .score-content {
    position: relative;
    z-index: 1;
    text-align: center;
    
    .score-label {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 10rpx;
    }
    
    .score-value {
      font-size: 100rpx;
      font-weight: bold;
      color: #FFFFFF;
      line-height: 1;
      margin-bottom: 10rpx;
    }
    
    .score-hint {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);
    }
  }

  // 表单区域
  .form-section {
    margin-bottom: 30rpx;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
  }
  
  .section-icon {
    width: 70rpx;
    height: 70rpx;
    background: linear-gradient(135deg, $primary, $primary-light);
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    
    text {
      font-size: 36rpx;
      color: #FFFFFF;
    }
  }
  
  .section-info {
    flex: 1;
    
    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: $text;
      margin-bottom: 6rpx;
    }
    
    .section-desc {
      font-size: 24rpx;
      color: $text-hint;
    }
  }
  
  .section-card {
    background: $card-bg;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  }

  // 复选框网格
  .checkbox-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }
  
  .checkbox-item {
    flex: 1;
    min-width: calc(50% - 10rpx);
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: $bg;
    border-radius: 16rpx;
    border: 2rpx solid transparent;
    transition: all 0.2s ease;
    
    &.active {
      background: #FFEBEE;
      border-color: #EF9A9A;
      
      .checkbox-icon {
        background: #EF5350;
        border-color: #EF5350;
        
        text {
          color: #FFFFFF;
        }
      }
      
      .checkbox-label {
        color: #C62828;
      }
    }
  }
  
  .checkbox-icon {
    width: 44rpx;
    height: 44rpx;
    border: 2rpx solid #DDD;
    border-radius: 10rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16rpx;
    
    text {
      font-size: 28rpx;
    }
  }
  
  .checkbox-label {
    font-size: 28rpx;
    color: $text;
  }

  // 表单行
  .form-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10rpx 0;
  }
  
  .row-label {
    display: flex;
    flex-direction: column;
    
    text:first-child {
      font-size: 28rpx;
      color: $text;
      margin-bottom: 6rpx;
    }
    
    .row-hint {
      font-size: 22rpx;
      color: $text-hint;
    }
  }
  
  .row-control {
    display: flex;
    align-items: center;
  }
  
  .number-box {
    display: flex;
    align-items: center;
    background: $bg;
    border-radius: 12rpx;
    overflow: hidden;
    
    .num-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36rpx;
      color: $primary;
      
      &:active {
        background: rgba(61, 139, 143, 0.1);
      }
    }
    
    .num-value {
      width: 80rpx;
      text-align: center;
      font-size: 30rpx;
      font-weight: bold;
      color: $text;
    }
  }
  
  .unit {
    font-size: 24rpx;
    color: $text-hint;
    margin-left: 12rpx;
  }
  
  .form-divider {
    height: 1rpx;
    background: #F0F0F0;
    margin: 20rpx 0;
  }

  // 单选组
  .radio-group {
    display: flex;
    gap: 16rpx;
  }
  
  .radio-item {
    padding: 16rpx 28rpx;
    background: $bg;
    border-radius: 30rpx;
    font-size: 26rpx;
    color: $text-secondary;
    border: 2rpx solid transparent;
    transition: all 0.2s ease;
    
    &.active {
      background: #E8F5E9;
      color: #2E7D32;
      border-color: #A5D6A7;
    }
    
    &.negative.active {
      background: #FFEBEE;
      color: #C62828;
      border-color: #EF9A9A;
    }
  }

  // 文本输入
  .text-input {
    width: 120rpx;
    height: 60rpx;
    background: $bg;
    border-radius: 12rpx;
    text-align: center;
    font-size: 28rpx;
    color: $text;
  }

  // 备注文本框
  .notes-textarea {
    width: 100%;
    min-height: 200rpx;
    font-size: 28rpx;
    color: $text;
    line-height: 1.6;
  }

  // 提交按钮
  .submit-section {
    margin-top: 20rpx;
  }
</style>
