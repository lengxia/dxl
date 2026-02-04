<template>
  <view class="dxl-note-detail tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="返回" fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class="tn-custom-nav-bar__back" @click="goBack">
        <text class="tn-icon-left tn-color-black"></text>
        <text class="tn-margin-left-xs tn-color-black">返回</text>
      </view>
      <view class="tn-custom-nav-bar__title tn-color-black">札记详情</view>
    </tn-nav-bar>

    <view class="tn-margin-top-xl" :style="{paddingTop: vuex_custom_bar_height + 'px'}" v-if="note">
      <view class="tn-bg-white tn-padding">
        <view class="tn-text-xl tn-text-bold">{{ note.title }}</view>
        <view class="tn-flex tn-flex-row-between tn-margin-top-sm tn-color-gray tn-text-sm">
          <view>{{ formatDate(note.create_time) }}</view>
          <view><text class="tn-icon-mood tn-margin-right-xs"></text>{{ note.mood }}</view>
        </view>
        
        <view class="tn-margin-top tn-text-lg" style="line-height: 1.8;">
          <text>{{ note.content }}</text>
        </view>

        <!-- 图片展示 -->
        <view v-if="note.images && note.images.length > 0" class="tn-margin-top">
           <image 
             v-for="(img, idx) in note.images" 
             :key="idx" 
             :src="img" 
             mode="widthFix" 
             class="tn-margin-bottom-sm"
             style="width: 100%; border-radius: 10rpx;"
             @click="previewImage(idx)"
           ></image>
        </view>
        
        <!-- 标签 -->
        <view class="tn-margin-top-lg" v-if="note.tags && note.tags.length > 0">
          <tn-tag v-for="(tag, i) in note.tags" :key="i" backgroundColor="#F0F0F0" fontColor="#666" shape="circle" class="tn-margin-right-sm"># {{ tag }}</tn-tag>
        </view>
      </view>

      <view class="tn-padding tn-margin-top-xl">
        <tn-button backgroundColor="#FF4444" fontColor="#FFFFFF" width="100%" @click="deleteNote">删除札记</tn-button>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        id: '',
        note: null
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
          const res = await db.collection('dao_notes').doc(this.id).get();
          if (res.result.data && res.result.data.length > 0) {
            this.note = res.result.data[0];
          }
        } catch (e) {
          console.error(e);
        }
      },
      formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
      },
      previewImage(current) {
        uni.previewImage({
          current: current,
          urls: this.note.images
        });
      },
      deleteNote() {
        uni.showModal({
          title: '提示',
          content: '确定要删除这条札记吗？',
          success: async (res) => {
            if (res.confirm) {
              const db = uniCloud.database();
              await db.collection('dao_notes').doc(this.id).remove();
              uni.navigateBack();
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dxl-note-detail {
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