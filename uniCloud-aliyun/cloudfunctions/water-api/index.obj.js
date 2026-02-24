const db = uniCloud.database();
const dbCmd = db.command;
const { errorResponse, successResponse, successResponseWithProfile } = require('./response-helpers');

// Token 缓存（使用云函数实例级缓存，避免频繁验证）
const tokenCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 缓存 5 分钟

// 定期清理过期 Token 缓存（每10分钟）
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  tokenCache.forEach((value, key) => {
    if (now - value.timestamp >= CACHE_DURATION) {
      tokenCache.delete(key);
      cleanedCount++;
    }
  });
  if (cleanedCount > 0) {
    console.log(`[TokenCache] 清理了 ${cleanedCount} 个过期缓存`);
  }
}, 10 * 60 * 1000);

// ==================== 工具函数 ====================

/**
 * HTML 转义（防止 XSS 攻击）
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 验证必需参数
 */
function validateRequiredParams(params, requiredFields) {
  for (const field of requiredFields) {
    if (!params[field]) {
      return errorResponse(400, `参数${field}不能为空`);
    }
  }
  return null;
}

/**
 * 验证记录所有权
 */
async function verifyRecordOwnership(collection, id, currentUid) {
  const record = await db.collection(collection).doc(id).get();
  
  if (!record.data || record.data.length === 0) {
    return { error: errorResponse(404, '记录不存在'), data: null };
  }
  
  const recordUserId = record.data[0].user_id || record.data[0].uid;
  if (recordUserId !== currentUid) {
    return { error: errorResponse(403, '无权操作'), data: null };
  }
  
  return { error: null, data: record.data[0] };
}

/**
 * 更新用户功德分（统一处理）
 */
async function updateUserMerit(userId, meritChange) {
  if (!userId || meritChange === 0) return;
  
  try {
    const userRes = await db.collection('uni-id-users').doc(userId).get();
    if (!userRes.data || userRes.data.length === 0) return;
    
    const currentProfile = userRes.data[0].dao_profile || {};
    const newTotalMerit = Math.max(0, (currentProfile.total_merit || 0) + meritChange);
    
    await db.collection('uni-id-users').doc(userId).update({
      'dao_profile.total_merit': newTotalMerit,
      'dao_profile.level': Math.floor(newTotalMerit / 1000) + 1
    });
  } catch (e) {
    console.error('更新用户功德失败:', e);
  }
}

/**
 * 获取最新的用户 dao_profile（写操作后返回）
 */
async function getLatestUserProfile(userId) {
  if (!userId) return null;
  
  try {
    const userRes = await db.collection('uni-id-users').doc(userId).get();
    if (userRes.data && userRes.data.length > 0) {
      return userRes.data[0].dao_profile || null;
    }
  } catch (e) {
    console.error('获取用户数据失败:', e);
  }
  return null;
}

// ==================== 主模块 ====================

