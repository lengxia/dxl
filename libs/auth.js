import store, {
	DEFAULT_USER
} from "@/store";
import EventBus from "./event-bus.js";

// 延迟导入 apiService 以避免循环依赖
let apiService = null;
const getApiService = () => {
	if (!apiService) {
		apiService = require("./api.js").default;
	}
	return apiService;
};

/**
 * Token 管理类
 */
class TokenManager {
	constructor() {
		this.tokenKey = "uni_id_token";
		this.tokenExpiredKey = "uni_id_token_expired";
		this.uidKey = "uni_id_user_uid";
		this.checkInterval = null;
	}

	getToken() {
		return uni.getStorageSync(this.tokenKey);
	}

	setToken(token, expiredTime) {
		uni.setStorageSync(this.tokenKey, token);
		if (expiredTime) {
			uni.setStorageSync(this.tokenExpiredKey, expiredTime);
		}
	}

	clearToken() {
		uni.removeStorageSync(this.tokenKey);
		uni.removeStorageSync(this.tokenExpiredKey);
		uni.removeStorageSync(this.uidKey);
	}

	isTokenExpired() {
		const token = this.getToken();
		if (!token) return true;

		const expiredTime = uni.getStorageSync(this.tokenExpiredKey);
		if (!expiredTime) return false;

		return Date.now() > expiredTime;
	}

	startAutoCheck() {
		if (this.checkInterval) return;

		this.checkInterval = setInterval(() => {
			if (this.isTokenExpired()) {
				EventBus.emit("auth:expired");
				this.clearToken();
			}
		}, 60000);
	}

	stopAutoCheck() {
		if (this.checkInterval) {
			clearInterval(this.checkInterval);
			this.checkInterval = null;
		}
	}
}

const tokenManager = new TokenManager();

/**
 * 更新 Vuex 用户状态（深度合并 dao_profile）
 */
export const updateStoreUser = (userInfo) => {
	const currentUser = store.state.vuex_user || DEFAULT_USER;

	let finalUser = {
		...currentUser,
		...userInfo,
	};

	// 特殊处理嵌套对象 dao_profile，确保不覆盖已有字段
	if (userInfo.dao_profile) {
		finalUser.dao_profile = {
			...(currentUser.dao_profile || {}),
			...userInfo.dao_profile,
		};
	}
	// 修复：如果有 _id 或 uid，说明已登录，设置 isAnonymous 为 false
	if (finalUser._id || finalUser.uid) {
		finalUser.isAnonymous = false;
	}

	store.commit("$tStore", {
		name: "vuex_user",
		value: finalUser,
	});

	// user:updated 事件已废弃，改用 Vuex watch 机制
};

/**
 * 检查登录状态
 */
export const checkLogin = () => {
	return !tokenManager.isTokenExpired();
};

/**
 * 获取当前用户 UID
 */
export const getCurrentUid = () => {
	return (
		store.state.vuex_user?._id ||
		store.state.vuex_user?.uid ||
		uni.getStorageSync(tokenManager.uidKey)
	);
};

/**
 * 设置登录信息
 */
export function setLoginInfo(token, user, expiredTime) {
	tokenManager.setToken(token, expiredTime);

	if (user) {
		uni.setStorageSync(tokenManager.uidKey, user._id || user.uid);
		updateStoreUser(user);
	}

	EventBus.emit("auth:login", user);
}

/**
 * 退出登录
 */
export const logout = async () => {
	tokenManager.clearToken();

	store.commit("$tStore", {
		name: "vuex_user",
		value: DEFAULT_USER,
	});

	EventBus.emit("auth:logout");
};

/**
 * 跳转到登录页
 * 由于项目没有独立登录页，引导用户跳转到个人中心进行微信登录
 */
export const navigateToLogin = () => {
	uni.showToast({
		title: "请前往个人中心登录",
		icon: "none",
	});

	setTimeout(() => {
		uni.switchTab({
			url: "/pages/mine/index",
		});
	}, 1500);
};

/**
 * 同步用户打卡状态
 * 使用 API Service 统一调用
 */
