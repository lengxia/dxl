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
        
        <view class="setting-item" @click="tn('/pages/mine/avatar')">
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
                :src="userAvatar || '/static/logo.png'" 
                class="avatar-img"
                mode="aspectFill"
              />
            </view>
            <text class="tn-icon-right"></text>
          </view>
        </view>
        
        <view class="item-divider"></view>
        
        <view class="setting-item" @click="showModal1">
          <view class="item-left">
            <view class="item-icon" style="background: linear-gradient(135deg, #C9A86C, #D4B87A);">
              <text class="tn-icon-edit"></text>
            </view>
            <view class="item-info">
              <view class="item-label">用户昵称</view>
              <view class="item-desc">{{ nickname || '点击设置昵称' }}</view>
            </view>
          </view>
          <view class="item-right">
            <text class="tn-icon-right"></text>
          </view>
        </view>
        
        <view class="item-divider"></view>
        
        <view class="setting-item" @click="showModal2">
          <view class="item-left">
            <view class="item-icon" style="background: linear-gradient(135deg, #7B68EE, #9B8AFF);">
              <text class="tn-icon-call-fill"></text>
            </view>
            <view class="item-info">
              <view class="item-label">绑定手机号</view>
              <view class="item-desc">{{ phone || '未绑定' }}</view>
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
        
        <view class="setting-item" @click="showModal3">
          <view class="item-left">
            <view class="item-icon" style="background: linear-gradient(135deg, #E07A5F, #F09A7F);">
              <text class="tn-icon-medal-fill"></text>
            </view>
            <view class="item-info">
              <view class="item-label">姓名</view>
              <view class="item-desc">{{ realname || '未填写' }}</view>
            </view>
          </view>
          <view class="item-right">
            <text class="tn-icon-right"></text>
          </view>
        </view>
        
        <view class="item-divider"></view>
        
        <picker @change="bindPickerChange" :value="index" :range="genderArray">
          <view class="setting-item">
            <view class="item-left">
              <view class="item-icon" style="background: linear-gradient(135deg, #26A69A, #4DB6AC);">
                <text class="tn-icon-my-fill"></text>
              </view>
              <view class="item-info">
                <view class="item-label">性别</view>
                <view class="item-desc">{{ genderArray[index] }}</view>
              </view>
            </view>
            <view class="item-right">
              <text class="tn-icon-right"></text>
            </view>
          </view>
        </picker>
        
        <view class="item-divider"></view>
        
        <picker @change="bindDateChange" mode="date" :value="date" :start="startDate" :end="endDate">
          <view class="setting-item">
            <view class="item-left">
              <view class="item-icon" style="background: linear-gradient(135deg, #FF7043, #FF8A65);">
                <text class="tn-icon-calendar-fill"></text>
              </view>
              <view class="item-info">
                <view class="item-label">生日</view>
                <view class="item-desc">{{ date }}</view>
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
      
      <!-- 修改昵称弹窗 -->
      <tn-modal v-model="show1" :custom="true" :showCloseBtn="true">
        <view class="modal-content">
          <view class="modal-title">修改昵称</view>
          <view class="modal-input-wrap">
            <input 
              v-model="tempNickname"
              placeholder="请输入昵称" 
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
              @click="saveNickname"
            >
              保存
            </tn-button>
          </view>
        </view>
      </tn-modal>
      
      <!-- 修改手机号弹窗 -->
      <tn-modal v-model="show2" :custom="true" :showCloseBtn="true">
        <view class="modal-content">
          <view class="modal-title">绑定手机号</view>
          <view class="modal-desc">{{ phone || '暂未绑定手机号' }}</view>
          <view class="modal-btn">
            <tn-button 
              backgroundColor="#3D8B8F" 
              fontColor="#FFFFFF"
              shape="round"
              width="60%"
              shadow
            >
              获取手机号
            </tn-button>
          </view>
          <view class="modal-hint">
            注：获取手机号API收费，此功能需自行配置
          </view>
        </view>
      </tn-modal>
      
      <!-- 修改姓名弹窗 -->
      <tn-modal v-model="show3" :custom="true" :showCloseBtn="true">
        <view class="modal-content">
          <view class="modal-title">填写姓名</view>
          <view class="modal-input-wrap">
            <input 
              v-model="tempRealname"
              placeholder="请输入真实姓名" 
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
              @click="saveRealname"
            >
              保存
            </tn-button>
          </view>
        </view>
      </tn-modal>
      
    </view>
  </view>
</template>

