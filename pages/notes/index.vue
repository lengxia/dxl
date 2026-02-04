<template>
  <view class="dxl-notes-index tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="返回" fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class="tn-custom-nav-bar__back" @click="goBack">
        <text class="tn-icon-left tn-color-black"></text>
        <text class="tn-margin-left-xs tn-color-black">返回</text>
      </view>
      <view class="tn-custom-nav-bar__title tn-color-black">悟道札记</view>
    </tn-nav-bar>

    <view class="tn-margin-top-xl tn-padding" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      <view v-if="notes.length > 0">
        <tn-time-line>
          <tn-time-line-item v-for="(item, index) in notes" :key="index">
            <template slot="title">
              <view class="tn-text-bold tn-text-lg">{{ item.title }}</view>
            </template>
            <template slot="content">
              <view class="tn-margin-top-xs" @click="goDetail(item._id)">
                <view class="tn-color-gray tn-text-sm tn-margin-bottom-sm">
                  {{ formatDate(item.create_time) }} · <text class="tn-icon-mood tn-margin-right-xs"></text>{{ item.mood || '平静' }}
                </view>
                
                <view class="tn-text-ellipsis-2 tn-color-black tn-text-df">
                  {{ item.content }}
                </view>
                
                <!-- 图片预览（仅显示第一张） -->
                <view v-if="item.images && item.images.length > 0" class="tn-margin-top-sm">
                  <image :src="item.images[0]" mode="aspectFill" style="width: 200rpx; height: 150rpx; border-radius: 10rpx;"></image>
                  <view v-if="item.images.length > 1" class="tn-text-xs tn-color-gray tn-margin-top-xs">
                    共 {{ item.images.length }} 张图片
                  </view>
                </view>

                <!-- 标签 -->
                <view class="tn-margin-top-sm" v-if="item.tags && item.tags.length > 0">
                  <tn-tag v-for="(tag, tagIndex) in item.tags" :key="tagIndex" backgroundColor="#F0F0F0" fontColor="#999" size="sm" shape="circle" class="tn-margin-right-xs"># {{ tag }}</tn-tag>
                </view>
              </view>
            </template>
            <template slot="icon">
              <view class="tn-icon-edit tn-color-white" style="background-color: #01BEFF; border-radius: 50%; padding: 10rpx; font-size: 24rpx;"></view>
            </template>
          </tn-time-line-item>
        </tn-time-line>
      </view>
      <tn-empty v-else mode="data" text="暂无札记，记一笔吧"></tn-empty>
    </view>

    <!-- 悬浮按钮 -->
    <view class="tn-fab-class">
      <tn-button backgroundColor="#01BEFF" fontColor="#FFFFFF" shape="circle" shadow width="100rpx" height="100rpx" @click="goCreate">
        <text class="tn-icon-edit-form tn-text-xxl"></text>
      </tn-button>
    </view>
  </view>
</template>

<script>
  import timeFrom from '@/tools/timeFrom.js' // 假设有这个工具，如果没有稍后补一个简单的格式化
  
  export default {
    data() {
      return {
        notes: []
      }
    },
    onShow() {
      this.loadNotes();
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      goCreate() {
        uni.navigateTo({
          url: '/pages/notes/create'
        });
      },
      goDetail(id) {
        uni.navigateTo({
          url: '/pages/notes/detail?id=' + id
        });
      },
      async loadNotes() {
        const db = uniCloud.database();
        try {
          const res = await db.collection('dao_notes')
            .where('user_id == $cloudEnv_uid')
            .orderBy('create_time', 'desc')
            .get();
          this.notes = res.result.data;
        } catch (e) {
          console.error(e);
        }
      },
      formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dxl-notes-index {
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