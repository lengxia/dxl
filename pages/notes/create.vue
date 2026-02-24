<template>
  <view class="create-page">
    <!-- 顶部导航栏 -->
    <tn-nav-bar :isBack="true" fixed backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="right" class="nav-right">
        <tn-button 
          backgroundColor="#7B68EE" 
          fontColor="#FFFFFF" 
          size="sm" 
          shape="round" 
          padding="0 30rpx"
          width="120rpx"
          height="56rpx"
          @click="submit"
        >
          发布
        </tn-button>
      </view>
    </tn-nav-bar>

    <view class="page-content" :style="{paddingTop: (vuex_custom_bar_height + 10) + 'px'}">
      
      <!-- 1. 图片上传区 (横向滚动) -->
      <view class="image-section">
        <scroll-view scroll-x class="image-scroll" >
          <!-- 图片列表 -->
          <view 
            v-for="(img, index) in imageList" 
            :key="index" 
            class="image-item"
          >
            <image :src="img" mode="aspectFill" class="uploaded-img"/>
            <view class="delete-btn" @click="removeImage(index)">
              <text class="tn-icon-close"></text>
            </view>
          </view>
          
          <!-- 添加按钮 -->
          <view class="add-btn" @click="chooseImage" v-if="imageList.length < 9">
            <text class="tn-icon-add"></text>
          </view>
        </scroll-view>
      </view>

      <!-- 2. 编辑区域 -->
      <view class="editor-section">
        <!-- 标题 -->
        <input 
          class="input-title" 
          placeholder="填写标题会有更多赞哦~" 
          placeholder-style="color: #B2BEC3;"
          v-model="form.title" 
          maxlength="50"
        />
        
        <view class="divider"></view>
        
        <!-- 正文 (富文本编辑器) -->
        <view class="editor-container">
          <!-- 工具栏 - 第一行 -->
          <scroll-view scroll-x class="toolbar-scroll">
            <view class="toolbar">
              <!-- 撤销/重做 -->
              <view class="tool-item" @tap="handleFormat('undo')">
                <text class="tn-icon-left"></text>
              </view>
              <view class="tool-item" @tap="handleFormat('redo')">
                <text class="tn-icon-right"></text>
              </view>
              <view class="toolbar-divider"></view>
              
              <!-- 文字样式 -->
              <view class="tool-item" :class="{ 'active': formats.bold }" @tap="handleFormat('bold')">
                <text style="font-weight: 900;">B</text>
              </view>
              <view class="tool-item" :class="{ 'active': formats.italic }" @tap="handleFormat('italic')">
                <text style="font-style: italic; font-weight: 900; font-family: serif;">I</text>
              </view>
              <view class="tool-item" :class="{ 'active': formats.underline }" @tap="handleFormat('underline')">
                <text style="text-decoration: underline; font-weight: 900;">U</text>
              </view>
              <view class="tool-item" :class="{ 'active': formats.strike }" @tap="handleFormat('strike')">
                <text style="text-decoration: line-through; font-weight: 900;">S</text>
              </view>
              <view class="toolbar-divider"></view>
              
              <!-- 标题 -->
              <view class="tool-item" :class="{ 'active': formats.header === 1 }" @tap="handleFormat('header', 1)">
                <text style="font-weight: 900; font-size: 32rpx;">H1</text>
              </view>
              <view class="tool-item" :class="{ 'active': formats.header === 2 }" @tap="handleFormat('header', 2)">
                <text style="font-weight: 900; font-size: 28rpx;">H2</text>
              </view>
              <view class="toolbar-divider"></view>
              
              <!-- 对齐方式 -->
              <view class="tool-item" :class="{ 'active': formats.align === 'left' }" @tap="handleFormat('align', 'left')">
                <text style="font-size: 26rpx; font-weight: 900;">☰</text>
              </view>
              <view class="tool-item" :class="{ 'active': formats.align === 'center' }" @tap="handleFormat('align', 'center')">
                <text style="font-size: 26rpx; font-weight: 900;">☷</text>
              </view>
              <view class="tool-item" :class="{ 'active': formats.align === 'right' }" @tap="handleFormat('align', 'right')">
                <text style="font-size: 26rpx; font-weight: 900;">☱</text>
              </view>
              <view class="toolbar-divider"></view>
              
              <!-- 列表 -->
              <view class="tool-item" :class="{ 'active': formats.list === 'bullet' }" @tap="handleFormat('list', 'bullet')">
                <text style="font-size: 32rpx; line-height: 1;">•</text>
              </view>
              <view class="tool-item" :class="{ 'active': formats.list === 'ordered' }" @tap="handleFormat('list', 'ordered')">
                <text style="font-size: 26rpx; font-weight: 900;">1.</text>
              </view>
              <view class="toolbar-divider"></view>
              
              <!-- 更多操作 -->
              <view class="tool-item" @tap="showColorPicker = true">
                <text style="font-size: 30rpx;">🎨</text>
              </view>
              <view class="tool-item" @tap="handleFormat('separator')">
                <text style="font-size: 20rpx; letter-spacing: 2rpx;">━</text>
              </view>
              <view class="tool-item" @tap="clearFormat">
                <text class="tn-icon-clear"></text>
              </view>
            </view>
          </scroll-view>
          
          <!-- 编辑器 -->
          <editor 
            id="editor" 
            class="ql-container" 
            placeholder="分享你的修行感悟，记录当下的心境..." 
            show-img-size 
            show-img-toolbar 
            show-img-resize 
            @ready="onEditorReady"
            @statuschange="onStatusChange"
            @input="onEditorInput"
            @focus="onEditorFocus"
            @blur="onEditorBlur"
          ></editor>
          
          <!-- 编辑状态提示 -->
          <view class="editor-status" v-if="editorFocused">
            <text class="status-text">{{ contentLength }} 字</text>
          </view>
        </view>
        
        <!-- 快捷操作栏 -->
        <view class="quick-actions">
          <view class="action-tag" @click="showTagInput = true">
            <text class="tn-icon-topic"></text>
            <text>话题</text>
          </view>
          <view class="action-tag" @click="toggleMoodSelect">
            <text class="tn-icon-emoji-good"></text>
            <text>心境</text>
          </view>
        </view>
        
        <!-- 已选标签展示 -->
        <view class="tags-display" v-if="form.tags_str">
          <view class="display-tag" v-for="(tag, idx) in tagsArray" :key="idx">
             # {{ tag }}
             <text class="tn-icon-close remove-tag" @click="removeTag(idx)"></text>
          </view>
        </view>
      </view>

      <!-- 3. 选项列表 -->
      <view class="options-list">
        <!-- 心境选择 -->
        <view class="option-item" @click="toggleMoodSelect">
          <view class="item-left">
            <text class="tn-icon-heart icon-prefix"></text>
            <text class="item-label">当前心境</text>
          </view>
          <view class="item-right">
            <!-- 修复 undefined 问题：使用 v-if 保护 -->
            <text class="value-text" v-if="form.mood">{{ form.mood }} {{ getMoodEmoji(form.mood) }}</text>
            <text class="value-text" v-else>请选择</text>
            <text class="tn-icon-right arrow"></text>
          </view>
        </view>
        
        <!-- 标签输入 -->
        <view class="option-item" @click="showTagInput = true">
           <view class="item-left">
             <text class="tn-icon-tag icon-prefix"></text>
             <text class="item-label">添加标签</text>
           </view>
           <view class="item-right">
             <text class="value-text" v-if="!form.tags_str">去添加</text>
             <text class="tn-icon-right arrow"></text>
           </view>
        </view>

        <!-- 私密设置 -->
        <view class="option-item">
          <view class="item-left">
            <text class="tn-icon-lock icon-prefix"></text>
            <text class="item-label">仅自己可见</text>
          </view>
          <view class="item-right">
            <switch 
              :checked="form.is_private" 
              color="#7B68EE" 
              style="transform:scale(0.8)" 
              @change="form.is_private = !form.is_private" 
            />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部弹窗：心境选择 -->
    <tn-popup v-model="showMood" mode="bottom" borderRadius="30">
      <view class="mood-popup">
        <view class="popup-title">选择当下的心境</view>
        <view class="mood-grid">
          <view 
            v-for="(item, index) in moodOptions" 
            :key="index" 
            class="mood-grid-item"
            :class="{ active: form.mood === item.name }"
            @click="selectMood(item.name)"
          >
            <text class="emoji">{{ item.emoji }}</text>
            <text class="name">{{ item.name }}</text>
          </view>
        </view>
      </view>
    </tn-popup>

    <!-- 底部弹窗：标签输入 -->
    <tn-popup v-model="showTagInput" mode="bottom" borderRadius="30">
       <view class="tag-popup">
          <view class="popup-title">添加标签</view>
          <input 
            class="tag-input" 
            placeholder="输入标签，多个用逗号分隔" 
            v-model="form.tags_str" 
            :focus="showTagInput"
            confirm-type="done"
            @confirm="showTagInput = false"
          />
          <view class="quick-tags-area">
             <view class="quick-title">推荐标签：</view>
             <view class="quick-list">
               <view 
                 v-for="(tag, i) in quickTags" 
                 :key="i" 
                 class="quick-tag-chip"
                 @click="addQuickTag(tag)"
               >
                 {{ tag }}
               </view>
             </view>
          </view>
          <view class="popup-btn" @click="showTagInput = false">确定</view>
       </view>
    </tn-popup>
    
    <!-- 底部弹窗：颜色选择 -->
    <tn-popup v-model="showColorPicker" mode="bottom" borderRadius="30">
      <view class="color-popup">
        <view class="popup-title">选择文字颜色</view>
        <view class="color-grid">
          <view 
            v-for="(color, index) in colorOptions" 
            :key="index" 
            class="color-item"
            @click="applyColor(color.value)"
          >
            <view class="color-circle" :style="{backgroundColor: color.value}">
              <text class="tn-icon-check" v-if="currentColor === color.value"></text>
            </view>
            <text class="color-name">{{ color.name }}</text>
          </view>
        </view>
      </view>
    </tn-popup>

  </view>
