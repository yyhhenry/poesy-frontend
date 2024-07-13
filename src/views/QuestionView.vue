<script setup lang="ts">
import { computedAsync } from '@vueuse/core';
import { PageLayout, FlexCard, HeaderText, SwitchDark, FlexBox, } from '@yyhhenry/element-extra';
import { ok, type Result, anyhow, safelyAsync } from '@yyhhenry/rust-result';
import { ElButton, ElMessage, ElMessageBox, ElTabPane, ElTabs } from 'element-plus';
import { computed, ref } from 'vue';
import { DocumentAdd, HomeFilled } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { getQuestionApi } from '../utils/question';
import MdBox from '@/components/MdBox.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import { useTypedStorage } from '@/utils/typed-storage';
import { isString } from '@/utils/types';
import UserInfoDropdown from '@/components/UserInfoDropdown.vue';
import { answerContentCache, getAnswersByQuestionApi, UploadAnswerApi } from '@/utils/answer';

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

const uploadCount = ref(0);

const answers = computedAsync(async () => {
  uploadCount.value; // trigger reactivity
  if (questionId.value.isErr()) {
    return anyhow(questionId.value.unwrapErr().message);
  }
  const id = questionId.value.unwrap();
  return await getAnswersByQuestionApi(id);
}, anyhow('回答加载中'));

const answerContent = computed({
  get: () => {
    if (questionId.value.isErr()) {
      return '';
    }
    const id = questionId.value.unwrap();
    return answerContentCache.value?.[id] ?? '';
  },
  set: (value: string) => {
    if (questionId.value.isErr()) {
      return;
    }
    const id = questionId.value.unwrap();
    answerContentCache.value ??= {};
    answerContentCache.value[id] = value;
  }
});

const answersTab = ref<'view-answers' | 'upload-answer'>('view-answers');

async function uploadAnswer() {
  if (questionId.value.isErr()) {
    ElMessage.error(questionId.value.unwrapErr().message);
    return;
  }
  const content = answerContent.value ?? '';
  if (content === '') {
    ElMessage.error('回答内容不能为空');
    return;
  }
  const confirmResult = await safelyAsync(() => ElMessageBox.confirm('确定要提交回答吗？', '提交', {
    type: 'warning',
  }));
  if (confirmResult.isErr()) {
    return;
  }
  const response = await UploadAnswerApi(questionId.value.unwrap(), content);
  if (response.isErr()) {
    ElMessage.error(response.unwrapErr().message);
    return;
  }
  answersTab.value = 'view-answers';
  answerContent.value = '';
  uploadCount.value++;
}
</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>
        <ElButton :type="'danger'" :plain="true" :icon="HomeFilled" @click="$router.push('/')"></ElButton>
      </HeaderText>
      <HeaderText>
        <span>Poesy - 问题：</span>
        <span v-if="question.isOk()" :style="{ userSelect: 'all' }">{{ question.unwrap().title }}</span>
      </HeaderText>
    </template>
    <template #header-extra>
      <UserInfoDropdown></UserInfoDropdown>
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
      <ElTabs :tab-position="'left'" v-model="answersTab">
        <ElTabPane label="查看回答" name="view-answers">
          <div v-if="answers.isOk()">
            <FlexCard v-for="answer in answers.unwrap().answers" :key="answer.id">
              <template #header>
                <HeaderText>
                  <span>回答 By </span>
                  <span class="by-user" @click="$router.push({
                    path: '/user/',
                    query: {
                      email: answer.authorEmail,
                    }
                  })">
                    {{ answer.authorEmail }}
                  </span>
                </HeaderText>
                <p :style="{ marginTop: '10px' }">{{ new Date(question.unwrap().createdTime).toLocaleString() }}</p>
              </template>
              <MdBox :content="answer.content"></MdBox>
            </FlexCard>

            <p :style="{ margin: '25px' }" v-if="answers.unwrap().answers.length === 0">
              暂无回答
            </p>
          </div>

          <div v-else>
            <p :style="{ margin: '25px' }">
              {{ answers.unwrapErr().message }}
            </p>
          </div>

        </ElTabPane>
        <ElTabPane label="新建回答" name="upload-answer">
          <div :style="{ display: 'flex', justifyContent: 'space-between' }">
            <HeaderText>
              正在回答：{{ question.unwrap().title }}
            </HeaderText>
            <ElButton :type="'primary'" :plain="true" :size="'large'" :icon="DocumentAdd" @click="uploadAnswer">提交
            </ElButton>
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
