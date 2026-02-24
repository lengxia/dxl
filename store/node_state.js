/**
 * Notes 模块简单状态管理
 * 使用 Vue.observable 创建响应式状态
 */
import Vue from 'vue'

const node_state = Vue.observable({
  currentNote: null
})

export default {
  get currentNote() {
    return node_state.currentNote
  },
  
  setCurrentNote(note) {
    node_state.currentNote = note
  },
  
  isCurrentNote(id) {
    return node_state.currentNote && node_state.currentNote._id === id
  },
  
  clearCurrentNote() {
    node_state.currentNote = null
  }
}