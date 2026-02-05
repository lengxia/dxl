import App from './App'
import store from './store'

import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'

// 引入全局TuniaoUI
import TuniaoUI from 'tuniao-ui'
Vue.use(TuniaoUI)

// 引入TuniaoUI提供的vuex简写方法
let vuexStore = require('@/store/$t.mixin.js')
Vue.mixin(vuexStore)

// 引入TuniaoUI对小程序分享的mixin封装
let mpShare = require('tuniao-ui/libs/mixin/mpShare.js')
Vue.mixin(mpShare)

// 全局uni-id配置
Vue.prototype.$uniID = {
  // 检查登录状态
  async checkLogin() {
    const token = uni.getStorageSync('uni_id_token')
    if (!token) {
      return false
    }
    
    try {
      // 简单检查token有效期
      const tokenExpired = uni.getStorageSync('uni_id_token_expired')
      if (tokenExpired && tokenExpired > Date.now()) {
        return true
      }

      const uid = uni.getStorageSync('uni_id_user_uid')
      if (!uid) {
         uni.removeStorageSync('uni_id_token')
         return false
      }
      
      const waterApi = uniCloud.importObject('water-api')
      const res = await waterApi.getUserInfo({ uid })
      
      if (res.errCode === 0) {
        // token有效，更新用户信息
        this.$store.commit('$tStore', {
          name: 'vuex_user',
          value: res.data
        })
        return true
      } else {
        // token无效或过期，清除本地存储
        uni.removeStorageSync('uni_id_token')
        uni.removeStorageSync('uni_id_token_expired')
        uni.removeStorageSync('uni_id_user_uid')
        return false
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      return false
    }
  },
  
  // 退出登录
  async logout() {
    // 清除本地存储
    uni.removeStorageSync('uni_id_token')
    uni.removeStorageSync('uni_id_token_expired')
    uni.removeStorageSync('uni_id_user_uid')
    
    this.$store.commit('$tStore', {
      name: 'vuex_user',
      value: { name: '图鸟' }
    })
    
    uni.reLaunch({
      url: '/pages/index'
    })
  }
}

const app = new Vue({
  store,
  ...App
})

app.$mount()