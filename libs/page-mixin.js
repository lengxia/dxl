/**
 * 页面公共 Mixin
 * 职责：
 * 1. 统一的生命周期管理
 * 2. 自动登录检查
 * 3. 智能节流
 * 4. 标准化数据加载
 */
import { checkLogin, getCurrentUid } from './auth.js';
import EventBus from './event-bus.js';

export default {
  data() {
    return {
      // 页面状态
      pageLoading: false,
      pageError: null,
      
      // 登录状态
      isLogin: false,
      currentUid: null,
      
      // 节流控制
      _lastLoadTime: 0,
      _throttleDelay: 5000,  // 默认 5 秒节流
      
      // 事件订阅清理
      _eventUnsubscribers: []
    };
  },

  onLoad(options) {
    // 页面参数
    this.pageOptions = options || {};
    
    // 初始化登录状态
    this.checkLoginState();
    
    // 调用子类的 onPageLoad
    if (typeof this.onPageLoad === 'function') {
      this.onPageLoad(options);
    }
  },

  onShow() {
    // 更新登录状态
    this.checkLoginState();
    
    // 如果已登录，执行节流加载
    if (this.isLogin) {
      this.throttledLoad();
    }
    
    // 调用子类的 onPageShow
    if (typeof this.onPageShow === 'function') {
      this.onPageShow();
    }
  },

  onUnload() {
    // 清理事件订阅（防御性编程）
    if (this._eventUnsubscribers && Array.isArray(this._eventUnsubscribers)) {
      this._eventUnsubscribers.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      this._eventUnsubscribers = [];
    }
    
    // 调用子类的 onPageUnload
    if (typeof this.onPageUnload === 'function') {
      this.onPageUnload();
    }
  },

  methods: {
    /**
     * 检查登录状态
     */
    checkLoginState() {
      this.isLogin = checkLogin();
      this.currentUid = this.isLogin ? getCurrentUid() : null;
      
      return this.isLogin;
    },

    /**
     * 节流加载数据
     */
    throttledLoad() {
      const now = Date.now();
      
      // 检查是否在节流期内
      if (now - this._lastLoadTime < this._throttleDelay) {
        return false;
      }
      
      this._lastLoadTime = now;
      
      // 调用子类的 loadPageData
      if (typeof this.loadPageData === 'function') {
        this.loadPageData();
      }
      
      return true;
    },

    /**
     * 强制刷新数据（跳过节流）
     */
    forceRefresh() {
      this._lastLoadTime = 0;
      this.throttledLoad();
    },

    /**
     * 设置节流延迟
     */
    setThrottleDelay(delay) {
      this._throttleDelay = delay;
    },

    /**
     * 订阅事件（自动清理）
     */
    subscribeEvent(event, callback) {
      const unsubscribe = EventBus.on(event, callback);
      
      // 确保数组已初始化（防御性编程）
      if (!this._eventUnsubscribers) {
        this._eventUnsubscribers = [];
      }
      
      this._eventUnsubscribers.push(unsubscribe);
      return unsubscribe;
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.switchTab({ url: '/pages/home/home' });
        }
      });
    },

    /**
     * 显示加载中
     */
    showLoading(title = '加载中') {
      this.pageLoading = true;
      uni.showLoading({ title, mask: true });
    },

    /**
     * 隐藏加载中
     */
    hideLoading() {
      this.pageLoading = false;
      uni.hideLoading();
    },

    /**
     * 显示错误信息
     */
    showError(message, duration = 2500) {
      this.pageError = message;
      uni.showToast({
        title: message,
        icon: 'none',
        duration
      });
    },

    /**
     * 显示成功信息
     */
    showSuccess(message, duration = 1500) {
      uni.showToast({
        title: message,
        icon: 'success',
        duration
      });
    },

    /**
     * 确认对话框
     */
    confirm(content, title = '提示') {
      return new Promise((resolve) => {
        uni.showModal({
          title,
          content,
          success: (res) => {
            resolve(res.confirm);
          }
        });
      });
    }
  },

  /**
   * 页面滚动事件（可选覆盖）
   */
  onPageScroll(e) {
    // 子类可以覆盖此方法
  }
};