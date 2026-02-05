const {
  userCollection
} = require('../../common/constants')
const {
  ERROR
} = require('../../common/error')
const {
  findUser
} = require('./account')
const { 
  merge
} = require('../npm/index')

async function realPreRegister (params = {}) {
  const {
    user
  } = params
  const {
    userMatched
  } = await findUser({
    userQuery: user,
    authorizedApp: this.getUniversalClientInfo().appId
  })
  if (userMatched.length > 0) {
    throw {
      errCode: ERROR.ACCOUNT_EXISTS
    }
  }
}

async function preRegister (params = {}) {
  await realPreRegister.call(this, params)
}

async function thirdPartyRegister ({
  user = {}
} = {}) {
  return {
    mobileConfirmed: !!(user.mobile && user.mobile_confirmed) || false,
    emailConfirmed: !!(user.email && user.email_confirmed) || false
  }
}

async function postRegister (params = {}) {
  const {
    user,
    extraData = {},
    isThirdParty = false
  } = params
  const {
    appId,
    appName,
    appVersion,
    appVersionCode,
    channel,
    scene,
    clientIP,
    osName
  } = this.getUniversalClientInfo()
  
  merge(user, extraData)

  const registerChannel = channel || scene
  user.register_env = {
    appid: appId || '',
    uni_platform: this.clientPlatform || '',
    os_name: osName || '',
    app_name: appName || '',
    app_version: appVersion || '',
    app_version_code: appVersionCode || '',
    channel: registerChannel ? registerChannel + '' : '', // channel可能为数字，统一存为字符串
    client_ip: clientIP || ''
  }

  user.register_date = Date.now()
  user.dcloud_appid = [appId]

  if (user.username) {
    user.username = user.username.toLowerCase()
  }
  if (user.email) {
    user.email = user.email.toLowerCase()
  }

  // 移除邀请码相关逻辑

  const {
    userRegisterDefaultRole 
  } = this.config

  if (userRegisterDefaultRole && userRegisterDefaultRole.length) {
    // 将用户已有的角色和配置的默认角色合并成一个数组，并去重
    user.role = Array.from(new Set([...(user.role || []), ...userRegisterDefaultRole]))
  }

  const beforeRegister = this.hooks.beforeRegister
  let userRecord = user
  if (beforeRegister) {
    userRecord = await beforeRegister({
      userRecord,
      clientInfo: this.getUniversalClientInfo()
    })
  }

  const {
    id: uid
  } = await userCollection.add(userRecord)

  const createTokenRes = await this.uniIdCommon.createToken({
    uid
  })

  const {
    errCode,
    token,
    tokenExpired
  } = createTokenRes

  if (errCode) {
    throw createTokenRes
  }

  // 移除 uniIdLog 调用

  const thirdPartyResult = isThirdParty 
    ? await thirdPartyRegister({
        user: {
          ...userRecord,
          _id: uid
        }
      }) 
    : {}

  return {
    errCode: 0,
    uid,
    newToken: {
      token,
      tokenExpired
    },
    ...thirdPartyResult,
    passwordConfirmed: !!userRecord.password
  }
}

module.exports = {
  preRegister,
  postRegister
}