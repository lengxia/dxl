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

// 引入 API 服务
import { installApi } from '@/libs/api.js'

// 引入事件总线
import EventBus from '@/libs/event-bus.js'

// 全局uni-id配置
Vue.prototype.$uniID = {
	// 检查登录状态
	checkLogin,
	// 退出登录
	logout
}

// 安装 API 服务到 Vue 原型
installApi(Vue)

// 挂载事件总线到 Vue 原型
Vue.prototype.$eventBus = EventBus

// 监听全局认证事件
// auth:expired - Token 过期（系统被动触发）
EventBus.on('auth:expired', () => {
	uni.showToast({
		title: '登录已过期',
		icon: 'none'
	})
	
	// 调用统一的 logout 清理逻辑
	setTimeout(() => {
		logout()  // 这会清理 token、Vuex，并触发 auth:logout 事件
	}, 1500)
})

// auth:logout - 用户主动退出 或 Token 过期后的最终跳转
EventBus.on('auth:logout', () => {
	// 统一的退出后跳转逻辑
	uni.switchTab({ url: '/pages/mine/index' })
})

const app = new Vue({
	store,
	...App
})
app.$mount()