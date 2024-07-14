<script setup lang="ts">
import { computedAsync } from '@vueuse/core';
import { PageLayout, FlexCard, HeaderText, SwitchDark, FlexBox, } from '@yyhhenry/element-extra';
import { ok, type Result, anyhow, safelyAsync } from '@yyhhenry/rust-result';
import { ElButton, ElMessage, ElMessageBox, ElTabPane, ElTabs } from 'element-plus';
import { computed, ref } from 'vue';
import { ChatDotRound, DocumentAdd, HomeFilled } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { getQuestionApi } from '../utils/question';
import MdBox from '@/components/MdBox.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import UserInfoDropdown from '@/components/UserInfoDropdown.vue';
import { answerContentCache, getAnswersByQuestionApi, UploadAnswerApi } from '@/utils/answer';
import { userInfo } from '@/utils/fetch';
import { askQwen } from '@/utils/qwen';

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
    if (userInfo.value.isErr()) {
      return '';
    }
    const email = userInfo.value.unwrap().email;
    const key = `${email}:${id}`;
    return answerContentCache.value?.[key] ?? '';
  },
  set: (value: string) => {
    if (questionId.value.isErr()) {
      return;
    }
    const id = questionId.value.unwrap();
    if (userInfo.value.isErr()) {
      return;
    }
    const email = userInfo.value.unwrap().email;
    const key = `${email}:${id}`;
    answerContentCache.value ??= {};
    answerContentCache.value[key] = value;
    if (value === '') {
      delete answerContentCache.value[key];
    }
  }
});

const answersTab = ref<'view-answers' | 'upload-answer'>('view-answers');
const qwenCount = ref(0);
const qwenAnswering = ref(false);

function stopQwenAnswer() {
  qwenCount.value++;
  qwenAnswering.value = false;
}

async function qwenAnswer() {
  if (question.value.isErr()) {
    return;
  }
  const questionTitle = question.value.unwrap().title;
  const questionContent = question.value.unwrap().content;
  qwenAnswering.value = true;
  qwenCount.value++;
  const thisCount = qwenCount.value;
  if (answerContent.value !== '') {
    answerContent.value += '\n\n';
  }
  answerContent.value += '';
  await askQwen(JSON.stringify({
    task: '你是Poesy网站(Quora+Poe)的问答AI助手Qwen，现在用户正在回答一个问题，要求你补全他的回答（如果answerContent为空则是从头开始回答），你不需要重复用户的回答，你的回答应该以\"Qwen: \"开头 将会被插入到用户回答的下一段',
    questionTitle,
    questionContent,
    answerContent: answerContent.value,
  }), {
    onMsg: (msg) => {
      if (qwenCount.value !== thisCount) return;
      answerContent.value += msg.response;
    },
    onDone: () => {
      if (qwenCount.value !== thisCount) return;
      qwenAnswering.value = false;
    },
  });
}

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
            <span>
              <ElButton :type="'primary'" :plain="true" :size="'large'" :icon="ChatDotRound" @click="qwenAnswer"
                v-if="!qwenAnswering">
                Qwen 补全
              </ElButton>
              <ElButton :type="'danger'" :plain="true" :size="'large'" :icon="ChatDotRound" @click="stopQwenAnswer"
                v-if="qwenAnswering">
                停止 Qwen
              </ElButton>
            </span>
            <ElButton :type="'primary'" :plain="true" :size="'large'" :icon="DocumentAdd" @click="uploadAnswer"
              v-if="!qwenAnswering">提交
            </ElButton>
          </div>
          <MarkdownEditor :only-preview="qwenAnswering" v-model="answerContent" :placeholder="'请输入回答内容'">
          </MarkdownEditor>
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
