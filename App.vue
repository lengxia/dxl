<script>
import Vue from "vue";
import store from "./store/index.js";
import updateCustomBarInfo from "./tuniao-ui/libs/function/updateCustomBarInfo.js";

export default {
  onLaunch: function () {
    uni.getSystemInfo({
      success: function (e) {
        // #ifndef H5
        // 获取手机系统版本
        const system = e.system.toLowerCase();
        const platform = e.platform.toLowerCase();
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
      },
    });

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
    });

    // 登录逻辑封装
    const loginLogic = async () => {
      const uniIdCo = uniCloud.importObject("uni-id-co", { customUI: true });
      
      // 检查本地是否有 token
      const localToken = uni.getStorageSync('uni_id_token');
      const tokenExpired = uni.getStorageSync('uni_id_token_expired');
      const now = Date.now();
      
      // 如果有有效的 token，验证是否真实有效
      if (localToken && tokenExpired && tokenExpired > now) {
        console.log("本地存在 token，验证中...");
        // 预检查 uid 是否存在
        const localUid = uni.getStorageSync('uni_id_user_uid');
        if (!localUid) {
           console.log("本地 Token 存在但 UID 缺失，清除数据");
           uni.removeStorageSync('uni_id_token');
           uni.removeStorageSync('uni_id_token_expired');
        } else {
          try {
            // 尝试获取用户信息来验证 token 是否有效
            const checkResult = await loadUserInfo();
            if (checkResult) {
              console.log("Token 有效，用户已登录");
              return;
            }
          } catch(e) {
            console.log("Token 无效或已过期，清除本地数据");
            uni.removeStorageSync('uni_id_token');
            uni.removeStorageSync('uni_id_token_expired');
            uni.removeStorageSync('uni_id_user_uid');
          }
        }
      }

      console.log("未登录，等待用户授权...");
      // 不自动登录，等待用户在个人中心点击授权

      // #ifndef MP-WEIXIN
      console.log("非微信环境，无法登录");
      // #endif
    };

    // 加载用户信息
    const loadUserInfo = async () => {
      // 优先从 uniCloud 获取 uid，如果没有再从本地存储获取
      let uid = uniCloud.getCurrentUserInfo().uid || uni.getStorageSync('uni_id_user_uid');
      
      if (!uid) {
        console.log('UID 为空，跳过加载');
        return false;
      }
      
      // 如果从 getCurrentUserInfo 获取到了 uid，保存到本地存储
      if (uniCloud.getCurrentUserInfo().uid) {
        uni.setStorageSync('uni_id_user_uid', uid);
      }
      
      try {
        // 改用云对象调用，避免前端 DB 权限或 SDK 问题
        const waterApi = uniCloud.importObject('water-api');
        const res = await waterApi.getUserInfo({ uid });
        
        if(res.errCode === 0 && res.data) {
          const u = res.data;
          store.commit('$tStore', {
            name: 'vuex_user',
            value: {
              uid: uid,
              nickname: u.nickname || '修行者',
              avatar: u.avatar || '',
              isAnonymous: false
            }
          });
          return true;
        }
        return false;
      } catch(e) {
        console.error('加载用户信息失败', e);
        return false;
      }
    };

    // 执行登录逻辑
    loginLogic();
    
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
                    uni.clearStorageSync(); // 更新完成后刷新storage的数据
                    updateManager.applyUpdate();
                  }
                },
              });
            });

            updateManager.onUpdateFailed(() => {
              uni.showModal({
                title: "已有新版本上线",
                content:
                  "小程序自动更新失败，请删除该小程序后重新搜索打开哟~~~",
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
        content:
          "当前微信版本过低，无法使用该功能，请更新到最新的微信后再重试。",
        showCancel: false,
      });
    }
    // #endif
  },
  onShow: function () {
    // console.log('App Show')
  },
  onHide: function () {
    // console.log('App Hide')
  },
};
</script>

<style lang="scss">
/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
@import "./tuniao-ui/index.scss";
@import "./tuniao-ui/iconfont.css";
</style>