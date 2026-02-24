/**
 * 全局事件总线
 * 用于组件间通信和系统事件通知
 *
 * 事件命名规范（建议）：
 * - 格式：'模块名:操作名'（例如：'user:profile:updated'）
 * - 使用小写字母和冒号分隔
 * - 前缀约定：
 *   - auth:* - 认证相关事件
 *   - user:* - 用户相关事件
 *   - ui:* - UI 相关事件
 *   - data:* - 数据相关事件
 */

// 事件名称前缀常量
export const EventPrefix = {
  AUTH: "auth",
  USER: "user",
  UI: "ui",
  DATA: "data",
};

// 验证事件名称是否合法
const validateEventName = (event) => {
  if (typeof event !== "string") {
    console.warn(`EventBus: 事件名应为字符串，收到 ${typeof event}`);
    return false;
  }
  if (!event || event.trim() === "") {
    console.warn("EventBus: 事件名不能为空");
    return false;
  }
  return true;
};

class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * 订阅事件
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // 返回取消订阅函数
    return () => this.off(event, callback);
  }

  /**
   * 取消订阅
   */
  off(event, callback) {
    if (!this.events[event]) return;

    if (!callback) {
      delete this.events[event];
    } else {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (!this.events[event]) return;

    this.events[event].forEach((callback) => {
      try {
        callback(data);
      } catch (e) {
        // 生产环境只输出 warn 级别，开发环境输出 error
        const isProd =
          typeof process !== "undefined" && process.env === "production";
        if (isProd) {
          console.warn(`[EventBus WARN] Event handler error for ${event}:`, e);
        } else {
          console.error(
            `[EventBus ERROR] Event handler error for ${event}:`,
            e,
          );
        }
      }
    });
  }

  /**
   * 订阅一次性事件
   */
  once(event, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }
}

// 导出单例
export default new EventBus();