module.exports = {
  _before: async function () {
    const clientInfo = this.getClientInfo();
    
    if (!clientInfo.uniIdToken) {
      return errorResponse(401, '未登录，请先登录');
    }
    
    const token = clientInfo.uniIdToken;
    const now = Date.now();
    
    // 检查缓存
    const cached = tokenCache.get(token);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      this.uniIdToken = cached.data;
      return;
    }
    
    // 验证 token
    const uniIdCommon = require('uni-id-common');
    const uniID = uniIdCommon.createInstance({ context: this });
    const verifyResult = await uniID.checkToken(token);
    
    if (verifyResult.errCode !== 0) {
      tokenCache.delete(token);
      return errorResponse(401, '登录已过期，请重新登录');
    }
    
    // 缓存验证结果
    tokenCache.set(token, { data: verifyResult, timestamp: now });
    
    // 定期清理过期缓存
    if (tokenCache.size > 1000) {
      Array.from(tokenCache.entries()).forEach(([key, value]) => {
        if (now - value.timestamp >= CACHE_DURATION) {
          tokenCache.delete(key);
        }
      });
    }
    
    this.uniIdToken = verifyResult;
  },

  // ==================== 悟道札记 ====================

  async getNoteDetail(params) {
    const validationError = validateRequiredParams(params, ['id']);
    if (validationError) return validationError;
    
    try {
      const res = await db.collection('dao_notes').doc(params.id).get();
      if (!res.data || res.data.length === 0) {
        return errorResponse(404, '记录不存在');
      }
      
      const note = res.data[0];
      const uid = this.uniIdToken.uid;
      const noteUserId = note.user_id || note.uid;
      
      if (note.is_private && noteUserId !== uid) {
        return errorResponse(403, '无权访问');
      }
      
      return successResponse(note);
    } catch (e) {
      return errorResponse(500, '查询失败，请稍后重试');
    }
  },

  async getNotes(params) {
    const validationError = validateRequiredParams(params, ['uid']);
    if (validationError) return validationError;
    
    // 权限验证：只能查看自己的札记
    if (params.uid !== this.uniIdToken.uid) {
      return errorResponse(403, '无权访问');
    }
    
    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const skip = (page - 1) * pageSize;
      
      // 获取分页数据（多查询1条用于判断是否还有下一页）
      const res = await db.collection('dao_notes')
        .where({ user_id: params.uid })
        .orderBy('create_time', 'desc')
        .skip(skip)
        .limit(pageSize + 1)
        .get();
      
      // 判断是否还有更多数据
      const hasMore = res.data.length > pageSize;
      
      // 如果有更多数据，去掉多查询的那一条
      const data = hasMore ? res.data.slice(0, pageSize) : res.data;
      
      return successResponse({
        data: data,
        hasMore: hasMore
      });
    } catch (e) {
      return errorResponse(500, '查询失败，请稍后重试');
    }
  },

  async addNote(params) {
    const { title, content, mood, tags, images, is_private } = params;
    const uid = this.uniIdToken.uid;
    
    const validationError = validateRequiredParams({ title, content }, ['title', 'content']);
    if (validationError) return validationError;

    try {
      const res = await db.collection('dao_notes').add({
        user_id: uid,
        title: escapeHtml(title),
        content: escapeHtml(content),
        mood,
        tags,
        images,
        is_private,
        create_time: Date.now(),
        update_time: Date.now()
      });
      
      return successResponse(res);
    } catch (e) {
      return errorResponse(500, '创建失败，请稍后重试');
    }
  },

  async updateNote(params) {
    const validationError = validateRequiredParams(params, ['id']);
    if (validationError) return validationError;

    const { error } = await verifyRecordOwnership('dao_notes', params.id, this.uniIdToken.uid);
    if (error) return error;

    try {
      const { id, title, content, mood, tags, images, is_private } = params;
      const updateData = { update_time: Date.now() };
      
      if (title !== undefined) updateData.title = escapeHtml(title);
      if (content !== undefined) updateData.content = escapeHtml(content);
      if (mood !== undefined) updateData.mood = mood;
      if (tags !== undefined) updateData.tags = tags;
      if (images !== undefined) updateData.images = images;
      if (is_private !== undefined) updateData.is_private = is_private;
      
      await db.collection('dao_notes').doc(id).update(updateData);
      return successResponse();
    } catch (e) {
      return errorResponse(500, '更新失败，请稍后重试');
    }
  },

  async deleteNote(params) {
    const validationError = validateRequiredParams(params, ['id']);
    if (validationError) return validationError;

    const { error } = await verifyRecordOwnership('dao_notes', params.id, this.uniIdToken.uid);
    if (error) return error;

    try {
      await db.collection('dao_notes').doc(params.id).remove();
      return successResponse();
    } catch (e) {
      return errorResponse(500, '删除失败，请稍后重试');
    }
  },

  // ==================== 每日打卡 ====================

  async getDailyTask(params) {
    const validationError = validateRequiredParams(params, ['date', 'uid']);
    if (validationError) return validationError;
    
    if (params.uid !== this.uniIdToken.uid) {
      return errorResponse(403, '无权访问');
    }

    try {
      const res = await db.collection('daily_tasks')
        .where({ date: params.date, user_id: params.uid })
        .get();
      
      return successResponse(res.data && res.data.length > 0 ? res.data[0] : null);
    } catch (e) {
      return errorResponse(500, '查询失败，请稍后重试');
    }
  },

  async checkTodayTask(params) {
    const validationError = validateRequiredParams(params, ['date', 'user_id']);
    if (validationError) return validationError;

    // 权限验证：只能查询自己的任务
    if (params.user_id !== this.uniIdToken.uid) {
      return errorResponse(403, '无权查询他人任务');
    }

    try {
      const res = await db.collection('daily_tasks')
        .where({ date: params.date, user_id: params.user_id })
        .count();

      return successResponse({ total: res.total });
    } catch (e) {
      return errorResponse(500, '查询失败，请稍后重试');
    }
  },

  async submitDailyTask(params) {
    const validationError = validateRequiredParams(params, ['date', 'user_id']);
    if (validationError) return validationError;

    // 权限验证：只能为自己提交
    if (params.user_id !== this.uniIdToken.uid) {
      return errorResponse(403, '无权操作');
    }

    try {
      const checkRes = await db.collection('daily_tasks')
        .where({ date: params.date, user_id: params.user_id })
        .get();

      const isNewTask = !checkRes.data || checkRes.data.length === 0;
      let userProfile = null;

      if (isNewTask) {
        await db.collection('daily_tasks').add(params);

        // 更新连续打卡天数，并复用查询结果
        const userRes = await db.collection('uni-id-users').doc(params.user_id).get();
        if (userRes.data && userRes.data.length > 0) {
          userProfile = userRes.data[0].dao_profile || {};
          const newContinuousDays = (userProfile.continuous_days || 0) + 1;
          await db.collection('uni-id-users').doc(params.user_id).update({
            'dao_profile.continuous_days': newContinuousDays
          });
          // 更新本地变量，避免重复查询
          userProfile.continuous_days = newContinuousDays;
        }
      } else {
        const id = checkRes.data[0]._id;
        delete params._id;
        await db.collection('daily_tasks').doc(id).update({
          ...params,
          update_time: Date.now()
        });
      }

      // 如果没有在新建任务中获取用户数据，则查询一次
      if (!userProfile) {
        userProfile = await getLatestUserProfile(params.user_id);
      }
      return successResponseWithProfile(null, userProfile);
    } catch (e) {
      return errorResponse(500, '提交失败，请稍后重试');
    }
  },

  async getMonthlyCheckIns(params) {
    const validationError = validateRequiredParams(params, ['uid', 'yearMonth']);
    if (validationError) return validationError;

    // 权限验证：只能查询自己的打卡记录
    if (params.uid !== this.uniIdToken.uid) {
      return errorResponse(403, '无权查询他人打卡记录');
    }

    try {
      // 构造日期范围（性能优化：使用范围查询替代正则）
      const startDate = `${params.yearMonth}-01`;
      const endDate = `${params.yearMonth}-31`;

      const res = await db.collection('daily_tasks')
        .where({
          user_id: params.uid,
          date: dbCmd.gte(startDate).and(dbCmd.lte(endDate))
        })
        .field({ date: true })
        .get();

      const dates = res.data.map(item => item.date);
      return successResponse(dates);
    } catch (e) {
      return errorResponse(500, '查询失败，请稍后重试');
    }
  },

  async checkDailyTaskStatus(params) {
    const validationError = validateRequiredParams(params, ['uid', 'date']);
    if (validationError) return validationError;

    try {
      const res = await db.collection('daily_tasks')
        .where({ user_id: params.uid, date: params.date })
        .count();
      
      return successResponse({
        hasChecked: res.total > 0,
        date: params.date
      });
    } catch (e) {
      return errorResponse(500, '查询失败，请稍后重试');
    }
  },

  // ==================== 善行日记 ====================

  async getDiaries(params) {
    const validationError = validateRequiredParams(params, ['uid']);
    if (validationError) return validationError;
    
    // 权限验证：只能查看自己的日记
    if (params.uid !== this.uniIdToken.uid) {
      return errorResponse(403, '无权访问');
    }

    try {
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const skip = (page - 1) * pageSize;
      
      // 获取分页数据（多查询1条用于判断是否还有下一页）
      const res = await db.collection('good_deeds')
        .where({ user_id: params.uid })
        .orderBy('date', 'desc')
        .skip(skip)
        .limit(pageSize + 1)
        .get();
      
      // 判断是否还有更多数据
      const hasMore = res.data.length > pageSize;
      
      // 如果有更多数据，去掉多查询的那一条
      const data = hasMore ? res.data.slice(0, pageSize) : res.data;
      
      return successResponse({
        data: data,
        hasMore: hasMore
      });
    } catch (e) {
      return errorResponse(500, '查询失败，请稍后重试');
    }
  },

  async getDiaryDetail(params) {
    const validationError = validateRequiredParams(params, ['id']);
    if (validationError) return validationError;
    
    try {
      const res = await db.collection('good_deeds').doc(params.id).get();
      if (!res.data || res.data.length === 0) {
        return errorResponse(404, '记录不存在');
      }
      
      return successResponse(res.data[0]);
    } catch (e) {
      return errorResponse(500, '查询失败，请稍后重试');
    }
  },

  async addDiary(params) {
    const { date, deed_type, title, merit_points } = params;
    const uid = this.uniIdToken.uid;
    
    const validationError = validateRequiredParams({ title, date }, ['title', 'date']);
    if (validationError) return validationError;
    
    // 验证功德分为非负数
    if (merit_points !== undefined && merit_points < 0) {
      return errorResponse(400, '功德分不能为负数');
    }

    try {
      const res = await db.collection('good_deeds').add({
        user_id: uid,
        date,
        deed_type,
        title: escapeHtml(title),
        content: escapeHtml(params.content),
        intention: escapeHtml(params.intention),
        feeling: escapeHtml(params.feeling),
        merit_points,
        is_public: params.is_public,
        create_time: Date.now(),
        update_time: Date.now()
      });
      
      // 更新用户功德
      await updateUserMerit(uid, merit_points || 0);
      
      // 返回最新用户数据
      const userProfile = await getLatestUserProfile(uid);
      return successResponseWithProfile(res, userProfile);
    } catch (e) {
      return errorResponse(500, '创建失败，请稍后重试');
    }
  },

  async updateDiary(params) {
    const validationError = validateRequiredParams(params, ['id']);
    if (validationError) return validationError;
    
    // 验证功德分为非负数
    if (params.merit_points !== undefined && params.merit_points < 0) {
      return errorResponse(400, '功德分不能为负数');
    }

    try {
      const oldRecord = await db.collection('good_deeds').doc(params.id).get();
      if (!oldRecord.data || oldRecord.data.length === 0) {
        return errorResponse(404, '记录不存在');
      }
      
      const oldDiary = oldRecord.data[0];
      
      // 权限验证
      if (oldDiary.user_id !== this.uniIdToken.uid) {
        return errorResponse(403, '无权操作');
      }
      
      const { id, date, deed_type, title, content, intention, feeling, merit_points, is_public } = params;
      const updateData = { update_time: Date.now() };
      
      if (date !== undefined) updateData.date = date;
      if (deed_type !== undefined) updateData.deed_type = deed_type;
      if (title !== undefined) updateData.title = escapeHtml(title);
      if (content !== undefined) updateData.content = escapeHtml(content);
      if (intention !== undefined) updateData.intention = escapeHtml(intention);
      if (feeling !== undefined) updateData.feeling = escapeHtml(feeling);
      if (merit_points !== undefined) updateData.merit_points = merit_points;
      if (is_public !== undefined) updateData.is_public = is_public;
      
      await db.collection('good_deeds').doc(id).update(updateData);
      
      // 如果功德分变化，更新用户功德
      if (merit_points !== undefined) {
        const meritDiff = merit_points - (oldDiary.merit_points || 0);
        await updateUserMerit(oldDiary.user_id, meritDiff);
      }
      
      // 返回最新用户数据
      const userProfile = await getLatestUserProfile(oldDiary.user_id);
      return successResponseWithProfile(null, userProfile);
    } catch (e) {
      return errorResponse(500, '更新失败，请稍后重试');
    }
  },

  async deleteDiary(params) {
    const validationError = validateRequiredParams(params, ['id']);
    if (validationError) return validationError;

    // 修复安全漏洞：添加所有权校验
    const { error, data: diary } = await verifyRecordOwnership('good_deeds', params.id, this.uniIdToken.uid);
    if (error) return error;

    try {
      await db.collection('good_deeds').doc(params.id).remove();
      
      // 扣减功德
      await updateUserMerit(diary.user_id, -(diary.merit_points || 0));
      
      // 返回最新用户数据
      const userProfile = await getLatestUserProfile(diary.user_id);
      return successResponseWithProfile(null, userProfile);
    } catch (e) {
      return errorResponse(500, '删除失败，请稍后重试');
    }
  },

  // ==================== 月度计划 ====================

  async getMonthlyPlans(params) {
    const validationError = validateRequiredParams(params, ['uid', 'yearMonth']);
    if (validationError) return validationError;

    try {
      const res = await db.collection('monthly_plans')
        .where({ user_id: params.uid, year_month: params.yearMonth })
        .get();
      
      return successResponse(res.data);
    } catch (e) {
      return errorResponse(500, '查询失败，请稍后重试');
    }
  },

  async getMonthlyPlanDetail(params) {
    const validationError = validateRequiredParams(params, ['id']);
    if (validationError) return validationError;
    
    try {
      const res = await db.collection('monthly_plans').doc(params.id).get();
      if (!res.data || res.data.length === 0) {
        return errorResponse(404, '记录不存在');
      }
      
      return successResponse(res.data[0]);
    } catch (e) {
      return errorResponse(500, '查询失败，请稍后重试');
    }
  },

  async addMonthlyPlan(params) {
    const { year_month, title } = params;
    const uid = this.uniIdToken.uid;
    
    const validationError = validateRequiredParams({ year_month, title }, ['year_month', 'title']);
    if (validationError) return validationError;

    try {
      const res = await db.collection('monthly_plans').add({
        user_id: uid,
        year_month,
        title: escapeHtml(title),
        goals: params.goals,
        status: params.status || 'planning',
        create_time: Date.now(),
        update_time: Date.now()
      });
      
      return successResponse(res);
    } catch (e) {
      return errorResponse(500, '创建失败，请稍后重试');
    }
  },

  async updateMonthlyPlan(params) {
    const validationError = validateRequiredParams(params, ['id']);
    if (validationError) return validationError;

    const { error } = await verifyRecordOwnership('monthly_plans', params.id, this.uniIdToken.uid);
    if (error) return error;

    try {
      const data = { update_time: Date.now() };
      if (params.goals) data.goals = params.goals;
      if (params.status) data.status = params.status;
      
      await db.collection('monthly_plans').doc(params.id).update(data);
      return successResponse();
    } catch (e) {
      return errorResponse(500, '更新失败，请稍后重试');
    }
  },

  async deleteMonthlyPlan(params) {
    const validationError = validateRequiredParams(params, ['id']);
    if (validationError) return validationError;

    const { error } = await verifyRecordOwnership('monthly_plans', params.id, this.uniIdToken.uid);
    if (error) return error;

    try {
      await db.collection('monthly_plans').doc(params.id).remove();
      return successResponse();
    } catch (e) {
      return errorResponse(500, '删除失败，请稍后重试');
    }
  },

  // ==================== 用户信息 ====================

  async getUserInfo(params) {
    const validationError = validateRequiredParams(params, ['uid']);
    if (validationError) return validationError;

    try {
      const res = await db.collection('uni-id-users')
        .doc(params.uid)
        .field({
          nickname: true,
          avatar: true,
          mobile: true,
          realname: true,
          gender: true,
          birthday: true,
          job: true,
          dao_profile: true
        })
        .get();
      
      return successResponse(res.data && res.data.length > 0 ? res.data[0] : null);
    } catch (e) {
      return errorResponse(500, '查询失败，请稍后重试');
    }
  },

  async updateUserInfo(params) {
    const validationError = validateRequiredParams(params, ['uid', 'data']);
    if (validationError) return validationError;
    
    // 权限验证：只能修改自己的信息
    if (params.uid !== this.uniIdToken.uid) {
      return errorResponse(403, '无权操作');
    }
    
    // 白名单过滤：只允许修改安全字段
    const allowedFields = ['nickname', 'avatar', 'realname', 'gender', 'birthday', 'job'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (params.data[field] !== undefined) {
        updateData[field] = params.data[field];
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return errorResponse(400, '没有可更新的字段');
    }

    try {
      await db.collection('uni-id-users').doc(params.uid).update(updateData);
      
      // 返回最新用户数据
      const userProfile = await getLatestUserProfile(params.uid);
      return successResponseWithProfile(null, userProfile);
    } catch (e) {
      return errorResponse(500, '更新失败，请稍后重试');
    }
  }
};