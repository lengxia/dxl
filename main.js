import App from './App'
import store from './store'

import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'

if (process.env.NODE_ENV !== 'development') {
	console.log = () => {}
}

// 引入全局TuniaoUI
import TuniaoUI from 'tuniao-ui'
Vue.use(TuniaoUI)

// 引入TuniaoUI提供的vuex简写方法
let vuexStore = require('@/store/$t.mixin.js')
Vue.mixin(vuexStore)

// 引入TuniaoUI对小程序分享的mixin封装
let mpShare = require('tuniao-ui/libs/mixin/mpShare.js')
Vue.mixin(mpShare)

// 引入统一的身份认证逻辑
import {
	checkLogin,
	logout
} from '@/libs/auth.js'

// 全局uni-id配置
Vue.prototype.$uniID = {
	// 检查登录状态
	checkLogin,
	// 退出登录
	logout
}

const app = new Vue({
	store,
	...App
})
app.$mount()