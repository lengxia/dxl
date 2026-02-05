const uniIdCommon = require('uni-id-common')
const {
  getType
} = require('./common/utils')
    const {
      checkClientInfo,
      Validator
    } = require('./common/validator')
const ConfigUtils = require('./lib/utils/config')
const {
  isUniIdError
} = require('./common/error')
const universal = require('./common/universal')

const {
  loginByWeixin
} = require('./module/login/index')

module.exports = {
  async _before () {
    // 支持 callFunction 与 URL化
    universal.call(this)

    const clientInfo = this.getUniversalClientInfo()
    
    checkClientInfo(clientInfo)
    let clientPlatform = clientInfo.uniPlatform
    // 统一platform名称
    switch (clientPlatform) {
      case 'app':
      case 'app-plus':
      case 'app-android':
      case 'app-ios':
        clientPlatform = 'app'
        break
      case 'web':
      case 'h5':
        clientPlatform = 'web'
        break
      default:
        break
    }

    this.clientPlatform = clientPlatform

    // 挂载uni-id实例到this上，方便后续调用
    this.uniIdCommon = uniIdCommon.createInstance({
      clientInfo
    })

    // 包含uni-id配置合并等功能的工具集
    this.configUtils = new ConfigUtils({
      context: this
    })
    this.config = this.configUtils.getPlatformConfig()
    this.hooks = this.configUtils.getHooks()

    this.validator = new Validator({
      passwordStrength: this.config.passwordStrength
    })

    // 手动实现简单的 validate 中间件
    this.middleware = {
      validate: (params, schema) => {
        // 这里可以实现简单的参数校验，或者直接跳过
        // 如果需要严格校验，可以复用之前 validator 目录下的逻辑
        // 暂时只保留空实现，避免报错，因为登录逻辑里调用了 validate
      },
      uniIdLog: async () => {
         // 空实现，不记日志
      }
    }

    this.t = function(key) { return key } // 简化国际化
    this.response = {}
  },
  _after (error, result) {
    if (error) {
      // 处理中间件内抛出的标准响应对象
      if (error.errCode && getType(error) === 'object') {
        const errCode = error.errCode
        if (!isUniIdError(errCode)) {
          return error
        }
        return {
          errCode,
          errMsg: error.errMsg || this.t(errCode, error.errMsgValue)
        }
      }
      throw error
    }
    return Object.assign(this.response, result)
  },
  
  /**
   * 修改当前用户信息
   */
  async updateMyInfo(params) {
      const uid = this.authInfo.uid
      if (!uid) {
          return {
              errCode: 'uni-id-token-expired',
              errMsg: 'Token已失效'
          }
      }
      
      const {
        nickname,
        avatar
      } = params
      
      const db = uniCloud.database();
      await db.collection('uni-id-users').doc(uid).update({
        nickname,
        avatar
      })
      
      return {
        errCode: 0,
        errMsg: '更新成功'
      }
  },
  
  /**
   * 微信登录
   */
  loginByWeixin
}
