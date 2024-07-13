<script setup lang="ts">
import {
  PageLayout,
  FlexCard,
  HeaderText,
  SwitchDark,
  FlexBox,
} from '@yyhhenry/element-extra';
import {
  ElButton,
  ElDivider,
  ElMessage,
  ElMessageBox,
} from 'element-plus';
import { websiteName } from '@/utils/website-name';
import { anyhow, type Result } from '@yyhhenry/rust-result';
import { tokenPairStorage, userInfo } from '@/utils/fetch';
import {
  getQwenRole,
  qwenGreeting,
  toggleQwenRole,
} from '@/utils/qwen';
import { onMounted, ref, watch, watchEffect } from 'vue';
import { ChatDotRound, Plus, Refresh } from '@element-plus/icons-vue';
import UserInfoDropdown from '@/components/UserInfoDropdown.vue';
import { getLatestQuestionsApi, type QuestionsResponse } from '@/utils/question';

const greeting = ref<Result<string, Error>>(anyhow('Qwen的问候正在赶来'));

watchEffect(() => {
  if (tokenPairStorage.value === undefined) {
    greeting.value = anyhow('登录后才能收到Qwen的问候');
    return;
  }
});

async function refreshGreeting() {
  if (userInfo.value.isOk()) {
    greeting.value = await qwenGreeting(userInfo.value.unwrap().email);
  }
}

watch(() => [userInfo.value, getQwenRole()], refreshGreeting, {
  immediate: true,
  deep: true,
});
function attemptToggleQwenRole() {
  ElMessageBox.confirm('确定要切换Qwen的人设吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    toggleQwenRole();
  });
}
const questionBriefs = ref<QuestionsResponse>({
  questionBriefs: [],
});
async function loadMoreQuestions() {
  const response = await getLatestQuestionsApi(questionBriefs.value.questionBriefs.length);
  if (response.isErr()) {
    ElMessage.error(response.unwrapErr().message);
    return;
  }
  const newBriefs = response.unwrap().questionBriefs;
  if (newBriefs.length === 0) {
    ElMessage.info('没有更多问题了');
    return;
  }
  questionBriefs.value.questionBriefs.push(...newBriefs);
}
onMounted(loadMoreQuestions);
</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>{{ websiteName }}</HeaderText>
    </template>
    <template #header-extra>
      <HeaderText v-if="userInfo.isOk()">
        <ElButton :type="'primary'" :size="'large'" :circle="true" :icon="Plus" @click="$router.push('/editor')">
        </ElButton>
      </HeaderText>
      <UserInfoDropdown></UserInfoDropdown>
      <SwitchDark></SwitchDark>
    </template>
    <FlexCard v-if="greeting.isOk()">
      <template #header>
        <div :style="{ display: 'flex', justifyContent: 'space-between' }">
          <span>
            <span :style="{ margin: '15px' }"> Qwen的问候 </span>
            <ElButton @click="refreshGreeting" :type="'primary'" :plain="true" :circle="true" :icon="Refresh">
            </ElButton>
            <ElButton @click="attemptToggleQwenRole" :type="'info'" :text="true">当前人设：{{ getQwenRole() }}
            </ElButton>
          </span>
          <span>
            <ElButton @click="$router.push('/chat')" :type="'info'" :icon="ChatDotRound">开始聊天</ElButton>
          </span>
        </div>
      </template>
      <p>{{ greeting.unwrap() }}</p>
    </FlexCard>
    <FlexBox v-if="greeting.isErr()">
      <div :style="{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60px',
      }">
        <p>{{ greeting.unwrapErr().message }}</p>
      </div>
      <ElDivider></ElDivider>
    </FlexBox>
    <FlexBox>
      <div>
        <div v-for="questionBrief of questionBriefs.questionBriefs" :key="questionBrief.id">
          <FlexCard>
            <HeaderText class="brief" @click="$router.push({
              path: '/question/',
              query: {
                id: questionBrief.id,
              }
            })">
              <span>问题：{{ questionBrief.title }}</span>
            </HeaderText>
            <p :style="{ marginTop: '10px' }">
              <span>By </span>
              <span class="by-user" @click="$router.push({
                path: '/user/',
                query: {
                  email: questionBrief.authorEmail,
                }
              })">{{ questionBrief.authorEmail }}</span>
              <span> | </span>
              <span> {{ new Date(questionBrief.createdTime).toLocaleString() }}</span>
            </p>
          </FlexCard>
        </div>
        <div :style="{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60px',
        }">
          <ElButton @click="loadMoreQuestions" :type="'primary'" :plain="true" :icon="Refresh">
            加载更多
          </ElButton>
        </div>
      </div>
    </FlexBox>
  </PageLayout>
</template>
<style scoped>
.brief {
  border-bottom: 1px dashed var(--el-color-info);
  transition: background-color 0.3s, border-bottom 0.3s;
}

.brief:hover {
  cursor: pointer;
  background-color: var(--el-color-info-lighten-5);
  border-bottom: 1px solid var(--el-color-info);
}

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
