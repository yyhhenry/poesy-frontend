<script setup lang="ts">
import { ElIcon, ElInput, ElMessage, ElTabPane, ElTabs, ElUpload } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { uploadImageApi } from '@/utils/image';
import { useTypedStorage } from '@/utils/typed-storage';
import { isString } from '@/utils/types';
import MdBox from '@/components/MdBox.vue';
import { computed, ref, watch, watchEffect } from 'vue';

const props = defineProps<{
  modelValue: string | undefined;
}>();

const emit = defineEmits<{
  'update:modelValue': [string];
}>();

const editorTab = ref<'markdown' | 'preview'>('markdown');


const editorContent = computed({
  get: () => props.modelValue ?? '',
  set: (value: string) => emit('update:modelValue', value),
});

watch(
  () => editorContent.value,
  (newValue, oldValue) => {
    if (newValue === '' && oldValue !== '') {
      editorTab.value = 'markdown';
    }
  },
  { immediate: true }
);
function pushImage(url: string) {
  const urlObj = new URL(url, window.location.href);
  const filename = urlObj.pathname.split('/').pop();
  // Push markdown image syntax to the editor content
  editorContent.value += `\n![${filename}](${url})`;
}
const fontFamily = 'Consolas, Monaco, \" Andale Mono\", \"Ubuntu Mono\" , monospace';

</script>

<template>
  <ElTabs v-model="editorTab">
    <ElTabPane label="Markdown代码" name="markdown">
      <ElInput v-model="editorContent" type="textarea" :style="{
        fontFamily
      }" :autosize="true"></ElInput>
      <ElUpload :style="{ marginTop: '20px' }" :drag="true" :accept="'.jpg,.jpeg,.png'" :show-file-list="false"
        :http-request="async (options) => {
          const response = await uploadImageApi(options.file);
          if (response.isErr()) {
            ElMessage.error(response.unwrapErr().message);
            return;
          }
          ElMessage.success('上传成功');
          pushImage(response.unwrap().url);
        }">
        <ElIcon class="el-icon--upload">
          <UploadFilled></UploadFilled>
        </ElIcon>
        <div class="el-upload__text">
          拖放图片到此处，或<em>点击上传</em>
        </div>
      </ElUpload>
    </ElTabPane>
    <ElTabPane label="预览" name="preview">
      <MdBox :content="editorContent ?? ''"></MdBox>
    </ElTabPane>
  </ElTabs>
</template>
