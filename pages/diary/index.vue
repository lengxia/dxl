<template>
  <view class="dxl-diary-index tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="返回" fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class="tn-custom-nav-bar__back" @click="goBack">
        <text class="tn-icon-left tn-color-black"></text>
        <text class="tn-margin-left-xs tn-color-black">返回</text>
      </view>
      <view class="tn-custom-nav-bar__title tn-color-black">善行日记</view>
    </tn-nav-bar>

    <view class="tn-margin-top-xl" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      <!-- 统计概览 -->
      <view class="tn-flex tn-flex-row-between tn-padding tn-bg-white tn-margin-bottom-sm">
        <view>
          <view class="tn-text-bold tn-text-lg">本月善行</view>
          <view class="tn-text-sm tn-color-gray tn-margin-top-xs">{{ currentMonth }}月累计</view>
        </view>
        <view class="tn-text-right">
          <view class="tn-text-xl tn-text-bold tn-color-orange">{{ totalMerit }} <text class="tn-text-sm tn-color-gray">分</text></view>
          <view class="tn-text-sm tn-color-gray tn-margin-top-xs">{{ totalCount }} 件善事</view>
        </view>
      </view>

      <!-- 列表 -->
      <view class="tn-padding-sm">
        <view v-if="diaries.length > 0">
           <view v-for="(item, index) in diaries" :key="index" class="tn-bg-white tn-radius tn-shadow-sm tn-margin-bottom-sm tn-padding" @click="goDetail(item._id)">
             <view class="tn-flex tn-flex-row-between tn-flex-col-center">
               <view class="tn-flex tn-flex-col-center">
                 <tn-tag :backgroundColor="typeColor(item.deed_type)" fontColor="#FFF" size="sm" shape="radius" class="tn-margin-right-sm">{{ item.deed_type }}</tn-tag>
                 <text class="tn-text-bold">{{ item.title }}</text>
               </view>
               <view class="tn-text-xs tn-color-gray">{{ item.date }}</view>
             </view>
             
             <view class="tn-margin-top-sm tn-text-ellipsis-2 tn-color-black">
               {{ item.content }}
             </view>
             
             <view class="tn-margin-top-sm tn-flex tn-flex-row-between tn-text-xs tn-color-gray">
               <view>发心：{{ item.intention || '无' }}</view>
               <view class="tn-color-orange">+{{ item.merit_points }} 功德</view>
             </view>
           </view>
        </view>
        <tn-empty v-else mode="data" text="勿以善小而不为"></tn-empty>
      </view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="tn-fab-class">
      <tn-button backgroundColor="#FF7043" fontColor="#FFFFFF" shape="circle" shadow width="100rpx" height="100rpx" @click="goCreate">
        <text class="tn-icon-star tn-text-xxl"></text>
      </tn-button>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        currentMonth: new Date().getMonth() + 1,
        diaries: [],
        totalMerit: 0,
        totalCount: 0
      }
    },
    onShow() {
      this.loadData();
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      goCreate() {
        uni.navigateTo({
          url: '/pages/diary/create'
        });
      },
      goDetail(id) {
        uni.navigateTo({
          url: '/pages/diary/detail?id=' + id
        });
      },
      async loadData() {
        const db = uniCloud.database();
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        
        try {
          // 获取所有记录（按日期倒序）
          const res = await db.collection('good_deeds')
            .where('user_id == $cloudEnv_uid')
            .orderBy('date', 'desc')
            .get();
          
          this.diaries = res.result.data;
          
          // 简单统计本月（实际建议后端聚合，或者这里前端过滤）
          // 由于日期格式是 YYYY-MM-DD
          const monthPrefix = `${new Date().getFullYear()}-${String(this.currentMonth).padStart(2,'0')}`;
          
          let m = 0;
          let c = 0;
          this.diaries.forEach(d => {
            if (d.date.startsWith(monthPrefix)) {
              m += d.merit_points;
              c += 1;
            }
          });
          this.totalMerit = m;
          this.totalCount = c;
          
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
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dxl-diary-index {
    min-height: 100vh;
    background-color: #F8F8F8;
  }
  .tn-fab-class {
    position: fixed;
    bottom: 50rpx;
    right: 30rpx;
    z-index: 99;
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