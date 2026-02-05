const crypto = require('crypto')
const {
  userCollection
} = require('../../common/constants')
const {
  ERROR
} = require('../../common/error')
const {
  getRedisEnable
} = require('./utils')
const {
  openDataCollection
} = require('../../common/constants')

function decryptWeixinData ({
  encryptedData,
  sessionKey,
  iv
} = {}) {
  const oauthConfig = this.configUtils.getOauthConfig({
    provider: 'weixin'
  })
  const decipher = crypto.createDecipheriv(
    'aes-128-cbc',
    Buffer.from(sessionKey, 'base64'),
    Buffer.from(iv, 'base64')
  )
  // 设置自动 padding 为 true，删除填充补位
  decipher.setAutoPadding(true)
  let decoded
  decoded = decipher.update(encryptedData, 'base64', 'utf8')
  decoded += decipher.final('utf8')
  decoded = JSON.parse(decoded)
  if (decoded.watermark.appid !== oauthConfig.appid) {
    throw new Error('Invalid wechat appid in decode content')
  }
  return decoded
}

function getWeixinPlatform () {
  const platform = this.clientPlatform
  const userAgent = this.getUniversalClientInfo().userAgent
  switch (platform) {
    case 'app':
    case 'app-plus':
    case 'app-android':
    case 'app-ios':
      return 'app'
    case 'mp-weixin':
      return 'mp'
    case 'h5':
    case 'web':
      return userAgent.indexOf('MicroMessenger') > -1 ? 'h5' : 'web'
    default:
      throw new Error('Unsupported weixin platform')
  }
}

async function saveWeixinUserKey () {
  // 简化版：不再调用 uniOpenBridge 存储 sessionKey，避免依赖错误
  // 原逻辑是用于跨应用/跨端的统一用户状态管理，单小程序场景下可省略
  return
}

async function saveSecureNetworkCache ({
  code,
  openid,
  unionid,
  sessionKey
}) {
  const {
    appId
  } = this.getUniversalClientInfo()
  const key = `uni-id:${appId}:weixin-mp:code:${code}:secure-network-cache`
  const value = JSON.stringify({
    openid,
    unionid,
    session_key: sessionKey
  })
  // 此处存储的是code的缓存，设置有效期和token一致
  const expiredSeconds = this.config.tokenExpiresIn || 3 * 24 * 60 * 60

  await openDataCollection.doc(key).set({
    value,
    expired: Date.now() + expiredSeconds * 1000
  })
  const isRedisEnable = getRedisEnable()
  if (isRedisEnable) {
    const redis = uniCloud.redis()
    await redis.set(key, value, 'EX', expiredSeconds)
  }
}

function generateWeixinCache ({
  sessionKey, // 微信小程序用户sessionKey
  accessToken, // App端微信用户accessToken
  refreshToken, // App端微信用户refreshToken
  accessTokenExpired // App端微信用户accessToken过期时间
} = {}) {
  const platform = getWeixinPlatform.call(this)
  let cache
  switch (platform) {
    case 'app':
    case 'h5':
    case 'web':
      cache = {
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expired: accessTokenExpired
      }
      break
    case 'mp':
      cache = {
        session_key: sessionKey
      }
      break
    default:
      throw new Error('Unsupported weixin platform')
  }
  return {
    third_party: {
      [`${platform}_weixin`]: cache
    }
  }
}

function getWeixinOpenid ({
  userRecord
} = {}) {
  const weixinPlatform = getWeixinPlatform.call(this)
  const appId = this.getUniversalClientInfo().appId
  const wxOpenidObj = userRecord.wx_openid
  if (!wxOpenidObj) {
    return
  }
  return wxOpenidObj[`${weixinPlatform}_${appId}`] || wxOpenidObj[weixinPlatform]
}

async function getWeixinCacheFallback ({
  userRecord,
  key
} = {}) {
  const platform = getWeixinPlatform.call(this)
  const thirdParty = userRecord && userRecord.third_party
  if (!thirdParty) {
    return
  }
  const weixinCache = thirdParty[`${platform}_weixin`]
  return weixinCache && weixinCache[key]
}

async function getWeixinCache ({
  userRecord,
  key
} = {}) {
  // 简化版：直接从 userRecord 获取，不走 uniOpenBridge
  return getWeixinCacheFallback.call(this, {
    userRecord,
    key
  })
}

async function getWeixinAccessToken () {
  // 简化版：暂时返回空，因为没有 uniOpenBridge 获取不到
  // 如果业务强依赖此 token，需要恢复 uniOpenBridge 依赖
  return ''
}
module.exports = {
  decryptWeixinData,
  getWeixinPlatform,
  generateWeixinCache,
  getWeixinCache,
  saveWeixinUserKey,
  getWeixinAccessToken,
  saveSecureNetworkCache
}