</template>

<script>
  import formPageMixin from '@/libs/form-page-mixin'
  import { unescapeHtml } from '@/libs/html-utils'
  import notesState from '@/store/node_state.js'

  export default {
    mixins: [formPageMixin],
    
    data() {
      return {
        showMood: false,
        showTagInput: false,
        showColorPicker: false,
        editorCtx: null,
        formats: {}, // 编辑器样式
        editorFocused: false,
        contentLength: 0,
        currentColor: '#7B68EE',
        colorOptions: [
          { name: '默认', value: '#2D3436' },
          { name: '紫色', value: '#7B68EE' },
          { name: '红色', value: '#E74C3C' },
          { name: '橙色', value: '#E67E22' },
          { name: '蓝色', value: '#3498DB' },
          { name: '绿色', value: '#27AE60' },
          { name: '灰色', value: '#95A5A6' }
        ],
        moodOptions: [
          { name: '平和', emoji: '😌' },
          { name: '喜悦', emoji: '😊' },
          { name: '感悟', emoji: '💡' },
          { name: '焦虑', emoji: '😰' },
          { name: '低落', emoji: '😔' }
        ],
        quickTags: ['读书', '修心', '静坐', '感恩', '反思', '悟道'],
        imageList: [],
        form: {
          title: '',
          content: '',
          mood: '平和',
          tags_str: '',
          images: [],
          is_private: false
        },
        rules: {
          title: [{ required: true, message: '请输入标题' }]
        }
      }
    },
    
    computed: {
      tagsArray() {
        if (!this.form.tags_str) return [];
        return this.form.tags_str.split(/[,，]/).filter(t => t.trim());
      }
    },

    methods: {
      goBack() {
        uni.navigateBack()
      },
      
      toggleMoodSelect() {
        this.showMood = !this.showMood;
      },
      
      selectMood(name) {
        this.$set(this.form, 'mood', name);
        this.showMood = false;
      },
      
      getMoodEmoji(name) {
        if (!name) return '';
        const item = this.moodOptions.find(opt => opt.name === name);
        return item ? item.emoji : '';
      },
      
      removeTag(index) {
        let tags = this.tagsArray;
        tags.splice(index, 1);
        this.form.tags_str = tags.join(',');
      },

      // ========== 编辑器相关方法 ==========
      
      onEditorReady() {
        uni.createSelectorQuery().in(this).select('#editor').context((res) => {
          this.editorCtx = res.context
          // 如果有初始内容，设置进去
          if (this.form.content) {
            this.editorCtx.setContents({
              html: this.form.content
            })
          }
        }).exec()
      },
      
      onStatusChange(e) {
        const formats = e.detail
        this.formats = formats
      },
      
      onEditorInput(e) {
        // 更新表单内容为 HTML
        this.form.content = e.detail.html
        // 计算内容长度（去除HTML标签）
        const text = e.detail.text || ''
        this.contentLength = text.length
      },
      
      onEditorFocus() {
        this.editorFocused = true
      },
      
      onEditorBlur() {
        this.editorFocused = false
      },
      
      // 处理格式化操作（新方法，直接传参）
      handleFormat(name, value) {
        if (!this.editorCtx) {
          console.warn('编辑器尚未准备好')
          return
        }
        
        // 特殊处理撤销/重做
        if (name === 'undo') {
          this.editorCtx.undo()
          return
        }
        if (name === 'redo') {
          this.editorCtx.redo()
          return
        }
        
        // 特殊处理分割线
        if (name === 'separator') {
          this.editorCtx.insertDivider()
          return
        }
        
        // 其他格式化操作
        this.editorCtx.format(name, value)
      },
      
      // 保留旧方法以兼容（如果其他地方有使用）
      format(e) {
        let { name, value } = e.target.dataset
        if (!name) return
        this.handleFormat(name, value)
      },
      
      applyColor(color) {
        if (this.editorCtx) {
          this.editorCtx.format('color', color)
          this.currentColor = color
        }
        this.showColorPicker = false
      },
      
      clearFormat() {
        if (this.editorCtx) {
          this.editorCtx.removeFormat()
        }
      },

      // ========== 缓存数据处理 ==========
      
      fillFormFromCache(data) {
        // 反转义 HTML 内容
        let content = data.content || '';
        if (content) {
          content = unescapeHtml(content);
        }
        
        this.form = {
          title: data.title || '',
          content: content,
          mood: data.mood || '平和',
          tags_str: data.tags ? data.tags.join(',') : '',
          images: data.images || [],
          is_private: data.is_private || false
        };
        this.imageList = data.images || [];
        
        // 如果编辑器已准备好，设置内容
        if (this.editorCtx) {
          setTimeout(() => {
            if (this.editorCtx && this.form.content) {
              this.editorCtx.setContents({
                html: this.form.content
              });
            }
          }, 200);
        }
      },
      
      // ========== FormPageMixin 接口实现 ==========
      
      onSubmitSuccess(updatedData) {
        // 提交成功后，将更新的数据保存到状态
        notesState.setCurrentNote(updatedData);
      },
      
      async loadFormData(id) {
        let data = null;
        
        // 优先使用状态中的 note
        if (notesState.isCurrentNote(id)) {
          data = notesState.currentNote;
        } else {
          // 没有缓存才请求
          const res = await this.$api.call('getNoteDetail',
            { id },
            { showLoading: true, loadingText: '加载中...' }
          );
          if (res.success && res.data) {
            data = res.data;
          }
        }
        
        // 统一填充表单
        if (data) {
          this.fillFormFromCache(data);
        }
      },
      
      getApiMethods() {
        return { add: 'addNote', update: 'updateNote' }
      },
      
      processFormData(formData) {
        return {
          title: formData.title,
          content: formData.content,
          mood: formData.mood,
          tags: formData.tags || this.parseTags(formData.tags_str),
          images: formData.images || [],
          is_private: formData.is_private
        }
      },
      
      // ========== 页面特定方法 ==========
      
      addQuickTag(tag) {
        // 直接实现添加标签逻辑，避免递归调用不存在的重载方法
        if (!this.form.tags_str) {
          this.form.tags_str = tag;
        } else {
          // 避免重复添加
          const tags = this.form.tags_str.split(/[,，]/).map(t => t.trim());
          if (!tags.includes(tag)) {
            this.form.tags_str += ',' + tag;
          }
        }
      },
      
      chooseImage() {
        uni.chooseImage({
          count: 9 - this.imageList.length,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            this.imageList = [...this.imageList, ...res.tempFilePaths]
            this.$set(this.form, 'images', this.imageList)
          }
        })
      },
      
      removeImage(index) {
        this.imageList.splice(index, 1)
        this.$set(this.form, 'images', this.imageList)
      },
      
      async submit() {
        if (!this.form.title) {
          uni.showToast({ title: '请输入标题', icon: 'none' })
          return
        }
        // 对于富文本，内容校验可能需要更复杂（如去除标签后判空），这里先简单判断
        if (!this.form.content || this.form.content === '<p><br></p>') {
          uni.showToast({ title: '请输入内容', icon: 'none' })
          return
        }
        
        this.uploading = true
        uni.showLoading({ title: '发布中' })
        
        try {
          let images = [];
          if (this.imageList && this.imageList.length > 0) {
             images = await this.uploadImages(this.imageList, 'notes')
             
             // 重要：上传成功后，用云存储地址替换临时路径
             this.imageList = images
             this.$set(this.form, 'images', images)
          }
          
          this.uploading = false
          
          this.submitForm({
            title: this.form.title,
            content: this.form.content,
            mood: this.form.mood || '平和',
            tags: this.tagsArray,
            images: images,
            is_private: this.form.is_private
          });
          
        } catch (e) {
          this.uploading = false
          uni.hideLoading()
          uni.showToast({ title: '发布失败', icon: 'none' })
          console.error(e)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  $primary: #7B68EE;
  $text: #2D3436;
  $text-secondary: #636E72;
  $text-hint: #B2BEC3;
  $bg-gray: #F5F5F5;

  .create-page {
    min-height: 100vh;
    background-color: #FFFFFF;
  }

  .nav-right {
    margin-right: 20rpx;
  }

  .page-content {
    padding-bottom: 60rpx;
  }

  // 1. 图片上传区
  .image-section {
    padding: 20rpx 0;
    
    .image-scroll {
      white-space: nowrap;
      display: flex;
      padding: 0 30rpx;
      height: 220rpx;
      
      // 隐藏滚动条
      &::-webkit-scrollbar {
        width: 0;
        height: 0;
        color: transparent;
        display: none;
      }
    }
    
    .image-item {
      display: inline-block;
      width: 220rpx;
      height: 220rpx;
      margin-right: 20rpx;
      border-radius: 16rpx;
      overflow: hidden;
      position: relative;
      vertical-align: top; // 修复 inline-block 对齐问题
      
      .uploaded-img {
        width: 100%;
        height: 100%;
      }
      
      .delete-btn {
        position: absolute;
        top: 10rpx;
        right: 10rpx;
        width: 44rpx;
        height: 44rpx;
        background: rgba(0,0,0,0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        
        text {
          color: #FFF;
          font-size: 24rpx;
        }
      }
    }
    
    .add-btn {
      display: inline-flex;
      width: 220rpx;
      height: 220rpx;
      background: #F9F9F9;
      border-radius: 16rpx;
      align-items: center;
      justify-content: center;
      margin-right: 30rpx; // 撑开右边距
      vertical-align: top; // 修复 inline-block 对齐问题
      border: 2rpx dashed #E0E0E0; // 增加虚线边框，提升识别度
      box-sizing: border-box;
      
      text {
        font-size: 60rpx;
        color: #D1D1D1;
      }
    }
  }

  // 2. 编辑区
  .editor-section {
    padding: 20rpx 30rpx;
  }

  .input-title {
    font-size: 36rpx;
    font-weight: 600;
    color: $text;
    height: 80rpx;
    line-height: 80rpx;
  }

  .divider {
    height: 1rpx;
    background: #F0F0F0;
    margin: 20rpx 0;
  }

  // 富文本编辑器样式
  .editor-container {
    width: 100%;
    min-height: 200rpx;
    position: relative;
    
    .toolbar-scroll {
      width: 100%;
      white-space: nowrap;
      
      &::-webkit-scrollbar {
        display: none;
      }
    }
    
    .toolbar {
      display: inline-flex;
      align-items: center;
      padding: 10rpx 0;
      margin-bottom: 10rpx;
      border-bottom: 1rpx solid #F0F0F0;
      
      .tool-item {
        flex-shrink: 0;
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $text-secondary;
        margin-right: 12rpx;
        border-radius: 8rpx;
        font-size: 32rpx;
        transition: all 0.2s ease;
        
        &:active {
          transform: scale(0.95);
          background: #F5F5F5;
        }
        
        &.active {
          color: $primary;
          background: rgba($primary, 0.1);
          font-weight: bold;
        }
      }
      
      .toolbar-divider {
        width: 1rpx;
        height: 40rpx;
        background: #E8E8E8;
        margin: 0 8rpx;
        flex-shrink: 0;
      }
    }
    
    .ql-container {
      width: 100%;
      min-height: 300rpx;
      max-height: 600rpx;
      font-size: 30rpx;
      line-height: 1.8;
      color: $text;
      padding: 20rpx 0;
    }
    
    .editor-status {
      position: absolute;
      bottom: 10rpx;
      right: 10rpx;
      padding: 6rpx 16rpx;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 20rpx;
      
      .status-text {
        font-size: 22rpx;
        color: $text-hint;
      }
    }
  }
  
  .quick-actions {
    display: flex;
    margin-top: 30rpx;
    
    .action-tag {
      background: #F5F7FA;
      padding: 10rpx 24rpx;
      border-radius: 30rpx;
      display: flex;
      align-items: center;
      margin-right: 20rpx;
      font-size: 26rpx;
      color: $text-secondary;
      
      text:first-child {
        margin-right: 8rpx;
        font-size: 30rpx;
        color: $primary;
      }
    }
  }
  
  .tags-display {
    display: flex;
    flex-wrap: wrap;
    margin-top: 20rpx;
    gap: 16rpx;
    
    .display-tag {
      color: #1E80FF;
      font-size: 26rpx;
      background: rgba(30, 128, 255, 0.08);
      padding: 6rpx 20rpx;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      
      .remove-tag {
        margin-left: 8rpx;
        font-size: 24rpx;
        color: #1E80FF;
      }
    }
  }

  // 3. 选项列表
  .options-list {
    margin-top: 20rpx;
    border-top: 16rpx solid #F9F9F9;
  }

  .option-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 34rpx 30rpx;
    border-bottom: 1rpx solid #F5F5F5;
    background: #FFF;
    
    &:active {
      background-color: #FAFAFA;
    }
    
    .item-left {
      display: flex;
      align-items: center;
      font-size: 30rpx;
      color: $text;
      
      .icon-prefix {
        font-size: 36rpx;
        margin-right: 16rpx;
        color: $text-secondary;
      }
    }
    
    .item-right {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      color: $text-secondary;
      
      .arrow {
        margin-left: 10rpx;
        color: $text-hint;
        font-size: 24rpx;
      }
    }
  }

  // 弹窗样式
  .mood-popup {
    padding: 30rpx;
    background: #FFF;
    
    .popup-title {
      text-align: center;
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 40rpx;
    }
    
    .mood-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      
      .mood-grid-item {
        width: 18%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20rpx 0;
        border-radius: 16rpx;
        margin-bottom: 20rpx;
        
        &.active {
          background: rgba($primary, 0.1);
          
          .name {
            color: $primary;
            font-weight: bold;
          }
        }
        
        .emoji {
          font-size: 60rpx;
          margin-bottom: 10rpx;
        }
        
        .name {
          font-size: 24rpx;
          color: $text-secondary;
        }
      }
    }
  }
  
  .tag-popup {
    padding: 30rpx;
    background: #FFF;
    min-height: 400rpx;
    
    .popup-title {
       font-size: 32rpx;
       font-weight: bold;
       margin-bottom: 30rpx;
       text-align: center;
    }
    
    .tag-input {
       background: #F5F5F5;
       height: 80rpx;
       border-radius: 40rpx;
       padding: 0 30rpx;
       font-size: 28rpx;
       margin-bottom: 40rpx;
    }
    
    .quick-title {
       font-size: 26rpx;
       color: $text-hint;
       margin-bottom: 20rpx;
    }
    
    .quick-list {
       display: flex;
       flex-wrap: wrap;
       gap: 20rpx;
    }
    
    .quick-tag-chip {
       padding: 10rpx 24rpx;
       background: #F9F9F9;
       border-radius: 30rpx;
       font-size: 24rpx;
       color: $text-secondary;
    }
    
    .popup-btn {
       margin-top: 60rpx;
       height: 80rpx;
       background: $primary;
       color: #FFF;
       border-radius: 40rpx;
       display: flex;
       align-items: center;
       justify-content: center;
       font-size: 30rpx;
    }
  }
  
  // 颜色选择弹窗
  .color-popup {
    padding: 30rpx;
    background: #FFF;
    
    .popup-title {
      text-align: center;
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 40rpx;
    }
    
    .color-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 30rpx;
      justify-content: space-around;
      padding-bottom: 30rpx;
      
      .color-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .color-circle {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10rpx;
          box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
          
          text {
            color: #FFF;
            font-size: 32rpx;
            font-weight: bold;
          }
        }
        
        .color-name {
          font-size: 24rpx;
          color: $text-secondary;
        }
      }
    }
  }
</style>