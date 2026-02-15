const db = uniCloud.database();

module.exports = {
  _before: function () {
    // 简单的权限校验，确保已登录
    const clientInfo = this.getClientInfo();
    this.uniIdToken = clientInfo.uniIdToken;
    if (!this.uniIdToken) {
      throw new Error('未登录');
    }
  },

  /**
   * 获取悟道札记详情
   * @param {Object} params
   */
  async getNoteDetail(params) {
    const { id } = params;
    if (!id) return { errCode: 1, errMsg: 'ID不能为空' };
    
    try {
      const res = await db.collection('dao_notes').doc(id).get();
      if (!res.data || res.data.length === 0) {
        return { errCode: 404, errMsg: '记录不存在' };
      }
      
      const note = res.data[0];
      const uid = this.uniIdToken.uid;
      
      // 如果是私有札记，只有作者能查看
      const noteUserId = note.user_id || note.uid;
      if (note.is_private && noteUserId !== uid) {
        return { errCode: 403, errMsg: '无权访问' };
      }
      
      return {
        errCode: 0,
        data: note
      };
    } catch (e) {
      return { errCode: 500, errMsg: e.message };
    }
  },

  /**
   * 删除悟道札记
   * @param {Object} params
   */
  async deleteNote(params) {
    const { id } = params;
    if (!id) return { errCode: 1, errMsg: 'ID不能为空' };
    
    try {
      // 权限验证：只能删除自己的札记
      const record = await db.collection('dao_notes').doc(id).get();
      if (!record.data || record.data.length === 0) {
        return { errCode: 404, errMsg: '记录不存在' };
      }
      
      const uid = this.uniIdToken.uid;
      const recordUserId = record.data[0].user_id || record.data[0].uid;
      if (recordUserId !== uid) {
        return { errCode: 403, errMsg: '无权操作' };
      }
      
      await db.collection('dao_notes').doc(id).remove();
      return { errCode: 0, errMsg: 'success' };
    } catch (e) {
      return { errCode: 500, errMsg: e.message };
    }
  },

  /**
   * 添加悟道札记
   * @param {Object} params 札记数据
   */
  async addNote(params) {
    const { title, content, mood, tags, images, is_private, user_id } = params;
    
    // 自动补充 user_id，如果前端没传，尝试从 token 获取
    const uid = user_id || this.uniIdToken.uid;
    
    if (!title || !content || !uid) {
      return {
        errCode: 1,
        errMsg: '参数不完整'
      };
    }

    try {
      const res = await db.collection('dao_notes').add({
        user_id: uid, // 统一使用 user_id
        title,
        content,
        mood,
        tags,
        images,
        is_private,
        create_time: Date.now(),
        update_time: Date.now()
      });
      
      return {
        errCode: 0,
        data: res
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 更新悟道札记
   * @param {Object} params
   */
  async updateNote(params) {
    const { id, title, content, mood, tags, images, is_private, update_time } = params;
    
    if (!id) {
      return {
        errCode: 1,
        errMsg: 'ID不能为空'
      };
    }

    try {
      const updateData = {
        update_time: update_time || Date.now()
      };
      
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (mood !== undefined) updateData.mood = mood;
      if (tags !== undefined) updateData.tags = tags;
      if (images !== undefined) updateData.images = images;
      if (is_private !== undefined) updateData.is_private = is_private;
      
      await db.collection('dao_notes').doc(id).update(updateData);
      
      return {
        errCode: 0,
        errMsg: 'success'
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 获取每日任务
   * @param {Object} params
   * @param {String} params.date 日期字符串 YYYY-MM-DD
   * @param {String} params.uid 用户ID
   */
  async getDailyTask(params) {
    const { date, uid } = params;
    
    if (!date || !uid) {
      return {
        errCode: 1,
        errMsg: '参数不完整'
      };
    }

    try {
      const res = await db.collection('daily_tasks')
        .where({
          date: date,
          user_id: uid
        })
        .get();
        
      return {
        errCode: 0,
        data: res.data && res.data.length > 0 ? res.data[0] : null
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },
  
  /**
   * 检查今日任务状态
   * @param {Object} params
   */
  async checkTodayTask(params) {
    const { date, user_id } = params;
    const uid = user_id || this.uniIdToken.uid;
    
    if (!date || !uid) return { errCode: 1, errMsg: '参数不完整' };
    
    try {
      const res = await db.collection('daily_tasks')
        .where({ date: date, user_id: uid })
        .count();
      return {
        errCode: 0,
        data: { total: res.total }
      };
    } catch (e) {
      return { errCode: 500, errMsg: e.message };
    }
  },

  /**
   * 提交/更新每日任务
   * @param {Object} params 任务数据
   */
  async submitDailyTask(params) {
    const { date, user_id } = params;
    
    if (!date || !user_id) {
      return {
        errCode: 1,
        errMsg: '参数不完整'
      };
    }

    try {
      const checkRes = await db.collection('daily_tasks')
        .where({
          date: date,
          user_id: user_id
        })
        .get();
      
      if (checkRes.data && checkRes.data.length > 0) {
        const id = checkRes.data[0]._id;
        delete params._id; // 确保不更新 _id
        
        await db.collection('daily_tasks').doc(id).update({
          ...params,
          update_time: Date.now()
        });
      } else {
        await db.collection('daily_tasks').add(params);
      }
      
      return {
        errCode: 0,
        errMsg: 'success'
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 获取用户信息
   * @param {Object} params
   * @param {String} params.uid 用户ID
   */
  async getUserInfo(params) {
    const { uid } = params;
    
    if (!uid) {
      return {
        errCode: 1,
        errMsg: '用户ID不能为空'
      };
    }

    try {
      const res = await db.collection('uni-id-users')
        .doc(uid)
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
        
      return {
        errCode: 0,
        data: res.data && res.data.length > 0 ? res.data[0] : null
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 更新用户信息（如头像、昵称）
   * @param {Object} params
   * @param {String} params.uid 用户ID
   * @param {Object} params.data 要更新的数据
   */
  async updateUserInfo(params) {
    const { uid, data } = params;
    
    if (!uid || !data) {
      return {
        errCode: 1,
        errMsg: '参数不完整'
      };
    }

    try {
      await db.collection('uni-id-users')
        .doc(uid)
        .update(data);
        
      return {
        errCode: 0,
        errMsg: 'success'
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 获取善行日记
   * @param {Object} params
   * @param {String} params.uid 用户ID
   */
  async getDiaries(params) {
    const { uid } = params;
    
    if (!uid) {
      return {
        errCode: 1,
        errMsg: '参数不完整'
      };
    }

    try {
      const res = await db.collection('good_deeds')
        .where({
          user_id: uid
        })
        .orderBy('date', 'desc')
        .get();
        
      return {
        errCode: 0,
        data: res.data
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 获取善行日记详情
   * @param {Object} params
   */
  async getDiaryDetail(params) {
    const { id } = params;
    if (!id) return { errCode: 1, errMsg: 'ID不能为空' };
    
    try {
      const res = await db.collection('good_deeds').doc(id).get();
      if (!res.data || res.data.length === 0) {
        return { errCode: 404, errMsg: '记录不存在' };
      }
      
      return {
        errCode: 0,
        data: res.data[0]
      };
    } catch (e) {
      return { errCode: 500, errMsg: e.message };
    }
  },

  /**
   * 删除善行日记
   * @param {Object} params
   */
  async deleteDiary(params) {
    const { id } = params;
    if (!id) return { errCode: 1, errMsg: 'ID不能为空' };
    
    try {
      await db.collection('good_deeds').doc(id).remove();
      return { errCode: 0, errMsg: 'success' };
    } catch (e) {
      return { errCode: 500, errMsg: e.message };
    }
  },

  /**
   * 添加善行日记
   * @param {Object} params
   */
  async addDiary(params) {
    const { date, deed_type, title, content, intention, feeling, merit_points, is_public, user_id } = params;
    
    const uid = user_id || this.uniIdToken.uid;
    
    if (!title || !date || !uid) {
      return {
        errCode: 1,
        errMsg: '参数不完整'
      };
    }

    try {
      const res = await db.collection('good_deeds').add({
        user_id: uid,
        date,
        deed_type,
        title,
        content,
        intention,
        feeling,
        merit_points,
        is_public,
        create_time: Date.now(),
        update_time: Date.now()
      });
      
      // 更新用户总功德（可选，如果需要在用户表中统计）
      // 这里暂不处理，以免事务复杂化
      
      return {
        errCode: 0,
        data: res
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 更新善行日记
   * @param {Object} params
   */
  async updateDiary(params) {
    const { id, date, deed_type, title, content, intention, feeling, merit_points, is_public } = params;
    
    if (!id) {
      return {
        errCode: 1,
        errMsg: 'ID不能为空'
      };
    }

    try {
      const updateData = {
        update_time: Date.now()
      };
      
      if (date !== undefined) updateData.date = date;
      if (deed_type !== undefined) updateData.deed_type = deed_type;
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (intention !== undefined) updateData.intention = intention;
      if (feeling !== undefined) updateData.feeling = feeling;
      if (merit_points !== undefined) updateData.merit_points = merit_points;
      if (is_public !== undefined) updateData.is_public = is_public;
      
      await db.collection('good_deeds').doc(id).update(updateData);
      
      return {
        errCode: 0,
        errMsg: 'success'
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 获取悟道札记
   * @param {Object} params
   * @param {String} params.uid 用户ID
   */
  async getNotes(params) {
    const { uid } = params;
    
    if (!uid) {
      return {
        errCode: 1,
        errMsg: '参数不完整'
      };
    }

    try {
      const res = await db.collection('dao_notes')
        .where({
          user_id: uid
        })
        .orderBy('create_time', 'desc')
        .get();
        
      return {
        errCode: 0,
        data: res.data
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 获取月度计划
   * @param {Object} params
   * @param {String} params.uid 用户ID
   * @param {String} params.yearMonth 年月字符串 YYYY-MM
   */
  async getMonthlyPlans(params) {
    const { uid, yearMonth } = params;
    
    if (!uid || !yearMonth) {
      return {
        errCode: 1,
        errMsg: '参数不完整'
      };
    }

    try {
      const res = await db.collection('monthly_plans')
        .where({
          user_id: uid,
          year_month: yearMonth
        })
        .get();
        
      return {
        errCode: 0,
        data: res.data
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 添加月度计划
   * @param {Object} params
   */
  async addMonthlyPlan(params) {
    const { year_month, title, goals, status, user_id } = params;
    
    // 自动补充 user_id
    const uid = user_id || this.uniIdToken.uid;
    
    if (!year_month || !title || !uid) {
      return {
        errCode: 1,
        errMsg: '参数不完整'
      };
    }

    try {
      const res = await db.collection('monthly_plans').add({
        user_id: uid,
        year_month,
        title,
        goals,
        status: status || 'planning',
        create_time: Date.now(),
        update_time: Date.now()
      });
      
      return {
        errCode: 0,
        data: res
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 获取月度计划详情
   * @param {Object} params
   * @param {String} params.id 计划ID
   */
  async getMonthlyPlanDetail(params) {
    const { id } = params;
    if (!id) return { errCode: 1, errMsg: 'ID不能为空' };
    
    try {
      const res = await db.collection('monthly_plans').doc(id).get();
      if (!res.data || res.data.length === 0) {
        return { errCode: 404, errMsg: '记录不存在' };
      }
      
      return {
        errCode: 0,
        data: res.data[0]
      };
    } catch (e) {
      return { errCode: 500, errMsg: e.message };
    }
  },

  /**
   * 更新月度计划
   * @param {Object} params
   */
  async updateMonthlyPlan(params) {
    const { id, goals, status, update_time } = params;
    if (!id) return { errCode: 1, errMsg: 'ID不能为空' };
    
    try {
      const data = { update_time: update_time || Date.now() };
      if (goals) data.goals = goals;
      if (status) data.status = status;
      
      await db.collection('monthly_plans').doc(id).update(data);
      return { errCode: 0, errMsg: 'success' };
    } catch (e) {
      return { errCode: 500, errMsg: e.message };
    }
  },

  /**
   * 删除月度计划
   * @param {Object} params
   */
  async deleteMonthlyPlan(params) {
    const { id } = params;
    if (!id) return { errCode: 1, errMsg: 'ID不能为空' };
    
    try {
      await db.collection('monthly_plans').doc(id).remove();
      return { errCode: 0, errMsg: 'success' };
    } catch (e) {
      return { errCode: 500, errMsg: e.message };
    }
  },

  /**
   * 获取指定月份的打卡记录
   * @param {Object} params
   * @param {String} params.uid 用户ID
   * @param {String} params.yearMonth 年月字符串 YYYY-MM
   * @returns {Object} { errCode: 0, data: ["2026-02-01", "2026-02-05", ...] }
   */
  async getMonthlyCheckIns(params) {
    const { uid, yearMonth } = params;
    
    if (!uid || !yearMonth) {
      return {
        errCode: 1,
        errMsg: '参数不完整'
      };
    }

    try {
      // 查询指定月份的所有打卡记录
      const res = await db.collection('daily_tasks')
        .where({
          user_id: uid,
          date: new db.RegExp({
            regexp: `^${yearMonth}`,  // 匹配 YYYY-MM 开头的日期
            options: 'i'
          })
        })
        .field({
          date: true
        })
        .get();
      
      // 提取日期字符串数组
      const dates = res.data.map(item => item.date);
      
      return {
        errCode: 0,
        data: dates
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  },

  /**
   * 检查指定日期是否已打卡（用于同步状态）
   * @param {Object} params
   * @param {String} params.uid 用户ID
   * @param {String} params.date 日期字符串 YYYY-MM-DD
   * @returns {Object} { errCode: 0, data: { hasChecked: true/false, date: "YYYY-MM-DD" } }
   */
  async checkDailyTaskStatus(params) {
    const { uid, date } = params;
    
    if (!uid || !date) {
      return {
        errCode: 1,
        errMsg: '参数不完整'
      };
    }

    try {
      const res = await db.collection('daily_tasks')
        .where({
          user_id: uid,
          date: date
        })
        .count();
      
      return {
        errCode: 0,
        data: {
          hasChecked: res.total > 0,
          date: date
        }
      };
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      };
    }
  }
};