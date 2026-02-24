<template>
  <view class="settings-page tn-safe-area-inset-bottom">
    <!-- 顶部自定义导航 -->
    <tn-nav-bar fixed customBack backgroundColor="#FFFEFB" :bottomShadow="false">
      <view slot="back" class="nav-back" @click="goBack">
        <view class="back-btn">
          <text class="tn-icon-left"></text>
        </view>
      </view>
      <view class="nav-title">系统设置</view>
    </tn-nav-bar>

    <view class="page-content" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      
      <!-- 用户头像设置 -->
      <view class="settings-card">
        <view class="card-title">个人资料</view>
        
        <view class="setting-item" @click="handleAvatarClick">
          <view class="item-left">
            <view class="item-icon" style="background: linear-gradient(135deg, #3D8B8F, #5AABAD);">
              <text class="tn-icon-my-fill"></text>
            </view>
            <view class="item-info">
              <view class="item-label">用户头像</view>
              <view class="item-desc">有趣的头像，百里挑一</view>
            </view>
          </view>
          <view class="item-right">
            <view class="avatar-preview">
              <image 
                :src="vuexUser.avatar || '/static/logo.png'" 
                class="avatar-img"
                mode="aspectFill"
              />
            </view>
            <text class="tn-icon-right"></text>
          </view>
        </view>
        
        <view class="item-divider"></view>
        
        <view class="setting-item" @click="showModal('nickname')">
          <view class="item-left">
            <view class="item-icon" style="background: linear-gradient(135deg, #C9A86C, #D4B87A);">
              <text class="tn-icon-edit"></text>
            </view>
            <view class="item-info">
              <view class="item-label">用户昵称</view>
              <view class="item-desc">{{ vuexUser.nickname || '点击设置昵称' }}</view>
            </view>
          </view>
          <view class="item-right">
            <text class="tn-icon-right"></text>
          </view>
        </view>
        
        <view class="item-divider"></view>
        
        <view class="setting-item" @click="showModal('phone')">
          <view class="item-left">
            <view class="item-icon" style="background: linear-gradient(135deg, #7B68EE, #9B8AFF);">
              <text class="tn-icon-call-fill"></text>
            </view>
            <view class="item-info">
              <view class="item-label">绑定手机号</view>
              <view class="item-desc">{{ vuexUser.mobile || '未绑定' }}</view>
            </view>
          </view>
          <view class="item-right">
            <text class="tn-icon-right"></text>
          </view>
        </view>
      </view>
      
      <!-- 个人信息 -->
      <view class="settings-card">
        <view class="card-title">基本信息</view>
        
        <view class="setting-item" @click="showModal('realname')">
          <view class="item-left">
            <view class="item-icon" style="background: linear-gradient(135deg, #E07A5F, #F09A7F);">
              <text class="tn-icon-medal-fill"></text>
            </view>
            <view class="item-info">
              <view class="item-label">姓名</view>
              <view class="item-desc">{{ vuexUser.realname || '未填写' }}</view>
            </view>
          </view>
          <view class="item-right">
            <text class="tn-icon-right"></text>
          </view>
        </view>
        
        <view class="item-divider"></view>
        
        <picker @change="bindPickerChange" :value="genderIndex" :range="genderArray">
          <view class="setting-item">
            <view class="item-left">
              <view class="item-icon" style="background: linear-gradient(135deg, #26A69A, #4DB6AC);">
                <text class="tn-icon-my-fill"></text>
              </view>
              <view class="item-info">
                <view class="item-label">性别</view>
                <view class="item-desc">{{ genderArray[genderIndex] }}</view>
              </view>
            </view>
            <view class="item-right">
              <text class="tn-icon-right"></text>
            </view>
          </view>
        </picker>
        
        <view class="item-divider"></view>
        
        <picker @change="bindDateChange" mode="date" :value="birthday" :start="startDate" :end="endDate">
          <view class="setting-item">
            <view class="item-left">
              <view class="item-icon" style="background: linear-gradient(135deg, #FF7043, #FF8A65);">
                <text class="tn-icon-calendar-fill"></text>
              </view>
              <view class="item-info">
                <view class="item-label">生日</view>
                <view class="item-desc">{{ birthday }}</view>
              </view>
            </view>
            <view class="item-right">
              <text class="tn-icon-right"></text>
            </view>
          </view>
        </picker>
        
        <view class="item-divider"></view>
        
        <picker @change="bindJobChange" :value="jobIndex" :range="jobArray">
          <view class="setting-item">
            <view class="item-left">
              <view class="item-icon" style="background: linear-gradient(135deg, #5C6BC0, #7986CB);">
                <text class="tn-icon-service-fill"></text>
              </view>
              <view class="item-info">
                <view class="item-label">职业</view>
                <view class="item-desc">{{ jobArray[jobIndex] }}</view>
              </view>
            </view>
            <view class="item-right">
              <text class="tn-icon-right"></text>
            </view>
          </view>
        </picker>
      </view>
      
      <!-- 通用修改弹窗 -->
      <tn-modal v-model="showModalVisible" :custom="true" :showCloseBtn="true">
        <view class="modal-content">
          <view class="modal-title">{{ modalTitle }}</view>
          
          <!-- 手机号特殊展示 -->
          <block v-if="currentModalType === 'phone'">
             <view class="modal-desc">{{ vuexUser.mobile || '暂未绑定手机号' }}</view>
             <view class="modal-btn">
                <tn-button backgroundColor="#3D8B8F" fontColor="#FFFFFF" shape="round" width="60%" shadow>
                  获取手机号
                </tn-button>
             </view>
             <view class="modal-hint">注：获取手机号API收费，此功能需自行配置</view>
          </block>

          <!-- 文本输入 -->
          <block v-else>
             <view class="modal-input-wrap">
               <input 
                 v-model="tempValue"
                 :placeholder="modalPlaceholder" 
                 placeholder-style="color:#B2BEC3"
                 maxlength="20"
               />
             </view>
             <view class="modal-btn">
               <tn-button 
                 backgroundColor="#3D8B8F" 
                 fontColor="#FFFFFF"
                 shape="round"
                 width="60%"
                 shadow
                 @click="saveValue"
               >
                 保存
               </tn-button>
             </view>
          </block>
        </view>
      </tn-modal>
      
    </view>
  </view>
