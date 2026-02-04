<template>
  <view class="dxl-diary-create tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="返回" fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class="tn-custom-nav-bar__back" @click="goBack">
        <text class="tn-icon-left tn-color-black"></text>
        <text class="tn-margin-left-xs tn-color-black">返回</text>
      </view>
      <view class="tn-custom-nav-bar__title tn-color-black">记录善行</view>
    </tn-nav-bar>

    <view class="tn-margin-top-xl tn-padding" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      <view class="tn-bg-white tn-radius tn-shadow-sm tn-padding">
        <tn-form :model="form" ref="diaryForm" :errorType="['message']">
          
          <tn-form-item label="日期" prop="date">
            <view @click="showCalendar = true" class="tn-flex tn-flex-row-between" style="width: 100%;">
              <view>{{ form.date }}</view>
              <text class="tn-icon-calendar tn-color-gray"></text>
            </view>
          </tn-form-item>

          <tn-form-item label="类型" prop="deed_type">
             <tn-radio-group v-model="form.deed_type">
               <tn-radio v-for="(item, index) in types" :key="index" :name="item">{{ item }}</tn-radio>
             </tn-radio-group>
          </tn-form-item>
          
          <tn-form-item label="事由" :required="true" prop="title">
            <tn-input v-model="form.title" placeholder="简述善行..."></tn-input>
          </tn-form-item>

          <tn-form-item label="详情" prop="content" labelPosition="top">
            <tn-input v-model="form.content" type="textarea" placeholder="详细描述过程..."></tn-input>
          </tn-form-item>

          <tn-form-item label="发心" prop="intention">
             <tn-input v-model="form.intention" placeholder="当时的起心动念"></tn-input>
          </tn-form-item>

          <tn-form-item label="回甘" prop="feeling">
             <tn-input v-model="form.feeling" placeholder="事后的感受"></tn-input>
          </tn-form-item>
          
          <tn-form-item label="功德值" prop="merit_points" labelPosition="top">
             <view class="tn-flex tn-flex-row-between tn-flex-col-center" style="width: 100%;">
               <tn-slider v-model="form.merit_points" :min="1" :max="10" activeColor="#FF7043"></tn-slider>
               <text class="tn-margin-left tn-text-bold tn-color-orange">{{ form.merit_points }} 分</text>
             </view>
             <view class="tn-text-xs tn-color-gray tn-margin-top-xs">请根据善行的大小和发心的纯粹程度诚实评分（1-10）</view>
          </tn-form-item>

          <tn-form-item label="公开" :borderBottom="false">
             <tn-switch v-model="form.is_public"></tn-switch>
             <text class="tn-margin-left-sm tn-text-xs tn-color-gray">公开后可激励他人</text>
          </tn-form-item>
        </tn-form>
      </view>

      <view class="tn-margin-top-xl tn-padding-bottom-xl">
        <tn-button backgroundColor="#FF7043" fontColor="#FFFFFF" shape="round" width="100%" @click="submit">铭记善行</tn-button>
      </view>
    </view>
    
    <tn-calendar v-model="showCalendar" mode="date" :changeYear="true" :changeMonth="true" @change="onDateChange"></tn-calendar>
  </view>
</template>

<script>
  export default {
    data() {
      return {
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
    onLoad() {
      const now = new Date();
      this.form.date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
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
      async submit() {
        this.$refs.diaryForm.validate(async valid => {
          if (valid) {
            uni.showLoading({ title: '记录中' });
            const db = uniCloud.database();
            try {
              await db.collection('good_deeds').add(this.form);
              
              // 这里可以触发一个云函数，自动累加用户的总功德值
              // 暂时先只存记录
              
              uni.hideLoading();
              uni.showToast({ title: '记录成功' });
              setTimeout(() => {
                uni.navigateBack();
              }, 1500);
            } catch (e) {
              uni.hideLoading();
              uni.showToast({ title: '保存失败', icon: 'none' });
            }
          }
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dxl-diary-create {
    min-height: 100vh;
    background-color: #F8F8F8;
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