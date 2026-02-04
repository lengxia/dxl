<template>
  <view class="dxl-daily-check tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="返回" fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class="tn-custom-nav-bar__back" @click="goBack">
        <text class="tn-icon-left tn-color-black"></text>
        <text class="tn-margin-left-xs tn-color-black">返回</text>
      </view>
      <view class="tn-custom-nav-bar__title tn-color-black">功课打卡</view>
    </tn-nav-bar>

    <view class="tn-margin-top-xl tn-padding" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      
      <!-- 实时得分展示 -->
      <view class="score-card tn-flex tn-flex-direction-column tn-flex-col-center tn-flex-row-center tn-margin-bottom">
        <view class="tn-text-bold" style="font-size: 80rpx; color: #01BEFF;">{{ currentScore }}</view>
        <view class="tn-text-sm tn-color-gray">当前功德分</view>
      </view>

      <tn-form :model="form" ref="checkForm">
        
        <!-- 1. 心念检视 -->
        <view class="section-card tn-bg-white tn-radius tn-padding tn-margin-bottom">
          <view class="tn-text-lg tn-text-bold tn-margin-bottom">🧘‍♂️ 心念检视</view>
          <view class="tn-color-gray tn-text-sm tn-margin-bottom-sm">今日是否有以下负面念头？（每项 -10分）</view>
          <tn-checkbox-group>
            <tn-checkbox v-model="form.mind_check.anxiety" name="anxiety">焦躁</tn-checkbox>
            <tn-checkbox v-model="form.mind_check.greed" name="greed">贪欲</tn-checkbox>
            <tn-checkbox v-model="form.mind_check.arrogance" name="arrogance">傲慢</tn-checkbox>
            <tn-checkbox v-model="form.mind_check.anger" name="anger">嗔怒</tn-checkbox>
          </tn-checkbox-group>
        </view>

        <!-- 2. 身体状况 -->
        <view class="section-card tn-bg-white tn-radius tn-padding tn-margin-bottom">
          <view class="tn-text-lg tn-text-bold tn-margin-bottom">💪 身体状况</view>
          
          <tn-form-item label="饮水(杯)" :labelWidth="150">
            <tn-number-box v-model="form.body_check.water_cups" :min="0" :max="20"></tn-number-box>
            <view class="tn-margin-left-sm tn-text-xs tn-color-gray">8杯达标 (+5分)</view>
          </tn-form-item>

          <tn-form-item label="练功(分)" :labelWidth="150">
            <tn-number-box v-model="form.body_check.exercise_minutes" :step="10" :min="0" :max="300"></tn-number-box>
            <view class="tn-margin-left-sm tn-text-xs tn-color-gray">每30分 (+10分)</view>
          </tn-form-item>
          
          <tn-form-item label="胃肠状态" :labelWidth="150" :borderBottom="false">
             <tn-radio-group v-model="form.body_check.stomach_status">
               <tn-radio name="舒适">舒适</tn-radio>
               <tn-radio name="不适">不适(-5)</tn-radio>
             </tn-radio-group>
          </tn-form-item>
        </view>

        <!-- 3. 经教修持 -->
        <view class="section-card tn-bg-white tn-radius tn-padding tn-margin-bottom">
          <view class="tn-text-lg tn-text-bold tn-margin-bottom">📚 经教修持</view>
          
          <tn-form-item label="诵经(遍)" :labelWidth="150">
            <tn-number-box v-model="form.practice_check.scripture_count" :min="0"></tn-number-box>
            <view class="tn-margin-left-sm tn-text-xs tn-color-gray">每遍 (+10分)</view>
          </tn-form-item>

          <tn-form-item label="抄经(字)" :labelWidth="150" :borderBottom="false">
            <tn-input v-model="form.practice_check.writing_words" type="number" placeholder="今日字数"></tn-input>
          </tn-form-item>
        </view>
        
        <!-- 备注 -->
        <view class="section-card tn-bg-white tn-radius tn-padding tn-margin-bottom">
          <tn-form-item label="备注" :borderBottom="false">
             <tn-input v-model="form.notes" type="textarea" placeholder="今日修行小结..."></tn-input>
          </tn-form-item>
        </view>

      </tn-form>

      <view class="tn-padding-bottom-xl">
        <tn-button backgroundColor="#01BEFF" fontColor="#FFFFFF" shape="round" width="100%" @click="submit">完成今日功课</tn-button>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
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
    computed: {
      currentScore() {
        let score = 100; // 基础分
        
        // 心念扣分
        const mind = this.form.mind_check;
        if (mind.anxiety) score -= 10;
        if (mind.greed) score -= 10;
        if (mind.arrogance) score -= 10;
        if (mind.anger) score -= 10;

        // 身体加减分
        const body = this.form.body_check;
        if (body.water_cups >= 8) score += 5;
        if (body.stomach_status === '不适') score -= 5;
        score += Math.floor(body.exercise_minutes / 30) * 10;

        // 修持加分
        const practice = this.form.practice_check;
        score += practice.scripture_count * 10;
        // 假设每100字加5分，上限20分
        const writingScore = Math.min(Math.floor(Number(practice.writing_words || 0) / 100) * 5, 20);
        score += writingScore;

        return score;
      }
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      async submit() {
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        
        // 确保数字类型正确，防止数据库校验失败
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
          mind_check: this.form.mind_check,
          body_check: bodyCheck,
          practice_check: practiceCheck,
          total_score: this.currentScore,
          notes: this.form.notes
        };

        uni.showLoading({ title: '记录中' });
        const db = uniCloud.database();
        try {
          // 检查今日是否已打卡（如果有则更新，没有则新增）
          const checkRes = await db.collection('daily_tasks').where(`date == "${dateStr}" && user_id == $cloudEnv_uid`).get();
          
          if (checkRes.result.data.length > 0) {
            const id = checkRes.result.data[0]._id;
            await db.collection('daily_tasks').doc(id).update({
              ...data,
              update_time: db.command.set(Date.now())
            });
          } else {
            // 显式添加 create_time (虽有默认值但显式更稳)
            await db.collection('daily_tasks').add(data);
          }
          
          uni.hideLoading();
          uni.showToast({ title: '功德圆满' });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (e) {
          uni.hideLoading();
          console.error(e);
          // 显示具体错误信息，方便排查
          uni.showToast({ title: '保存失败: ' + (e.message || e.errMsg), icon: 'none', duration: 3000 });
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dxl-daily-check {
    min-height: 100vh;
    background-color: #F8F8F8;
  }
  .score-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.05);
  }
  .section-card {
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.02);
  }
  .tn-custom-nav-bar__back {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>