export const syncUserExpendsInfo = async () => {
	const uid = getCurrentUid();
	if (!uid) return null;

	try {
		const now = new Date();
		const dateStr =
			`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

		const api = getApiService();
		const res = await api.call(
			"checkDailyTaskStatus", {
				uid,
				date: dateStr
			}, {
				showLoading: false,
				showError: false
			},
		);

		if (res.success && res.data && res.data.hasChecked) {
			store.commit("$tStore", {
				name: "vuex_last_daily_date",
				value: dateStr,
			});
		}
	} catch (e) {
		console.error("同步打卡状态失败", e);
	}
	return null;
};

/**
 * 同步用户信息
 * 委托给 API Service 的 refreshUserInfo 方法，避免逻辑重复
 * @param {String} uid - 用户ID
 * @param {Boolean} triggerEvent - 是否触发更新事件（默认true），登录流程中设为false以避免重复更新
 */
export const syncUserInfo = async (uid, triggerEvent = true) => {
	// 优先使用传入的 uid，否则尝试获取当前 uid
	const targetUid = uid || getCurrentUid();
	if (!targetUid) return null;

	try {
		const api = getApiService();
		// 此时 api.refreshUserInfo 已存在
		const result = await api.refreshUserInfo(targetUid, triggerEvent);

		if (result.success) {
			return result.data;
		}
	} catch (e) {
		console.error("同步用户信息失败", e);
	}
	return null;
};

/**
 * 微信登录
 */
export const loginByWeixin = async (isSilent = false) => {
	// #ifdef MP-WEIXIN
	if (!isSilent) {
		uni.showLoading({
			title: "登录中..."
		});
	}

	try {
		const loginRes = await new Promise((resolve, reject) => {
			uni.login({
				provider: "weixin",
				onlyAuthorize: true,
				success: resolve,
				fail: reject,
			});
		});

		const uniIdCo = uniCloud.importObject("uni-id-co", {
			customUI: true
		});
		const loginResult = await uniIdCo.loginByWeixin({
			code: loginRes.code
		});

		if (loginResult.newToken) {
			const uid = loginResult.uid || loginResult._id;

			// 同步完整用户信息（传入 uid，且不触发事件避免重复更新 store）
			// setLoginInfo 会负责更新 store
			const userInfo = await syncUserInfo(uid, false);
			await syncUserExpendsInfo();

			// 使用 setLoginInfo 统一处理登录信息
			setLoginInfo(
				loginResult.newToken.token,
				userInfo,
				loginResult.newToken.tokenExpired,
			);

			if (!isSilent) {
				uni.hideLoading();
				uni.showToast({
					title: "登录成功",
					icon: "success"
				});
			}

			return {
				success: true,
				result: {
					...loginResult,
					userInfo
				},
			};
		}

		if (!isSilent) uni.hideLoading();
		throw new Error(loginResult.errMsg || "登录获取Token失败");
	} catch (e) {
		if (!isSilent) uni.hideLoading();
		console.error("微信登录失败", e);
		return {
			success: false,
			error: e,
		};
	}
	// #endif

	// #ifndef MP-WEIXIN
	return {
		success: false,
		error: new Error("仅支持微信小程序"),
	};
	// #endif
};
/**
 * 更新用户资料
 * 使用 API Service 统一调用（会自动更新 Vuex）
 */
export const updateUserProfile = async (data) => {
	const uid = getCurrentUid();
	if (!uid) throw new Error("未登录");

	const api = getApiService();
	const res = await api.call(
		"updateUserInfo", {
			uid,
			data
		}, {
			showLoading: false,
			showError: true
		},
	);

	if (res.success) {
		// API Service 已自动同步用户数据
		return true;
	}
	throw new Error(res.message || "更新失败");
};

/**
 * 获取 Token 管理器
 */
export function getTokenManager() {
	return tokenManager;
}

// 启动自动 Token 检查
tokenManager.startAutoCheck();

// ==================== 事件监听（解耦 API 层） ====================

// 监听用户数据同步事件（仅 dao_profile）
EventBus.on("user:profile:sync", (userProfile) => {
	if (userProfile) {
		updateStoreUser({
			dao_profile: userProfile,
		});
	}
});

// 监听全量用户数据更新事件
EventBus.on("user:updated", (userInfo) => {
	if (userInfo) {
		updateStoreUser(userInfo);
	}
});

// 注意：auth:expired 和 auth:logout 的监听器统一在 main.js 中处理
// 这里不再重复监听，避免事件处理冲突