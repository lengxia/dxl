<template>
  <view class="dxl-note-create tn-safe-area-inset-bottom">
    <tn-nav-bar :isBack="true" backTitle="返回" fixed customBack backgroundColor="#FFFFFF" :bottomShadow="false">
      <view slot="back" class="tn-custom-nav-bar__back" @click="goBack">
        <text class="tn-icon-left tn-color-black"></text>
        <text class="tn-margin-left-xs tn-color-black">返回</text>
      </view>
      <view class="tn-custom-nav-bar__title tn-color-black">撰写札记</view>
    </tn-nav-bar>

    <view class="tn-margin-top-xl tn-padding" :style="{paddingTop: vuex_custom_bar_height + 'px'}">
      <view class="tn-bg-white tn-radius tn-shadow-sm tn-padding">
        <tn-form :model="form" ref="noteForm" :errorType="['message']">
          <tn-form-item label="标题" :required="true" prop="title">
            <tn-input v-model="form.title" placeholder="今日感悟..."></tn-input>
          </tn-form-item>
          
          <tn-form-item label="正文" :required="true" prop="content" labelPosition="top">
            <tn-input v-model="form.content" type="textarea" height="300" placeholder="道可道，非常道..."></tn-input>
          </tn-form-item>

          <tn-form-item label="心境" prop="mood">
            <tn-radio-group v-model="form.mood">
              <tn-radio v-for="(item, index) in moodOptions" :key="index" :name="item">{{ item }}</tn-radio>
            </tn-radio-group>
          </tn-form-item>

          <tn-form-item label="标签" prop="tags_str">
            <tn-input v-model="form.tags_str" placeholder="多个标签用逗号分隔，如：读书,修心"></tn-input>
          </tn-form-item>
          
          <tn-form-item label="配图" labelPosition="top">
            <tn-image-upload :action="action" :fileList="fileList" @on-success="onUploadSuccess" @on-remove="onRemove"></tn-image-upload>
          </tn-form-item>

          <tn-form-item label="私密" :borderBottom="false">
             <tn-switch v-model="form.is_private"></tn-switch>
          </tn-form-item>
        </tn-form>
      </view>

      <view class="tn-margin-top-xl tn-padding-bottom-xl">
        <tn-button backgroundColor="#01BEFF" fontColor="#FFFFFF" shape="round" width="100%" @click="submit">保存札记</tn-button>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        action: 'https://api.next.bspapp.com/uni-captcha-demo/upload', // 这里的action需要替换为真实的uniCloud上传接口或者使用uniCloud.uploadFile
        // 注意：在uniCloud环境中，通常使用uniCloud.uploadFile，tn-image-upload可能需要适配，或者我们手动实现上传逻辑
        // 这里暂时假设已经配置了上传地址，实际开发中需要配置 uni-config-center 或直接调用云函数获取上传凭证
        // 简便起见，图鸟UI的image-upload可能只支持http post上传，如果需要传到uniCloud云存储，建议使用 custom 自定义上传
        
        fileList: [],
        moodOptions: ['平和', '喜悦', '焦虑', '低落', '感悟'],
        form: {
          title: '',
          content: '',
          mood: '平和',
          tags_str: '',
          images: [],
          is_private: false
        },
        rules: {
          title: [{ required: true, message: '请输入标题' }],
          content: [{ required: true, message: '请输入内容' }]
        }
      }
    },
    onReady() {
      this.$refs.noteForm.setRules(this.rules);
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      // 模拟上传成功，实际应替换为真实上传回调处理
      onUploadSuccess(list) {
        // 这里假设组件返回的是上传后的列表
        // 实际使用 uniCloud.uploadFile 时，通常不直接用 action 属性，而是自行处理选择和上传
        console.log(list); 
      },
      onRemove(index, lists) {
        this.fileList = lists;
      },
      async submit() {
        this.$refs.noteForm.validate(async valid => {
          if (valid) {
            // 处理标签
            const tags = this.form.tags_str.split(/[,，\s]+/).filter(t => t.trim() !== '');
            
            // 处理图片（这里假设已经通过某种方式获取了url，简化处理）
            // 在实际项目中，需要遍历 fileList 调用 uniCloud.uploadFile
            
            const data = {
              title: this.form.title,
              content: this.form.content,
              mood: this.form.mood,
              tags: tags,
              images: [], // 暂时留空，待完善上传逻辑
              is_private: this.form.is_private
            };

            uni.showLoading({ title: '保存中' });
            const db = uniCloud.database();
            try {
              await db.collection('dao_notes').add(data);
              uni.hideLoading();
              uni.showToast({ title: '发布成功' });
              setTimeout(() => {
                uni.navigateBack();
              }, 1500);
            } catch (e) {
              uni.hideLoading();
              uni.showToast({ title: '发布失败', icon: 'none' });
            }
          }
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dxl-note-create {
    min-height: 100vh;
    background-color: #F8F8F8;
  }
  .tn-custom-nav-bar__back {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>