</template>

<script>
  import pageMixin from '@/libs/page-mixin'

  export default {
    name: 'Settings',
    mixins: [pageMixin],
    data(){
      return {
        // 弹窗控制
        showModalVisible: false,
        currentModalType: '', // nickname, realname, phone
        tempValue: '',
        
        // Picker 数据源
        genderArray: ['女', '男', '保密'],
        jobArray: ['计算机/互联网', '教育/培训', '医疗/健康', '金融/财务', '自由职业', '其他'],
        
        // Picker 选中状态（需要从 Vuex 同步）
        genderIndex: 2,
        jobIndex: 0,
        birthday: '2000-01-01',
      }
    },
    computed: {
      startDate() { return this.getDate('start'); },
      endDate() { return this.getDate('end'); },
      vuexUser() { return this.$store.state.vuex_user || {}; },
      
      // 动态计算弹窗标题
      modalTitle() {
        const map = { nickname: '修改昵称', realname: '填写姓名', phone: '绑定手机号' };
        return map[this.currentModalType] || '';
      },
      modalPlaceholder() {
        const map = { nickname: '请输入昵称', realname: '请输入真实姓名' };
        return map[this.currentModalType] || '';
      }
    },
    watch: {
      // 仅同步 Picker 相关的索引状态
      vuexUser: {
        handler(u) {
          if (u) {
            if (u.gender !== undefined) this.genderIndex = u.gender;
            if (u.birthday) this.birthday = u.birthday;
            if (u.job !== undefined) this.jobIndex = u.job;
          }
        },
        immediate: true,
        deep: true
      }
    },
    methods: {
      goBack() {
        // 统一返回逻辑
        const pages = getCurrentPages();
        if (pages && pages.length > 0) {
          const firstPage = pages[0];
          if (pages.length == 1 && (!firstPage.route || firstPage.route != 'pages/index')) {
            uni.reLaunch({ url: '/pages/index' });
          } else {
            uni.navigateBack({ delta: 1 });
          }
        } else {
          uni.reLaunch({ url: '/pages/index' });
        }
      },
      tn(url) {
        uni.navigateTo({ url });
      },

      // 处理头像点击
      handleAvatarClick() {
        // 已登录用户可以更换头像
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            this.uploadAvatar(res.tempFilePaths[0]);
          }
        });
      },

      // 上传头像 - 使用 API Service 统一处理
      async uploadAvatar(filePath) {
        uni.showLoading({ title: '上传中...' });
        
        try {
          // 上传文件到云存储
          const result = await uniCloud.uploadFile({
            filePath: filePath,
            cloudPath: `avatar/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`
          });
          
          // 通过 API Service 更新头像（会自动同步到 Vuex）
          const res = await this.$api.call('updateUserInfo', 
            { uid: this.userInfo._id, data: { avatar: result.fileID } },
            { showLoading: false, autoSyncUser: true }
          );
          
          uni.hideLoading();
          
          if (res.success) {
            uni.showToast({ title: '头像更新成功', icon: 'success' });
          }
        } catch(e) {
          uni.hideLoading();
          uni.showToast({ title: e.message || '上传失败', icon: 'none' });
        }
      },
      
      // 统一弹窗处理
      showModal(type) {
        this.currentModalType = type;
        if (type === 'nickname') this.tempValue = this.vuexUser.nickname || '';
        if (type === 'realname') this.tempValue = this.vuexUser.realname || '';
        this.showModalVisible = true;
      },
      
      async saveValue() {
        if (!this.tempValue.trim()) {
           this.showModalVisible = false;
           return;
        }
        
        const value = this.tempValue.trim();
        const data = {};
        
        if (this.currentModalType === 'nickname') data.nickname = value;
        if (this.currentModalType === 'realname') data.realname = value;
        
        this.showModalVisible = false;
        await this.saveUserInfo(data);
      },

      async saveUserInfo(data) {
        // 使用 API Service 更新用户信息（会自动同步到 Vuex）
        const res = await this.$api.call('updateUserInfo', 
          { uid: this.userInfo._id, data },
          {
            showLoading: true,
            loadingText: '保存中...',
            autoSyncUser: true
          }
        );
        
        if (res.success) {
          uni.showToast({ title: '保存成功', icon: 'success' });
        }
        // 错误已由 API Service 统一处理
      },
      
      bindPickerChange(e) {
        this.genderIndex = Number(e.detail.value);
        this.saveUserInfo({ gender: this.genderIndex });
      },
      bindJobChange(e) {
        this.jobIndex = Number(e.detail.value);
        this.saveUserInfo({ job: this.jobIndex });
      },
      bindDateChange(e) {
        this.birthday = e.detail.value;
        this.saveUserInfo({ birthday: this.birthday });
      },
      
      getDate(type) {
        const date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
    
        if (type === 'start') {
          year = year - 80;
        } else if (type === 'end') {
          year = year;
        }
        month = month > 9 ? month : '0' + month;
        day = day > 9 ? day : '0' + day;
        return `${year}-${month}-${day}`;
      }
    }
  }
