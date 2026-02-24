/**
 * 统一的 API 服务层
 * 职责：
 * 1. 封装云函数调用
 * 2. 统一错误处理
 * 3. 自动同步用户数据到 Vuex
 * 4. 请求/响应拦截
 */
import EventBus from './event-bus.js';

// 日志级别配置
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// 当前环境判断（开发环境输出日志，生产环境过滤）
const currentLogLevel = process.env.NODE_ENV === 'production' ? LOG_LEVEL.WARN : LOG_LEVEL.DEBUG;

// 日志输出函数
const logger = {
  debug: (...args) => currentLogLevel <= LOG_LEVEL.DEBUG && console.debug('[API DEBUG]', ...args),
  info: (...args) => currentLogLevel <= LOG_LEVEL.INFO && console.info('[API INFO]', ...args),
  warn: (...args) => currentLogLevel <= LOG_LEVEL.WARN && console.warn('[API WARN]', ...args),
  error: (...args) => currentLogLevel <= LOG_LEVEL.ERROR && console.error('[API ERROR]', ...args)
};

class ApiService {
  constructor() {
    this.waterApi = null;
    this.requestQueue = [];
    this.isProcessing = false;
  }

  /**
   * 获取云函数实例
   */
  getCloudFunction() {
    if (!this.waterApi) {
      this.waterApi = uniCloud.importObject('water-api', { customUI: true });
    }
    return this.waterApi;
  }

  /**
   * 统一调用云函数
   * @param {String} method 方法名
   * @param {Object} params 参数
   * @param {Object} options 配置项
   */
  async call(method, params = {}, options = {}) {
    const {
      showLoading = false,
      loadingText = '加载中',
      autoSyncUser = true,  // 自动同步用户数据
      showError = true      // 自动显示错误
    } = options;

    try {
      if (showLoading) {
        uni.showLoading({ title: loadingText, mask: true });
      }

      const api = this.getCloudFunction();
      const res = await api[method](params);

      if (showLoading) {
        uni.hideLoading();
      }

      // 处理响应
      if (res.errCode === 0) {
        // 自动同步用户数据（如果云函数返回了）
        if (autoSyncUser && res.userProfile) {
          this.syncUserData(res.userProfile);
        }

        return {
          success: true,
          data: res.data,
          hasMore: res.hasMore,
          message: res.errMsg
        };
      } else {
        // 业务错误
        if (showError) {
          this.showError(res.errMsg || '操作失败');
        }
        
        // 处理特殊错误码
        this.handleErrorCode(res.errCode, res.errMsg);

        return {
          success: false,
          error: res.errMsg,
          errCode: res.errCode
        };
      }
    } catch (e) {
      if (showLoading) {
        uni.hideLoading();
      }

      // 网络或系统错误
      const errorMsg = this.parseError(e);
      
      if (showError) {
        this.showError(errorMsg);
      }

      return {
        success: false,
        error: errorMsg,
        exception: e
      };
    }
  }

  /**
   * 解析错误信息
   */
  parseError(error) {
    const message = error.message || error.errMsg || '';

    // 数据库资源耗尽
    if (message.indexOf('resource exhausted') > -1) {
      return '服务器繁忙，请稍后再试';
    }

    // Token 过期
    if (message.indexOf('token') > -1 || message.indexOf('登录') > -1) {
      EventBus.emit('auth:expired');
      return '登录已过期，请重新登录';
    }

    // 匿名用户
    if (message.indexOf('匿名') > -1) {
      EventBus.emit('auth:expired');  // 统一使用 auth:expired
      return '请先登录';
    }

    // 权限不足
    if (message.indexOf('权限') > -1 || message.indexOf('无权') > -1) {
      return '权限不足';
    }

    return message || '操作失败';
  }

  /**
   * 处理特殊错误码
   */
  handleErrorCode(errCode, errMsg) {
    switch (errCode) {
      case 401:
        // 未登录或登录过期 - 统一触发 auth:expired
        EventBus.emit('auth:expired');
        break;
      case 403:
        // 权限不足
        EventBus.emit('auth:forbidden', errMsg);
        break;
      case 404:
        // 资源不存在
        break;
      default:
        break;
    }
  }

  /**
   * 刷新用户信息（从云端拉取）
   * @param {String} uid 用户ID
   * @param {Boolean} triggerEvent 是否触发更新事件
   */
  async refreshUserInfo(uid, triggerEvent = true) {
    if (!uid) return { success: false, message: 'UID不能为空' };

    // 调用云函数 getUserInfo
    // 注意：autoSyncUser 控制的是 dao_profile 的同步，这里我们先保留它
    const res = await this.call(
      'getUserInfo',
      { uid },
      { showLoading: false, autoSyncUser: true }
    );

    if (res.success && res.data) {
      // 额外触发一次全量用户更新，确保 vuex_user 更新完整
      if (triggerEvent) {
        EventBus.emit('user:updated', res.data);
      }
      
      return { success: true, data: res.data };
    }
    
    return { success: false, message: res.message || '获取用户信息失败' };
  }

  /**
   * 同步用户数据到 Vuex
   * 通过事件通知 Auth 层处理，避免直接耦合
   */
  syncUserData(userProfile) {
    if (!userProfile) return;

    // 通知 Auth 层更新用户数据
    EventBus.emit('user:profile:sync', userProfile);

    // 触发用户数据更新事件（给其他模块监听）
    EventBus.emit('user:profile:updated', userProfile);
  }

  /**
   * 显示错误提示
   */
  showError(message) {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2500
    });
  }

  /**
   * 批量调用（并发优化）
   * @param {Array} calls - 调用列表，每项包含 { method, params, options }
   * @example
   * const results = await api.batchCall([
   *   { method: 'getUserInfo', params: { uid: 'xxx' } },
   *   { method: 'getDailyTask', params: { date: '2026-02-21' } }
   * ]);
   */
  async batchCall(calls) {
    const promises = calls.map(({ method, params, options }) => 
      this.call(method, params, options)
    );
    return Promise.all(promises);
  }
}

// 导出单例
const apiService = new ApiService();

// 安装到 Vue 原型（在 main.js 中调用）
export function installApi(Vue) {
  Vue.prototype.$api = apiService;
}

export default apiService;