<script>
  export default {
    name: 'Settings',
    data(){
      return {
        show1: false,
        show2: false,
        show3: false,
        nickname: '修行者',
        tempNickname: '',
        phone: '',
        realname: '',
        tempRealname: '',
        userAvatar: '',
        index: 2,
        genderArray: ['女', '男', '保密'],
        date: '2000-01-01',
        jobIndex: 0,
        jobArray: ['计算机/互联网', '教育/培训', '医疗/健康', '金融/财务', '自由职业', '其他']
      }
    },
    onShow() {
      this.loadUserInfo();
    },
    computed: {
      startDate() {
        return this.getDate('start');
      },
      endDate() {
        return this.getDate('end');
      }
    },
    methods: {
      goBack() {
        const pages = getCurrentPages()
        if (pages && pages.length > 0) {
          const firstPage = pages[0]
          if (pages.length == 1 && (!firstPage.route || firstPage.route != 'pages/index')) {
            uni.reLaunch({
              url: '/pages/index'
            })
          } else {
            uni.navigateBack({
              delta: 1
            })
          }
        } else {
          uni.reLaunch({
            url: '/pages/index'
          })
        }
      },
      tn(e) {
        uni.navigateTo({
          url: e,
        });
      },
      showModal1() {
        this.tempNickname = this.nickname;
        this.show1 = true;
      },
      showModal2() {
        this.show2 = true;
      },
      showModal3() {
        this.tempRealname = this.realname;
        this.show3 = true;
      },
      async saveNickname() {
        if (this.tempNickname.trim()) {
          this.nickname = this.tempNickname.trim();
          await this.saveUserInfo({ nickname: this.nickname });
        }
        this.show1 = false;
      },
      async saveRealname() {
        if (this.tempRealname.trim()) {
          this.realname = this.tempRealname.trim();
          await this.saveUserInfo({ realname: this.realname });
        }
        this.show3 = false;
      },
      async loadUserInfo() {
        const uid = uniCloud.getCurrentUserInfo().uid || uni.getStorageSync('uni_id_user_uid');
        if (!uid) {
          // 如果没有 uid，尝试从 Vuex 获取
          const vuexUser = this.$store.state.vuex_user;
          if (vuexUser && vuexUser.uid) {
             // 逻辑继续
          } else {
             return;
          }
        }
        
        const targetUid = uid || this.$store.state.vuex_user.uid;
        
        try {
          const waterApi = uniCloud.importObject('water-api');
          const res = await waterApi.getUserInfo({ uid: targetUid });
          
          if (res.errCode === 0 && res.data) {
            const u = res.data;
            this.nickname = u.nickname || '修行者';
            this.userAvatar = u.avatar || '';
            this.phone = u.mobile || '';
            this.realname = u.realname || ''; // 假设 water-api getUserInfo 返回了 realname，如果没有，需要去检查 water-api
            
            // water-api getUserInfo 目前只返回了 nickname, avatar, dao_profile
            // 为了完整性，我们应该确保 water-api 返回所有这些字段
            // 如果 water-api 没返回，这里就会是 undefined
            
            if (u.gender !== undefined) this.index = u.gender;
            if (u.birthday) this.date = u.birthday;
            if (u.job !== undefined) this.jobIndex = u.job;
          }
        } catch(e) {
          console.error('加载用户信息失败', e);
        }
      },
      async saveUserInfo(data) {
        const uid = uniCloud.getCurrentUserInfo().uid || uni.getStorageSync('uni_id_user_uid');
        if (!uid) {
          uni.showToast({ title: '请先登录', icon: 'none' });
          return;
        }
        
        try {
          const waterApi = uniCloud.importObject('water-api');
          const res = await waterApi.updateUserInfo({
            uid,
            data
          });
          
          if (res.errCode === 0) {
            uni.showToast({ title: '保存成功', icon: 'success' });
          } else {
            throw new Error(res.errMsg);
          }
        } catch(e) {
          console.error('保存失败', e);
          uni.showToast({ title: '保存失败', icon: 'none' });
        }
      },
      bindPickerChange(e) {
        this.index = Number(e.detail.value);
        this.saveUserInfo({ gender: this.index });
      },
      bindJobChange(e) {
        this.jobIndex = Number(e.detail.value);
        this.saveUserInfo({ job: this.jobIndex });
      },
      bindDateChange(e) {
        this.date = e.detail.value;
        this.saveUserInfo({ birthday: this.date });
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
  // 道心录配色
  $primary: #3D8B8F;
  $primary-light: #5AABAD;
  $accent: #C9A86C;
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

  // 设置卡片
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

  // 弹窗样式
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
