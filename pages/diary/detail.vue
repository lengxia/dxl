<template>
  <view class="dxl-diary-detail tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="返回" fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class="tn-custom-nav-bar__back" @click="goBack">
        <text class="tn-icon-left tn-color-black"></text>
        <text class="tn-margin-left-xs tn-color-black">返回</text>
      </view>
      <view class="tn-custom-nav-bar__title tn-color-black">日记详情</view>
    </tn-nav-bar>

    <view class="tn-margin-top-xl" :style="{paddingTop: vuex_custom_bar_height + 'px'}" v-if="diary">
      <view class="tn-bg-white tn-padding">
        <view class="tn-flex tn-flex-row-between tn-flex-col-center">
          <view class="tn-text-xl tn-text-bold">{{ diary.title }}</view>
          <view class="tn-text-bold tn-color-orange">+{{ diary.merit_points }} 功德</view>
        </view>
        
        <view class="tn-flex tn-margin-top-sm tn-color-gray tn-text-sm">
           <tn-tag :backgroundColor="typeColor(diary.deed_type)" fontColor="#FFFFFF" size="sm" shape="radius" class="tn-margin-right-sm">{{ diary.deed_type }}</tn-tag>
           <text>{{ diary.date }}</text>
        </view>
        
        <view class="tn-margin-top tn-text-lg">
          <text>{{ diary.content || '无详细描述' }}</text>
        </view>

        <view class="tn-margin-top-xl tn-bg-gray--light tn-radius tn-padding-sm">
           <view class="tn-margin-bottom-sm"><text class="tn-text-bold">发心：</text>{{ diary.intention || '未记录' }}</view>
           <view><text class="tn-text-bold">回甘：</text>{{ diary.feeling || '未记录' }}</view>
        </view>
      </view>

      <view class="tn-padding tn-margin-top-xl">
        <tn-button backgroundColor="#FF4444" fontColor="#FFFFFF" width="100%" @click="deleteDiary">删除记录</tn-button>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        id: '',
        diary: null
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
          const res = await db.collection('good_deeds').doc(this.id).get();
          if (res.result.data && res.result.data.length > 0) {
            this.diary = res.result.data[0];
          }
        } catch (e) {
          console.error(e);
        }
      },
      typeColor(type) {
        const map = {
          '助人': '#FF7043',
          '爱物': '#66BB6A',
          '环保': '#26A69A',
          '孝亲': '#AB47BC',
          '其他': '#78909C'
        };
        return map[type] || '#78909C';
      },
      deleteDiary() {
        uni.showModal({
          title: '提示',
          content: '确定要删除这条善行记录吗？',
          success: async (res) => {
            if (res.confirm) {
              const db = uniCloud.database();
              await db.collection('good_deeds').doc(this.id).remove();
              uni.navigateBack();
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dxl-diary-detail {
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