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
      const uid = uniCloud.getCurrentUserInfo().uid;

      if (uid) {
        console.log("当前已登录，UID:", uid);
        return;
      }

      console.log("当前未登录，开始尝试自动登录...");

      // #ifdef MP-WEIXIN
      // 微信小程序环境：优先尝试微信登录
      uni.login({
        provider: "weixin",
        success: (res) => {
          console.log("微信 code 获取成功:", res.code);
          uniIdCo
            .loginByWeixin({
              code: res.code,
            })
            .then((loginRes) => {
              console.log("微信登录成功:", loginRes);
              // 这里可以触发 vuex 更新用户信息
            })
            .catch((err) => {
              console.error("微信登录失败，尝试匿名登录兜底:", err);
              // 微信登录失败（可能是云端未配置AppID），尝试匿名登录
              anonymousLogin(uniIdCo);
            });
        },
        fail: (err) => {
          console.error("uni.login 接口调用失败:", err);
          anonymousLogin(uniIdCo);
        },
      });
      // #endif

      // #ifndef MP-WEIXIN
      // 非微信小程序环境：直接尝试匿名登录
      anonymousLogin(uniIdCo);
      // #endif
    };

    // 匿名登录辅助函数
    const anonymousLogin = (uniIdCo) => {
      console.log("正在尝试匿名登录...");
      uniIdCo
        .loginByAnonymous()
        .then((res) => {
          console.log("匿名登录成功:", res);
          // 关键步骤：将 Token 存入本地存储，让 SDK 感知登录状态
          if (res.token) {
            uni.setStorageSync('uni_id_token', res.token);
            uni.setStorageSync('uni_id_token_expired', res.tokenExpired);
            // 同时也存入 vuex，方便应用内使用
            store.commit('$tStore', {
              name: 'vuex_user',
              value: res.userInfo || { uid: res.uid }
            });
            console.log("Token 已保存，登录状态已激活");
          }
        })
        .catch((err) => {
          console.error("匿名登录失败:", err);
          // 如果匿名登录也失败，说明云端可能未开启允许匿名，或者网络不通
        });
    };

    // 执行登录逻辑
    loginLogic();

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
