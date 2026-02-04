// 云对象入口文件
const uniId = require('uni-id-common')

module.exports = {
  _before: async function () {
    this.uniIdCommon = uniId.createInstance({
      clientInfo: this.getClientInfo()
    })
  },
  
  /**
   * 匿名登录（手动实现）
   */
  loginByAnonymous: async function (params) {
    const db = uniCloud.database()
    const collection = db.collection('uni-id-users')
    
    // 1. 创建一个匿名用户记录
    const { id: uid } = await collection.add({
      role: [],
      my_invite_code: Math.random().toString(36).substring(2, 8),
      register_date: Date.now(),
      register_ip: this.getClientInfo().clientIP
    })

    // 2. 使用 uni-id-common 生成 Token
    const { token, tokenExpired } = await this.uniIdCommon.createToken({
      uid,
      role: []
    })

    return {
      uid,
      token,
      tokenExpired,
      type: 'register', // 标记为新注册
      userInfo: {
        _id: uid,
        role: []
      }
    }
  },

  /**
   * 微信登录（占位，暂未实现完整逻辑）
   */
  loginByWeixin: async function (params) {
    // 由于 uni-id-common 不含微信登录逻辑，此处暂返回错误或需完整引入 uni-id 库
    // 临时降级处理：直接调用匿名登录
    console.warn('当前 uni-id-common 版本不支持直接调用 loginByWeixin，降级为匿名登录')
    return this.loginByAnonymous(params)
  },
  
  /**
   * 退出登录
   */
  logout: async function () {
    return this.uniIdCommon.logout()
  }
}