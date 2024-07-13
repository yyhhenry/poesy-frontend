<script setup lang="ts">
import { PageLayout, FlexCard, HeaderText, SwitchDark, FlexBox, } from '@yyhhenry/element-extra';
import { ElButton, ElInput, ElMessage, ElMessageBox } from 'element-plus';
import { websiteName } from '@/utils/website-name';
import { DocumentAdd, HomeFilled, Search } from '@element-plus/icons-vue';
import { useTypedStorage } from '@/utils/typed-storage';
import { isString } from '@/utils/types';
import UserInfoDropdown from '@/components/UserInfoDropdown.vue';

import { uploadQuestionApi } from '@/utils/question';
import { useRouter } from 'vue-router';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import { safelyAsync } from '@yyhhenry/rust-result';
import { uploadArticleApi } from '@/utils/article';

const router = useRouter();
const title = useTypedStorage('poesy-editor-title', isString);
const editorContent = useTypedStorage('poesy-editor-content', isString);

async function submit(submitType: '提问' | '文章') {
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
  const confirmResult = await safelyAsync(() => ElMessageBox.confirm(`确定要添加为${submitType}吗？`, '提交', {
    type: 'warning',
  }));
  if (confirmResult.isErr()) {
    return;
  }
  if (submitType === '提问') {
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
    const response = await uploadArticleApi(titleValue, editorContentValue);
    if (response.isErr()) {
      ElMessage.error(response.unwrapErr().message);
    } else {
      ElMessage.success('发布成功');
      title.value = '';
      editorContent.value = '';
      const articleId = response.unwrap().id;
      router.push({
        path: '/article/',
        query: {
          id: articleId,
        },
      });
    }
  }
}
</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>
        <ElButton :type="'danger'" :plain="true" :icon="HomeFilled" @click="$router.push('/')"></ElButton>
      </HeaderText>
      <HeaderText>{{ websiteName }} - 编辑器</HeaderText>
    </template>
    <template #header-extra>
      <UserInfoDropdown></UserInfoDropdown>
      <SwitchDark></SwitchDark>
    </template>
    <FlexCard>
      <ElButton :icon="Search" :type="'danger'" :plain="true" @click="submit('提问')">添加为提问</ElButton>
      <ElButton :icon="DocumentAdd" :type="'primary'" :plain="true" @click="submit('文章')">发布为文章</ElButton>
      <ElInput v-model="title" :style="{ marginTop: '15px' }">
        <template #prepend>
          <span>标题</span>
        </template>
      </ElInput>
    </FlexCard>
    <FlexBox>
      <MarkdownEditor v-model="editorContent"></MarkdownEditor>
    </FlexBox>
    <div :style="{
      height: '90vh',
    }">
      <!-- extra-scroll -->
    </div>
  </PageLayout>
</template>
