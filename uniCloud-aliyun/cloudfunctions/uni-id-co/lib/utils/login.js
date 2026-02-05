const {
  findUser
} = require('./account')
const {
  userCollection
} = require('../../common/constants')
const {
  ERROR
} = require('../../common/error')

async function realPreLogin (params = {}) {
  const {
    user
  } = params
  const appId = this.getUniversalClientInfo().appId
  const {
    total,
    userMatched
  } = await findUser({
    userQuery: user,
    authorizedApp: appId
  })
  if (userMatched.length === 0) {
    if (total > 0) {
      throw {
        errCode: ERROR.ACCOUNT_NOT_EXISTS_IN_CURRENT_APP
      }
    }
    throw {
      errCode: ERROR.ACCOUNT_NOT_EXISTS
    }
  } else if (userMatched.length > 1) {
    throw {
      errCode: ERROR.ACCOUNT_CONFLICT
    }
  }
  const userRecord = userMatched[0]
  checkLoginUserRecord(userRecord)
  return userRecord
}

async function preLogin (params = {}) {
  const {
    user
  } = params
  // 简化错误处理，直接调用
  const userRecord = await realPreLogin.call(this, params)
  return userRecord
}

function checkLoginUserRecord (user) {
  switch (user.status) {
    case undefined:
    case 0:
      break
    case 1:
      throw {
        errCode: ERROR.ACCOUNT_BANNED
      }
    case 2:
      throw {
        errCode: ERROR.ACCOUNT_AUDITING
      }
    case 3:
      throw {
        errCode: ERROR.ACCOUNT_AUDIT_FAILED
      }
    case 4:
      throw {
        errCode: ERROR.ACCOUNT_CLOSED
      }
    default:
      break
  }
}

async function thirdPartyLogin (params = {}) {
  const {
    user
  } = params
  return {
    mobileConfirmed: !!user.mobile_confirmed,
    emailConfirmed: !!user.email_confirmed
  }
}

async function postLogin (params = {}) {
  const {
    user,
    extraData,
    isThirdParty = false
  } = params
  const {
    clientIP
  } = this.getUniversalClientInfo()
  
  const uid = user._id
  const updateData = {
    last_login_date: Date.now(),
    last_login_ip: clientIP,
    ...extraData
  }
  
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

  // 移除旧的 logout 逻辑，因为我们删除了 logout 模块
  // 移除 uniIdLog 日志记录

  await userCollection.doc(uid).update(updateData)
  
  const thirdPartyResult = isThirdParty 
    ? await thirdPartyLogin({ user }) 
    : {}

  return {
    errCode: 0,
    newToken: {
      token,
      tokenExpired
    },
    uid,
    userInfo: user, // 补充返回用户信息
    ...thirdPartyResult,
    passwordConfirmed: !!user.password
  }
}

module.exports = {
  preLogin,
  postLogin,
  checkLoginUserRecord
}