</script>

<style lang="scss" scoped>
  $primary: #3D8B8F;
  $bg: #F7F5F0;
  $card-bg: #FFFEFB;
  $text: #2D3436;
  $text-secondary: #636E72;
  $text-hint: #B2BEC3;

  .settings-page {
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
    padding-top: 20rpx;
  }

  .settings-card {
    background: $card-bg;
    border-radius: 24rpx;
    padding: 0 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  }
  
  .card-title {
    font-size: 26rpx;
    color: $text-hint;
    padding: 24rpx 0 16rpx;
    border-bottom: 1rpx solid #F5F5F5;
  }
  
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28rpx 0;
  }
  
  .item-left {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .item-icon {
    width: 70rpx;
    height: 70rpx;
    border-radius: 18rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    text {
      font-size: 34rpx;
      color: #FFFFFF;
    }
  }
  
  .item-info {
    flex: 1;
    .item-label {
      font-size: 30rpx;
      font-weight: 500;
      color: $text;
      margin-bottom: 6rpx;
    }
    .item-desc {
      font-size: 24rpx;
      color: $text-hint;
    }
  }
  
  .item-right {
    display: flex;
    align-items: center;
    text {
      font-size: 28rpx;
      color: $text-hint;
    }
  }
  
  .avatar-preview {
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 16rpx;
    .avatar-img {
      width: 100%;
      height: 100%;
    }
  }
  
  .item-divider {
    height: 1rpx;
    background: #F5F5F5;
    margin-left: 94rpx;
  }

  .modal-content {
    padding: 40rpx;
    text-align: center;
  }
  
  .modal-title {
    font-size: 34rpx;
    font-weight: bold;
    color: $text;
    margin-bottom: 30rpx;
  }
  
  .modal-desc {
    font-size: 28rpx;
    color: $text-secondary;
    margin-bottom: 40rpx;
  }
  
  .modal-input-wrap {
    background: $bg;
    border-radius: 16rpx;
    padding: 24rpx 30rpx;
    margin-bottom: 40rpx;
    input {
      font-size: 30rpx;
      color: $text;
    }
  }
  
  .modal-btn {
    margin-bottom: 20rpx;
  }
  
  .modal-hint {
    font-size: 22rpx;
    color: $text-hint;
  }
</style>