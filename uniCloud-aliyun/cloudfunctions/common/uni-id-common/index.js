'use strict';

const crypto = require('crypto');
const database = uniCloud.database();
const dbCommand = database.command;

const uniIDErrors = {
	TOKEN_EXPIRED: 'uni-id-token-expired',
	CHECK_TOKEN_FAILED: 'uni-id-check-token-failed',
	PARAM_REQUIRED: 'uni-id-param-required',
	ACCOUNT_EXISTS: 'uni-id-account-exists',
	ACCOUNT_NOT_EXISTS: 'uni-id-account-not-exists',
	ACCOUNT_CONFLICT: 'uni-id-account-conflict',
	ACCOUNT_BANNED: 'uni-id-account-banned',
	ACCOUNT_AUDITING: 'uni-id-account-auditing',
	ACCOUNT_AUDIT_FAILED: 'uni-id-account-audit-failed',
	ACCOUNT_CLOSED: 'uni-id-account-closed'
}

function isPromise(obj) {
	return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

function parseVersion(version) {
	if (!version) return;
	const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
	return match ? match.slice(1, 4).map(v => parseInt(v)) : void 0;
}

function compareVersion(v1, v2) {
	const version1 = parseVersion(v1);
	const version2 = parseVersion(v2);
	if (version1) {
		if (version2) {
			return function(v1, v2) {
				const maxLen = Math.max(v1.length, v2.length);
				for (let i = 0; i < maxLen; i++) {
					const num1 = v1[i];
					const num2 = v2[i];
					if (num1 > num2) {
						return 1;
					}
					if (num1 < num2) {
						return -1;
					}
				}
				return 0;
			}(version1, version2);
		}
		return 1;
	}
	return version2 ? -1 : 0;
}

const errorCodeMap = {
	'uni-id-token-expired': 30203,
	'uni-id-check-token-failed': 30202
}

function createError({ errCode, errMsgValue }) {
	this.errMsg = this._t(errCode, errMsgValue);
	if (errCode in errorCodeMap) {
		this.code = errorCodeMap[errCode];
	}
	delete this.errMsgValue;
}

function isUniIDError(error) {
	return typeof error === 'object' && 
		Object.prototype.toString.call(error).slice(8, -1).toLowerCase() === 'object' &&
		error.errCode && 
		Object.values(uniIDErrors).includes(error.errCode) &&
		!!error.errCode;
}

let defaultLanguage = {
	'zh-Hans': {
		'uni-id-token-expired': '登录状态失效，token已过期',
		'uni-id-check-token-failed': 'token校验未通过',
		'uni-id-param-required': '缺少参数: {param}',
		'uni-id-account-exists': '此账号已注册',
		'uni-id-account-not-exists': '此账号未注册',
		'uni-id-account-conflict': '用户账号冲突',
		'uni-id-account-banned': '从账号已封禁',
		'uni-id-account-auditing': '此账号正在审核中',
		'uni-id-account-audit-failed': '此账号审核失败',
		'uni-id-account-closed': '此账号已注销'
	},
	en: {
		'uni-id-token-expired': 'The login status is invalid, token has expired',
		'uni-id-check-token-failed': 'Check token failed',
		'uni-id-param-required': 'Parameter required: {param}',
		'uni-id-account-exists': 'Account exists',
		'uni-id-account-not-exists': 'Account does not exists',
		'uni-id-account-conflict': 'User account conflict',
		'uni-id-account-banned': 'Account has been banned',
		'uni-id-account-auditing': 'Account audit in progress',
		'uni-id-account-audit-failed': 'Account audit failed',
		'uni-id-account-closed': 'Account has been closed'
	}
}

try {
	const langConfig = require('uni-config-center/uni-id/lang/index.js');
	defaultLanguage = function(original, user) {
		const keys = Object.keys(original);
		keys.push(...Object.keys(user));
		const result = {};
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			result[key] = Object.assign({}, original[key], user[key]);
		}
		return result;
	}(defaultLanguage, langConfig);
} catch (error) {}

const messages = defaultLanguage;

