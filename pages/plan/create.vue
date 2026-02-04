<template>
  <view class="dxl-plan-create tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="返回" fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class="tn-custom-nav-bar__back" @click="goBack">
        <text class="tn-icon-left tn-color-black"></text>
        <text class="tn-margin-left-xs tn-color-black">返回</text>
      </view>
      <view class="tn-custom-nav-bar__title tn-color-black">制定计划</view>
    </tn-nav-bar>

    <view class="tn-margin-top-xl tn-padding" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      <view class="tn-bg-white tn-radius tn-shadow-sm tn-padding">
        <tn-form :model="form" ref="planForm" :errorType="['message']">
          <tn-form-item label="计划月份" :required="true" prop="year_month">
            <view @click="showTimePicker = true" class="tn-flex tn-flex-row-between tn-flex-col-center" style="width: 100%;">
              <view>{{ form.year_month || '请选择月份' }}</view>
              <text class="tn-icon-right tn-color-gray"></text>
            </view>
          </tn-form-item>
          <tn-form-item label="计划标题" :required="true" prop="title">
            <tn-input v-model="form.title" placeholder="例如：甲辰年二月修行计划"></tn-input>
          </tn-form-item>
        </tn-form>
      </view>

      <view class="tn-margin-top tn-text-bold tn-text-lg">目标设定</view>
      
      <view v-for="(item, index) in form.goals" :key="index" class="tn-margin-top-sm tn-bg-white tn-radius tn-shadow-sm tn-padding" style="position: relative;">
        <!-- 删除按钮 -->
        <view class="tn-color-red" style="position: absolute; right: 20rpx; top: 20rpx;" @click="removeGoal(index)" v-if="form.goals.length > 1">
          <text class="tn-icon-delete"></text>
        </view>

        <tn-form :model="item">
          <tn-form-item label="分类" :borderBottom="false">
             <tn-radio-group v-model="item.category">
               <tn-radio v-for="(cate, i) in categories" :key="i" :name="cate">{{ cate }}</tn-radio>
             </tn-radio-group>
          </tn-form-item>
          <tn-form-item label="内容" :borderBottom="false">
            <tn-input v-model="item.content" placeholder="目标内容，如：每日诵经一卷"></tn-input>
          </tn-form-item>
          <tn-form-item label="天数" :borderBottom="false">
            <tn-number-box v-model="item.target_days" :min="1" :max="31"></tn-number-box>
            <text class="tn-margin-left-sm">天</text>
          </tn-form-item>
        </tn-form>
      </view>

      <view class="tn-margin-top tn-flex tn-flex-col-center tn-flex-row-center tn-padding-sm tn-bg-white tn-radius border-dashed" @click="addGoal">
        <text class="tn-icon-add tn-color-blue"></text>
        <text class="tn-margin-left-xs tn-color-blue">添加目标</text>
      </view>

      <view class="tn-margin-top-xl tn-padding-bottom-xl">
        <tn-button backgroundColor="#01BEFF" fontColor="#FFFFFF" shape="round" width="100%" @click="submit">保存计划</tn-button>
      </view>
    </view>

    <tn-picker v-model="showTimePicker" mode="time" :params="{year: true, month: true, day: false}" @confirm="onTimeConfirm"></tn-picker>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        showTimePicker: false,
        categories: ["修身", "修心", "处世", "治业"],
        form: {
          year_month: '',
          title: '',
          goals: [
            { category: '修身', content: '', target_days: 1, completed_days: 0 }
          ],
          status: 'planning'
        },
        rules: {
          year_month: [{ required: true, message: '请选择月份' }],
          title: [{ required: true, message: '请输入标题' }]
        }
      }
    },
    onReady() {
      this.$refs.planForm.setRules(this.rules);
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      onTimeConfirm(e) {
        this.form.year_month = `${e.year}-${e.month}`;
      },
      addGoal() {
        this.form.goals.push({
          category: '修身',
          content: '',
          target_days: 1,
          completed_days: 0
        });
      },
      removeGoal(index) {
        this.form.goals.splice(index, 1);
      },
      submit() {
        this.$refs.planForm.validate(async valid => {
          if (valid) {
            // 校验 goals
            for (let g of this.form.goals) {
              if (!g.content) {
                uni.showToast({ title: '请填写目标内容', icon: 'none' });
                return;
              }
            }

            uni.showLoading({ title: '保存中' });
            const db = uniCloud.database();
            try {
              await db.collection('monthly_plans').add(this.form);
              uni.hideLoading();
              uni.showToast({ title: '创建成功' });
              setTimeout(() => {
                uni.navigateBack();
              }, 1500);
            } catch (e) {
              uni.hideLoading();
              uni.showToast({ title: '保存失败: ' + e.message, icon: 'none' });
            }
          }
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dxl-plan-create {
    min-height: 100vh;
    background-color: #F8F8F8;
  }
  .border-dashed {
    border: 1px dashed #AAAAAA;
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