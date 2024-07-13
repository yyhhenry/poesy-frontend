<script setup lang="ts">
import { computedAsync } from '@vueuse/core';
import { PageLayout, FlexCard, HeaderText, SwitchDark, FlexBox, } from '@yyhhenry/element-extra';
import { ok, type Result, anyhow } from '@yyhhenry/rust-result';
import { ElButton, ElTabPane, ElTabs } from 'element-plus';
import { computed } from 'vue';
import { DocumentAdd, HomeFilled } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { getQuestionApi } from '../utils/question';
import MdBox from '@/components/MdBox.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import { useTypedStorage } from '@/utils/typed-storage';
import { isString } from '@/utils/types';

const router = useRouter();
const route = useRoute();
const questionId = computed((): Result<string, Error> => {
  const questionId = route.query.id;
  if (typeof questionId === 'string') {
    return ok(questionId);
  }
  return anyhow('问题 ID 不能为空');
});

const question = computedAsync(async () => {
  if (questionId.value.isErr()) {
    return anyhow(questionId.value.unwrapErr().message);
  }
  const id = questionId.value.unwrap();
  return await getQuestionApi(id);
}, anyhow('问题加载中'));

const answerContent = useTypedStorage('poesy-answer-content', isString);
</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>
        <ElButton :type="'danger'" :plain="true" :icon="HomeFilled" @click="$router.push('/')"></ElButton>
      </HeaderText>
      <HeaderText>
        <span>Poesy - 问题：</span>
        <span v-if="question.isOk()">{{ question.unwrap().title }}</span>
      </HeaderText>
    </template>
    <template #header-extra>
      <SwitchDark></SwitchDark>
    </template>
    <FlexCard v-if="question.isOk()">
      <template #header>
        <HeaderText>
          <span>By </span>
          <span class="by-user" @click="$router.push({
            path: '/user/',
            query: {
              email: question.unwrap().authorEmail,
            }
          })">
            {{ question.unwrap().authorEmail }}
          </span>
        </HeaderText>
        <p :style="{ marginTop: '10px' }">{{ new Date(question.unwrap().createdTime).toLocaleString() }}</p>
      </template>
      <MdBox :content="question.unwrap().content">
      </MdBox>
    </FlexCard>
    <FlexCard v-else>
      <HeaderText>
        {{ question.unwrapErr().message }}
      </HeaderText>
    </FlexCard>
    <FlexBox v-if="question.isOk()">
      <ElTabs :tab-position="'left'">
        <ElTabPane label="查看回答"></ElTabPane>
        <ElTabPane label="新建回答">
          <div :style="{ display: 'flex', justifyContent: 'space-between' }">
            <HeaderText>
              正在回答：{{ question.unwrap().title }}
            </HeaderText>
            <ElButton :type="'primary'" :plain="true" :size="'large'" :icon="DocumentAdd">提交</ElButton>
          </div>
          <MarkdownEditor v-model="answerContent" :placeholder="'请输入回答内容'"></MarkdownEditor>
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
<style scoped>
.by-user {
  border-bottom: 1px dashed var(--el-color-primary);
  transition: color 0.3s, border-bottom 0.3s;
}

.by-user:hover {
  cursor: pointer;
  color: var(--el-color-primary);
  border-bottom: 1px solid var(--el-color-primary);
}
</style>
