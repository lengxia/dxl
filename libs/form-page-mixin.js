/**
 * 表单页面 Mixin
 * 职责：
 * 1. 编辑模式管理（新增/编辑判断）
 * 2. 表单数据模型管理
 * 3. 表单验证
 * 4. 统一提交逻辑
 * 5. 自动处理图片上传
 * 
 * 注意：此 mixin 已继承 pageMixin，组件中无需再次引入 pageMixin
 */

import pageMixin from './page-mixin.js';

export default {
  mixins: [pageMixin],
  data() {
    return {
      // 编辑模式标志
      editMode: false,
      // 编辑时的数据ID
      editId: '',
      
      // 表单数据（子类需要覆盖此默认值）
      form: {},
      
      // 表单验证规则（子类需要定义）
      rules: {},
      
      // 加载状态
      loading: false,
      
      // 图片上传相关
      uploading: false,
      
      // 表单引用
      formRef: null
    };
  },

  onLoad(options) {
    // 检查是否为编辑模式
    if (options.id) {
      this.editMode = true;
      this.editId = options.id;
      this.loadFormData(options.id);
    }
    
    // 调用子类的初始化方法
    if (typeof this.onFormLoad === 'function') {
      this.onFormLoad(options);
    }
  },

  onReady() {
    // 设置表单验证规则
    if (this.$refs.form && Object.keys(this.rules).length > 0) {
      this.$refs.form.setRules(this.rules);
      this.formRef = this.$refs.form;
    }
  },

  methods: {
    /**
     * 加载表单数据（子类需重写）
     * @param {string} id - 数据ID
     */
    async loadFormData(id) {
      // 子类重写此方法实现具体的数据加载逻辑
      console.warn('loadFormData 方法需在子类中重写');
    },

    /**
     * 获取API方法名（子类需重写）
     * @returns {Object} - 包含 add 和 update 方法名的对象
     */
    getApiMethods() {
      // 子类重写此方法返回对应的API方法名
      // 例如：return { add: 'addNote', update: 'updateNote' }
      return { add: '', update: '' };
    },

    /**
     * 处理表单数据（子类可重写）
     * @param {Object} formData - 原始表单数据
     * @returns {Object} - 处理后的提交数据
     */
    processFormData(formData) {
      // 默认返回原始数据，子类可重写进行额外处理
      return formData;
    },

    /**
     * 校验表单
     * @returns {boolean} - 校验是否通过
     */
    validateForm() {
      return new Promise((resolve) => {
        if (!this.$refs.form) {
          resolve(true);
          return;
        }
        
        this.$refs.form.validate((valid) => {
          resolve(valid);
        });
      });
    },

    /**
     * 上传单个图片
     * @param {string} path - 图片路径
     * @param {string} folder - 上传文件夹
     * @returns {Promise<string>} - 上传后的文件ID
     */
    async uploadImage(path, folder = 'common') {
      const cloudPath = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const res = await uniCloud.uploadFile({
        filePath: path,
        cloudPath
      });
      return res.fileID;
    },

    /**
     * 处理图片列表上传
     * @param {Array} imageList - 图片路径列表
     * @param {string} folder - 上传文件夹
     * @returns {Promise<Array>} - 上传后的文件ID列表
     */
    async uploadImages(imageList, folder = 'common') {
      if (!imageList || imageList.length === 0) return [];
      
      const urls = [];
      for (const path of imageList) {
        // 已经是云存储地址则跳过（排除临时路径 http://tmp/ 和 wxfile://）
        if (path.startsWith('cloud://') || (path.startsWith('http') && !path.includes('/tmp/'))) {
          urls.push(path);
        } else {
          try {
            const fileID = await this.uploadImage(path, folder);
            urls.push(fileID);
          } catch (e) {
            console.warn('图片上传失败:', e);
            // 上传失败时也返回原路径，避免图片丢失
            urls.push(path);
          }
        }
      }
      return urls;
    },

    /**
     * 统一提交表单
     * @param {Object} submitData - 提交的表单数据
     */
    async submitForm(submitData = null) {
      // 1. 表单验证
      const valid = await this.validateForm();
      if (!valid) {
        uni.showToast({ title: '请完善表单信息', icon: 'none' });
        return;
      }

      // 2. 获取处理后的表单数据
      const formData = submitData || this.form;
      const processedData = this.processFormData(formData);

      // 3. 准备提交参数
      const method = this.editMode ? 'update' : 'add';
      const apiMethods = this.getApiMethods();
      const apiName = apiMethods[method];
      
      if (!apiName) {
        console.error('未定义API方法名');
        return;
      }

      const params = this.editMode
        ? { id: this.editId, ...processedData, update_time: Date.now() }
        : { ...processedData, user_id: this.currentUid };

      // 4. 执行提交
      this.loading = true;
      uni.showLoading({
        title: this.editMode ? '更新中...' : '保存中...',
        mask: true
      });

      try {
        const res = await this.$api.call(apiName, params, {
          showLoading: false
        });

        uni.hideLoading();
        this.loading = false;

        if (res.success) {
          // 编辑成功后，调用子类回调更新状态
          if (this.editMode && typeof this.onSubmitSuccess === 'function') {
            this.onSubmitSuccess({
              _id: this.editId,
              ...processedData,
              update_time: Date.now()
            });
          }
          
          uni.showToast({
            title: this.editMode ? '更新成功' : '保存成功',
            icon: 'success'
          });
          
          // 延迟返回
          setTimeout(() => {
            this.goBack();
          }, 1500);
        } else {
          uni.showToast({
            title: res.message || (this.editMode ? '更新失败' : '保存失败'),
            icon: 'none'
          });
        }
      } catch (e) {
        uni.hideLoading();
        this.loading = false;
        uni.showToast({
          title: this.editMode ? '更新失败' : '保存失败',
          icon: 'none'
        });
        console.error('表单提交错误:', e);
      }
    },

    /**
     * 快捷标签添加
     * @param {string} tag - 标签名
     * @param {string} field - 标签字段名（默认为 tags_str）
     */
    addQuickTag(tag, field = 'tags_str') {
      if (!this.form[field]) {
        this.$set(this.form, field, tag);
        return;
      }
      
      const tags = this.form[field];
      if (!tags.includes(tag)) {
        this.$set(this.form, field, tags + ',' + tag);
      }
    },

    /**
     * 从字符串解析标签数组
     * @param {string} tagsStr - 标签字符串
     * @returns {Array} - 标签数组
     */
    parseTags(tagsStr) {
      if (!tagsStr) return [];
      return tagsStr.split(/[,，\s]+/).filter(t => t.trim() !== '');
    }
  }
};