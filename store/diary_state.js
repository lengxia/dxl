/**
 * Diary 模块简单状态管理
 * 使用 Vue.observable 创建响应式状态
 */
import Vue from 'vue'

const diary_state = Vue.observable({
  currentDiary: null
})

export default {
  get currentDiary() {
    return diary_state.currentDiary
  },
  
  setCurrentDiary(diary) {
    diary_state.currentDiary = diary
  },
  
  isCurrentDiary(id) {
    return diary_state.currentDiary && diary_state.currentDiary._id === id
  },
  
  clearCurrentDiary() {
    diary_state.currentDiary = null
  }
}