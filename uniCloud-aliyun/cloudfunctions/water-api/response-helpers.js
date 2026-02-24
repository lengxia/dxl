/**
 * 统一错误响应格式（不暴露内部错误信息）
 */
function errorResponse(errCode, errMsg) {
  return { errCode, errMsg };
}

/**
 * 统一成功响应格式
 */
function successResponse(data = null, errMsg = 'success') {
  return { errCode: 0, errMsg, data };
}

/**
 * 成功响应（带用户数据）
 */
function successResponseWithProfile(data, userProfile, errMsg = 'success') {
  return { 
    errCode: 0, 
    errMsg, 
    data,
    userProfile  // 新增：返回最新用户数据
  };
}

module.exports = {
  errorResponse,
  successResponse,
  successResponseWithProfile
};