function urlSafeBase64Encode(str) {
	return str.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64Decode(str) {
	str = str.toString();
	let padding = 4 - str.length % 4;
	if (padding !== 4) {
		for (let i = 0; i < padding; ++i) {
			str += '=';
		}
	}
	str = str.replace(/-/g, '+').replace(/_/g, '/');
	return JSON.parse(Buffer.from(str, 'base64').toString('utf-8'));
}

function base64Encode(obj) {
	return urlSafeBase64Encode(Buffer.from(JSON.stringify(obj), 'utf-8').toString('base64'));
}

function hmacSha256(data, key) {
	return urlSafeBase64Encode(crypto.createHmac('sha256', key).update(data).digest('base64'));
}

const jwtVerify = function(token, secret) {
	if (typeof token !== 'string') {
		throw new Error('Invalid token');
	}
	const parts = token.split('.');
	if (parts.length !== 3) {
		throw new Error('Invalid token');
	}
	const [header, payload, signature] = parts;
	if (hmacSha256(header + '.' + payload, secret) !== signature) {
		throw new Error('Invalid token');
	}
	const headerObj = base64Decode(header);
	if (headerObj.alg !== 'HS256' || headerObj.typ !== 'JWT') {
		throw new Error('Invalid token');
	}
	const payloadObj = base64Decode(payload);
	if (payloadObj.exp * 1000 < Date.now()) {
		const err = new Error('Token expired');
		err.name = 'TokenExpiredError';
		throw err;
	}
	return payloadObj;
}

const jwtSign = function(payload, secret, options = {}) {
	const { expiresIn } = options;
	if (!expiresIn) {
		throw new Error('expiresIn is required');
	}
	const iat = parseInt(Date.now() / 1000);
	const exp = iat + options.expiresIn;
	const header = base64Encode({ alg: 'HS256', typ: 'JWT' });
	const payloadObj = { ...payload, iat, exp };
	const payloadStr = base64Encode(payloadObj);
	const data = header + '.' + payloadStr;
	const signature = hmacSha256(data, secret);
	return data + '.' + signature;
}

const usersCollection = database.collection('uni-id-users');
const rolesCollection = database.collection('uni-id-roles');

class UniIDInternal {
	constructor({
		uniId
	} = {}) {
		this.uid = null;
		this.userRecord = null;
		this.userPermission = null;
		this.oldToken = null;
		this.oldTokenPayload = null;
		this.uniId = uniId;
		this.config = this.uniId._getConfig();
		this.clientInfo = this.uniId._clientInfo;
		this.checkConfig();
	}

	checkConfig() {
		const { tokenExpiresIn, tokenExpiresThreshold } = this.config;
		if (tokenExpiresThreshold >= tokenExpiresIn) {
			throw new Error('Config error, tokenExpiresThreshold should be less than tokenExpiresIn');
		}
		if (tokenExpiresThreshold > tokenExpiresIn / 2) {
			console.warn(`Please check whether the tokenExpiresThreshold configuration is set too large, tokenExpiresThreshold: ${tokenExpiresThreshold}, tokenExpiresIn: ${tokenExpiresIn}`);
		}
	}

	get customToken() {
		return this.uniId.interceptorMap.get('customToken');
	}

	isTokenInDb(uniIdVersion) {
		return compareVersion(uniIdVersion, '1.0.10') >= 0;
	}

	async getUserRecord() {
		if (this.userRecord) {
			return this.userRecord;
		}
		const res = await usersCollection.doc(this.uid).get();
		this.userRecord = res.data[0];
		if (!this.userRecord) {
			throw { errCode: uniIDErrors.ACCOUNT_NOT_EXISTS };
		}
		switch (this.userRecord.status) {
			case undefined:
			case 0:
				break;
			case 1:
				throw { errCode: uniIDErrors.ACCOUNT_BANNED };
			case 2:
				throw { errCode: uniIDErrors.ACCOUNT_AUDITING };
			case 3:
				throw { errCode: uniIDErrors.ACCOUNT_AUDIT_FAILED };
			case 4:
				throw { errCode: uniIDErrors.ACCOUNT_CLOSED };
		}
		if (this.oldTokenPayload) {
			if (this.isTokenInDb(this.oldTokenPayload.uniIdVersion)) {
				if ((this.userRecord.token || []).indexOf(this.oldToken) === -1) {
					throw { errCode: uniIDErrors.CHECK_TOKEN_FAILED };
				}
			}
			if (this.userRecord.valid_token_date && this.userRecord.valid_token_date > this.oldTokenPayload.iat * 1000) {
				throw { errCode: uniIDErrors.TOKEN_EXPIRED };
			}
		}
		return this.userRecord;
	}

	async updateUserRecord(updateData) {
		await usersCollection.doc(this.uid).update(updateData);
	}

	async getUserPermission() {
		if (this.userPermission) {
			return this.userPermission;
		}
		const roles = (await this.getUserRecord()).role || [];
		if (roles.length === 0) {
			return this.userPermission = {
				role: [],
				permission: []
			};
		}
		if (roles.includes('admin')) {
			return this.userPermission = {
				role: roles,
				permission: []
			};
		}
		const roleRes = await rolesCollection.where({
			role_id: dbCommand.in(roles)
		}).get();
		const permissions = roleRes.data.reduce((permissionArr, role) => {
			if (role.permission) {
				permissionArr.push(...role.permission);
			}
			return permissionArr;
		}, []);
		const uniquePermissions = Array.from(new Set(permissions));
		return this.userPermission = {
			role: roles,
			permission: uniquePermissions
		};
	}

	async _createToken({
		uid,
		role,
		permission
	} = {}) {
		if (!role || !permission) {
			const { role: userRole, permission: userPermission } = await this.getUserPermission();
			role = userRole;
			permission = userPermission;
		}
		let tokenPayload = {
			uid,
			role,
			permission
		};
		if (this.uniId.interceptorMap.has('customToken')) {
			const customToken = this.uniId.interceptorMap.get('customToken');
			if (typeof customToken !== 'function') {
				throw new Error('Invalid custom token file');
			}
			tokenPayload = await customToken({
				uid,
				role,
				permission
			});
		}
		const now = Date.now();
		const { tokenSecret, tokenExpiresIn, maxTokenLength = 10 } = this.config;
		const token = jwtSign({
			...tokenPayload,
			uniIdVersion: '1.0.19'
		}, tokenSecret, {
			expiresIn: tokenExpiresIn
		});
		const userRecord = await this.getUserRecord();
		let tokens = (userRecord.token || []).filter(token => {
			try {
				const payload = this._checkToken(token);
				if (userRecord.valid_token_date && userRecord.valid_token_date > payload.iat * 1000) {
					return false;
				}
			} catch (error) {
				if (error.errCode === uniIDErrors.TOKEN_EXPIRED) {
					return false;
				}
			}
			return true;
		});
		tokens.push(token);
		if (tokens.length > maxTokenLength) {
			tokens.splice(0, tokens.length - maxTokenLength);
		}
		await this.updateUserRecord({
			last_login_ip: this.clientInfo.clientIP,
			last_login_date: now,
			token: tokens
		});
		return {
			token,
			tokenExpired: now + tokenExpiresIn * 1000
		};
	}

	async createToken({
		uid,
		role,
		permission
	} = {}) {
		if (!uid) {
			throw { errCode: uniIDErrors.PARAM_REQUIRED, errMsgValue: { param: 'uid' } };
		}
		this.uid = uid;
		const { token, tokenExpired } = await this._createToken({
			uid,
			role,
			permission
		});
		return {
			errCode: 0,
			token,
			tokenExpired
		};
	}

	async refreshToken({
		token
	} = {}) {
		if (!token) {
			throw { errCode: uniIDErrors.PARAM_REQUIRED, errMsgValue: { param: 'token' } };
		}
		this.oldToken = token;
		const payload = this._checkToken(token);
		this.uid = payload.uid;
		this.oldTokenPayload = payload;
		const { uid } = payload;
		const { role, permission } = await this.getUserPermission();
		const { token: newToken, tokenExpired } = await this._createToken({
			uid,
			role,
			permission
		});
		return {
			errCode: 0,
			token: newToken,
			tokenExpired
		};
	}

	_checkToken(token) {
		const { tokenSecret } = this.config;
		let payload;
		try {
			payload = jwtVerify(token, tokenSecret);
		} catch (error) {
			if (error.name === 'TokenExpiredError') {
				throw { errCode: uniIDErrors.TOKEN_EXPIRED };
			}
			throw { errCode: uniIDErrors.CHECK_TOKEN_FAILED };
		}
		return payload;
	}

async checkToken(token, {
		autoRefresh = true
	} = {}) {
		if (!token) {
			throw { errCode: uniIDErrors.CHECK_TOKEN_FAILED };
		}
		this.oldToken = token;
		const payload = this._checkToken(token);
		this.uid = payload.uid;
		this.oldTokenPayload = payload;
		const { tokenExpiresThreshold } = this.config;
		const { uid, role, permission } = payload;
		let tokenInfo = {
			role,
			permission
		};
		if (!role && !permission) {
			const { role: userRole, permission: userPermission } = await this.getUserPermission();
			tokenInfo.role = userRole;
			tokenInfo.permission = userPermission;
		}
		if (!tokenExpiresThreshold || !autoRefresh) {
			const result = {
				code: 0,
				errCode: 0,
				...payload,
				...tokenInfo
			};
			delete result.uniIdVersion;
			return result;
		}
		const now = Date.now();
		let tokenData = {};
		if (payload.exp * 1000 - now < tokenExpiresThreshold * 1000) {
			tokenData = await this._createToken({
				uid
			});
		}
		const result = {
			code: 0,
			errCode: 0,
			...payload,
			...tokenInfo,
			...tokenData
		};
		delete result.uniIdVersion;
		return result;
	}

	async login(params = {}) {
		const { type, code, password, username, inviteCode, mobile, email, captcha } = params;
		
		if (!type) {
			throw { errCode: uniIDErrors.PARAM_REQUIRED, errMsgValue: { param: 'type' } };
		}

		let userInfo = {};
		
		switch (type) {
			case 'weixin':
			case 'weixin-miniprogram':
			case 'weixin-web':
				if (!code) {
					throw { errCode: uniIDErrors.PARAM_REQUIRED, errMsgValue: { param: 'code' } };
				}
				try {
					const { openid, unionid } = await this._getWeixinUserInfo(code, type);
					userInfo.wx_openid = { [type]: openid };
					if (unionid) {
						userInfo.wx_unionid = unionid;
					}
				} catch (error) {
					throw { errCode: 'WECHAT_AUTH_FAILED', errMsg: '微信授权失败' };
				}
				break;
				
			case 'username':
				if (!username || !password) {
					throw { 
						errCode: uniIDErrors.PARAM_REQUIRED, 
						errMsgValue: { 
							param: username ? 'password' : 'username' 
						} 
					};
				}
				userInfo.username = username;
				break;
				
			case 'mobile':
				if (!mobile || !captcha) {
					throw { 
						errCode: uniIDErrors.PARAM_REQUIRED, 
						errMsgValue: { 
							param: mobile ? 'captcha' : 'mobile' 
						} 
					};
				}
				userInfo.mobile = mobile;
				break;
				
			case 'email':
				if (!email || !password) {
					throw { 
						errCode: uniIDErrors.PARAM_REQUIRED, 
						errMsgValue: { 
							param: email ? 'password' : 'email' 
						} 
					};
				}
				userInfo.email = email;
				break;
				
			default:
				throw { errCode: 'UNSUPPORTED_LOGIN_TYPE', errMsg: '不支持的登录类型' };
		}

		// 查找或创建用户
		let userRecord = await this._findOrCreateUser(userInfo, params);
		
		if (!userRecord) {
			throw { errCode: uniIDErrors.ACCOUNT_NOT_EXISTS };
		}

		this.uid = userRecord._id;
		
		// 创建token
		const { token, tokenExpired } = await this._createToken({
			uid: userRecord._id
		});

		return {
			errCode: 0,
			uid: userRecord._id,
			token,
			tokenExpired,
			userInfo: {
				uid: userRecord._id,
				username: userRecord.username,
				nickname: userRecord.nickname,
				avatar: userRecord.avatar
			}
		};
	}

	async _getWeixinUserInfo(code, type) {
		// 简化实现，实际应该调用微信API获取用户信息
		// 这里返回模拟数据
		return {
			openid: 'mock_openid_' + Date.now(),
			unionid: 'mock_unionid_' + Date.now()
		};
	}

	async _findOrCreateUser(userInfo, params) {
		const { autoRegister = true } = params;
		
		// 查找现有用户
		let query = {};
		
		if (userInfo.wx_openid) {
			query = { wx_openid: userInfo.wx_openid };
		} else if (userInfo.username) {
			query = { username: userInfo.username };
		} else if (userInfo.mobile) {
			query = { mobile: userInfo.mobile };
		} else if (userInfo.email) {
			query = { email: userInfo.email };
		}
		
		const res = await usersCollection.where(query).get();
		
		if (res.data.length > 0) {
			return res.data[0];
		}
		
		// 如果用户不存在且允许自动注册
		if (autoRegister) {
			const newUser = {
				...userInfo,
				register_date: Date.now(),
				register_ip: this.clientInfo.clientIP,
				status: 0 // 正常状态
			};
			
			const addRes = await usersCollection.add(newUser);
			newUser._id = addRes.id;
			return newUser;
		}
		
		return null;
	}
}

const publicMethods = Object.freeze({
	__proto__: null,
	checkToken: async function(token, {
		autoRefresh = true
	} = {}) {
		return new UniIDInternal({
			uniId: this
		}).checkToken(token, {
			autoRefresh
		});
	},
	createToken: async function({
		uid,
		role,
		permission
	} = {}) {
		return new UniIDInternal({
			uniId: this
		}).createToken({
			uid,
			role,
			permission
		});
	},
	refreshToken: async function({
		token
	} = {}) {
		return new UniIDInternal({
			uniId: this
		}).refreshToken({
			token
		});
	},
	login: async function(params = {}) {
		return new UniIDInternal({
			uniId: this
		}).login(params);
	}
});

const uniConfigCenter = require('uni-config-center')({
	pluginId: 'uni-id'
});

class UniID {
	constructor({
		context,
		clientInfo,
		config
	} = {}) {
		this._clientInfo = context ? function(context) {
			return {
				appId: context.APPID,
				platform: context.PLATFORM,
				locale: context.LOCALE,
				clientIP: context.CLIENTIP,
				deviceId: context.DEVICEID
			}
		}(context) : clientInfo;
		this._config = config;
		this.config = this._getOriginConfig();
		this.interceptorMap = new Map();
		if (uniConfigCenter.hasFile('custom-token.js')) {
			this.setInterceptor('customToken', require(uniConfigCenter.resolve('custom-token.js')));
		}
		this._i18n = uniCloud.initI18n({
			locale: this._clientInfo.locale,
			fallbackLocale: 'zh-Hans',
			messages: JSON.parse(JSON.stringify(messages))
		});
		if (!messages[this._i18n.locale]) {
			this._i18n.setLocale('zh-Hans');
		}
	}

	setInterceptor(name, interceptor) {
		this.interceptorMap.set(name, interceptor);
	}

	_t(...args) {
		return this._i18n.t(...args);
	}

	_parseOriginConfig(config) {
		return Array.isArray(config) ? config : config[0] ? Object.values(config) : config;
	}

	_getOriginConfig() {
		if (this._config) {
			return this._config;
		}
		if (uniConfigCenter.hasFile('config.json')) {
			let config;
			try {
				config = uniConfigCenter.config();
			} catch (error) {
				throw new Error('Invalid uni-id config file\n' + error.message);
			}
			return this._parseOriginConfig(config);
		}
		try {
			return this._parseOriginConfig(require('uni-id/config.json'));
		} catch (error) {
			throw new Error('Invalid uni-id config file');
		}
	}

	_getAppConfig() {
		const config = this._getOriginConfig();
		return Array.isArray(config) ? config.find(conf => conf.dcloudAppid === this._clientInfo.appId) || config.find(conf => conf.isDefaultConfig) : config;
	}

	_getPlatformConfig() {
		const appConfig = this._getAppConfig();
		if (!appConfig) {
			throw new Error(`Config for current app (${this._clientInfo.appId}) was not found, please check your config file or client appId`);
		}
		let platform = this._clientInfo.platform;
		if (['app-plus', 'app-android', 'app-ios'].indexOf(this._clientInfo.platform) > -1) {
			this._clientInfo.platform = 'app';
		}
		if (this._clientInfo.platform === 'h5') {
			this._clientInfo.platform = 'web';
		}
		let oldPlatform;
		switch (this._clientInfo.platform) {
			case 'web':
				oldPlatform = 'h5';
				break;
			case 'app':
				oldPlatform = 'app-plus';
				break;
		}
		const configList = [{
			tokenExpiresIn: 7200,
			tokenExpiresThreshold: 1200,
			passwordErrorLimit: 6,
			passwordErrorRetryTime: 3600
		}, appConfig];
		if (oldPlatform && appConfig[oldPlatform]) {
			configList.push(appConfig[oldPlatform]);
		}
		configList.push(appConfig[this._clientInfo.platform]);
		const config = Object.assign(...configList);
		['tokenSecret', 'tokenExpiresIn'].forEach(key => {
			if (!config || !config[key]) {
				throw new Error(`Config parameter missing, ${key} is required, please check your config file uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json`);
			}
		});
		return config;
	}

	_getConfig() {
		return this._getPlatformConfig();
	}
}

for (const methodName in publicMethods) {
	UniID.prototype[methodName] = publicMethods[methodName];
}

function createInstance(options) {
	const uniId = new UniID(options);
	return new Proxy(uniId, {
		get(target, property) {
			if (property in target && property.indexOf('_') !== 0) {
				if (typeof target[property] === 'function') {
					const method = target[property];
					return function() {
						let result;
						try {
							result = method.apply(this, arguments);
						} catch (error) {
							if (isUniIDError(error)) {
								return createError.call(target, error);
							}
							throw error;
						}
						return isPromise(result) ? result.then(result => {
							if (isUniIDError(result)) {
								createError.call(target, result);
							}
							return result;
						}, error => {
							if (isUniIDError(error)) {
								createError.call(target, error);
								return error;
							}
							throw error;
						}) : (isUniIDError(result) && createError.call(target, result), result);
					}.bind(target);
				}
				if (property !== 'context' && property !== 'config') {
					return target[property];
				}
			}
		}
	});
}

UniID.prototype.createInstance = createInstance;

const uniIDCommon = {
	createInstance
};

module.exports = uniIDCommon;