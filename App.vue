<script>
	import Vue from "vue";
	import store from "./store/index.js";
	import updateCustomBarInfo from "./tuniao-ui/libs/function/updateCustomBarInfo.js";
	import { checkLogin, getCurrentUid, syncUserInfo, syncUserExpendsInfo } from "@/libs/auth";

	export default {
		onLaunch: function() {
			// 使用同步方法获取系统信息，避免异步竞态问题
			try {
				const e = uni.getSystemInfoSync();
				// #ifndef H5
				// 获取手机系统版本
				const system = e.system ? e.system.toLowerCase() : '';
				const platform = e.platform ? e.platform.toLowerCase() : '';
				// 判断是否为ios设备
				if (
					platform.indexOf("ios") != -1 &&
					(system.indexOf("ios") != -1 || system.indexOf("macos") != -1)
				) {
					Vue.prototype.SystemPlatform = "apple";
				} else if (
					platform.indexOf("android") != -1 &&
					system.indexOf("android") != -1
				) {
					Vue.prototype.SystemPlatform = "android";
				} else {
					Vue.prototype.SystemPlatform = "devtools";
				}
				// #endif
			} catch (e) {
				// 获取系统信息失败
			}

			// 获取设备的状态栏信息和自定义顶栏信息
			// store.dispatch('updateCustomBarInfo')
			updateCustomBarInfo().then((res) => {
				store.commit("$tStore", {
					name: "vuex_status_bar_height",
					value: res.statusBarHeight,
				});
				store.commit("$tStore", {
					name: "vuex_custom_bar_height",
					value: res.customBarHeight,
				});
			}).catch((err) => {
				console.error("获取状态栏信息失败:", err);
			});

			// #ifdef MP-WEIXIN
			// 首次启动引导逻辑已迁移至 pages/index.vue 以实现 UI 美化
			// #endif

			// #ifdef MP-WEIXIN
			//更新检测
			if (wx.canIUse("getUpdateManager")) {
				const updateManager = wx.getUpdateManager();
				updateManager &&
					updateManager.onCheckForUpdate((res) => {
						if (res.hasUpdate) {
							updateManager.onUpdateReady(() => {
								uni.showModal({
									title: "更新提示",
									content: "新版本已经准备就绪，是否需要重新启动应用？",
									success: (res) => {
										if (res.confirm) {
											// 已移除 uni.clearStorageSync()，避免用户数据丢失
											updateManager.applyUpdate();
										}
									},
								});
							});

							updateManager.onUpdateFailed(() => {
								uni.showModal({
									title: "已有新版本上线",
									content: "小程序自动更新失败，请删除该小程序后重新搜索打开哟~~~",
									showCancel: false,
								});
							});
						} else {
							//没有更新
						}
					});
			} else {
				uni.showModal({
					title: "提示",
					content: "当前微信版本过低，无法使用该功能，请更新到最新的微信后再重试。",
					showCancel: false,
				});
			}
			// #endif
		},
		onShow: function() {
			// App Show - 每次切回前台时，静默同步用户数据
			if (checkLogin()) {
				const uid = getCurrentUid();
				if (uid) {
					// 延迟执行，不阻塞 UI 渲染
					setTimeout(() => {
						syncUserInfo(uid);
						syncUserExpendsInfo();
					}, 500);
				}
			}
		},
		onHide: function() {
			// App Hide
		},
	};
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "./tuniao-ui/index.scss";
	@import "./tuniao-ui/iconfont.css";
</style>