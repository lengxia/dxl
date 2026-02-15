import store from '@/store'

// 内部辅助：更新 Vuex 用户状态
const updateStoreUser = (userInfo) => {
	store.commit('$tStore', {
		name: 'vuex_user',
		value: {
			...store.state.vuex_user,
			...userInfo,
		}
	})
}


// 同步用户打卡状态（获取今日是否已打卡）
export const syncUserExpendsInfo = async () => {
	const uid = getCurrentUid()
	if (!uid) return null

	try {
		const now = new Date();
		// 格式化为 YYYY-MM-DD
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const dateStr = `${year}-${month}-${day}`;
		
		// 调用后端接口检查今日打卡状态
		const waterApi = uniCloud.importObject('water-api', { customUI: true })
		const res = await waterApi.checkDailyTaskStatus({
			uid,
			date: dateStr
		});
		
		if (res.errCode === 0 && res.data.hasChecked) {
			// 更新 vuex_last_daily_date 状态
			store.commit('$tStore', {
				name: 'vuex_last_daily_date',
				value: dateStr
			})
		}

	} catch (e) {
		// 同步打卡状态失败
	}
	return null
}

// 同步用户信息（获取最新数据）
export const syncUserInfo = async () => {
	const uid = getCurrentUid()
	if (!uid) return null

	try {
		const waterApi = uniCloud.importObject('water-api', { customUI: true })
		const res = await waterApi.getUserInfo({
			uid
		})

		if (res.errCode === 0 && res.data) {
			const u = res.data
			const userInfo = {
				uid: uid,
				nickname: u.nickname || '修行者',
				avatar: u.avatar || '',
				isAnonymous: false,
				// 保留完整数据以便业务使用
				...u
			}
			updateStoreUser(userInfo)
			return userInfo
		}
	} catch (e) {
		// 同步用户信息失败
	}
	return null
}

// 微信登录
export const loginByWeixin = async (isSilent = false) => {
	// #ifdef MP-WEIXIN
	if (!isSilent) {
		uni.showLoading({
			title: '登录中...'
		})
	}

	try {
		const loginRes = await new Promise((resolve, reject) => {
			uni.login({
				provider: 'weixin',
				onlyAuthorize: true,
				success: resolve,
				fail: reject
			})
		})

		const uniIdCo = uniCloud.importObject("uni-id-co", {
			customUI: true
		})
		const loginResult = await uniIdCo.loginByWeixin({
			code: loginRes.code
		})
		// 暂时不关闭 loading，等待后续资料同步

		if (loginResult.newToken) {
			uni.setStorageSync('uni_id_token', loginResult.newToken.token)
			if (loginResult.tokenExpired) {
				uni.setStorageSync('uni_id_token_expired', loginResult.newToken.tokenExpired)
			}

			const uid = loginResult.uid || loginResult._id
			if (uid) uni.setStorageSync('uni_id_user_uid', uid)

			const userInfo = await syncUserInfo()
			const dailt_task = await syncUserExpendsInfo()
			loginResult.userInfo = userInfo
			
			if (!isSilent) {
				uni.hideLoading() // 这里再关闭 loading
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				});
			}
			return {
				success: true,
				result: loginResult
			}
		}

		if (!isSilent) uni.hideLoading() // 失败情况关闭
		throw new Error(loginResult.errMsg || '登录获取Token失败')
	} catch (e) {
		if (!isSilent) uni.hideLoading()
		console.error('微信登录失败', e)
		return {
			success: false,
			error: e
		}
	}
	// #endif

	// #ifndef MP-WEIXIN
	return {
		success: false,
		error: new Error('仅支持微信小程序')
	}
	// #endif
}

// 更新用户资料
export const updateUserProfile = async (data) => {
	const uid = getCurrentUid()
	if (!uid) throw new Error('未登录')

	const waterApi = uniCloud.importObject('water-api', { customUI: true })
	const res = await waterApi.updateUserInfo({
		uid,
		data
	})

	if (res.errCode === 0) {
		updateStoreUser(data)
		return true
	}
	throw new Error(res.errMsg || '更新失败')
}

// 检查登录状态
export const checkLogin = () => {
	const token = uni.getStorageSync('uni_id_token')
	if (!token) return false

	// 检查是否过期
	const tokenExpired = uni.getStorageSync('uni_id_token_expired')
	if (tokenExpired) {
		const now = Date.now()
		if (now > tokenExpired) {
			clearLoginInfo()
			return false
		}
	}

	return true
}

// 退出登录
export const logout = async () => {
	clearLoginInfo()

	store.commit('$tStore', {
		name: 'vuex_user',
		value: {
			name: '道友',
			nickname: '修行者',
			isAnonymous: true
		}
	})
	// uni.reLaunch({
	// 	url: '/pages/index'
	// })
}

// 内部辅助函数：清除本地登录信息
const clearLoginInfo = () => {
	uni.removeStorageSync('uni_id_token')
	uni.removeStorageSync('uni_id_token_expired')
	uni.removeStorageSync('uni_id_user_uid')
}
// 获取当前用户UID（从本地存储获取）
export const getCurrentUid = () => {
	return uni.getStorageSync('uni_id_user_uid');
}
