<script setup lang="ts">
import { PageLayout, FlexCard, HeaderText, SwitchDark, FlexBox, } from '@yyhhenry/element-extra';
import { ElButton, ElIcon, ElInput, ElMessage, ElTabPane, ElTabs, ElUpload } from 'element-plus';
import { websiteName } from '@/utils/website-name';
import { ArrowLeftBold, DocumentAdd, Search, UploadFilled } from '@element-plus/icons-vue';
import { uploadImageApi } from '@/utils/image';
import { useTypedStorage } from '@/utils/typed-storage';
import { isString } from '@/utils/types';
import UserInfoDropdown from '@/components/UserInfoDropdown.vue';
import MdBox from '@/components/MdBox.vue';
import { uploadQuestionApi } from '@/utils/question';
import { useRouter } from 'vue-router';

const router = useRouter();
const title = useTypedStorage('poesy-editor-title', isString);
const editorContent = useTypedStorage('poesy-editor-content', isString);

function pushImage(url: string) {
  const urlObj = new URL(url, window.location.href);
  const filename = urlObj.pathname.split('/').pop();
  // Push markdown image syntax to the editor content
  editorContent.value += `\n![${filename}](${url})`;
}
const fontFamily = 'Consolas, Monaco, \" Andale Mono\", \"Ubuntu Mono\" , monospace';

async function submit(type: 'question' | 'article') {
  const titleValue = title.value ?? '';
  const editorContentValue = editorContent.value ?? '';
  if (titleValue === '') {
    ElMessage.error('标题不能为空');
    return;
  }
  if (editorContentValue === '') {
    ElMessage.error('内容不能为空');
    return;
  }
  if (type === 'question') {
    const response = await uploadQuestionApi(titleValue, editorContentValue);
    if (response.isErr()) {
      ElMessage.error(response.unwrapErr().message);
    } else {
      ElMessage.success('提问成功');
      title.value = '';
      editorContent.value = '';
      const questionId = response.unwrap().id;
      router.push({
        path: '/question/',
        query: {
          id: questionId,
        },
      });
    }
  } else {
    ElMessage.error('暂未实现');
  }
}
</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>
        <ElButton :type="'danger'" :plain="true" :icon="ArrowLeftBold" @click="$router.push('/')"></ElButton>
      </HeaderText>
      <HeaderText>{{ websiteName }} - 编辑器</HeaderText>
    </template>
    <template #header-extra>
      <UserInfoDropdown></UserInfoDropdown>
      <SwitchDark></SwitchDark>
    </template>
    <FlexCard>
      <ElButton :icon="Search" :type="'danger'" :plain="true" @click="submit('question')">添加为提问</ElButton>
      <ElButton :icon="DocumentAdd" :type="'primary'" :plain="true">发布为文章</ElButton>
      <ElInput v-model="title" :style="{ marginTop: '15px' }">
        <template #prepend>
          <span>标题</span>
        </template>
      </ElInput>
    </FlexCard>
    <FlexBox>
      <ElTabs>
        <ElTabPane label="Markdown">
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
        <ElTabPane label="Preview">
          <MdBox :content="editorContent ?? ''"></MdBox>
        </ElTabPane>
      </ElTabs>
    </FlexBox>
    <div :style="{
      height: '90vh',
    }">
      <!-- extra-scroll -->
    </div>
  </PageLayout>
</template>
