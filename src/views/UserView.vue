<script setup lang="ts">
import { computedAsync } from '@vueuse/core';
import { PageLayout, FlexCard, HeaderText, SwitchDark, FlexBox, } from '@yyhhenry/element-extra';
import { ok, type Result, anyhow } from '@yyhhenry/rust-result';
import { ElButton, ElTabPane, ElTabs } from 'element-plus';
import { computed } from 'vue';
import { HomeFilled } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { getQuestionsByApi } from '@/utils/question';
import { getArticlesByApi } from '@/utils/article';
import UserInfoDropdown from '@/components/UserInfoDropdown.vue';

const route = useRoute();
const email = computed((): Result<string, Error> => {
  const email = route.query.email;
  if (typeof email === 'string') {
    return ok(email);
  }
  return anyhow('邮箱不能为空');
});
const questionBriefs = computedAsync(async () => {
  if (email.value.isErr()) {
    return anyhow(email.value.unwrapErr().message);
  }
  const userEmail = email.value.unwrap();
  return await getQuestionsByApi(userEmail);
}, anyhow('问题列表加载中'));
const articleBriefs = computedAsync(async () => {
  if (email.value.isErr()) {
    return anyhow(email.value.unwrapErr().message);
  }
  const userEmail = email.value.unwrap();
  return await getArticlesByApi(userEmail);
}, anyhow('文章列表加载中'));
</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>
        <ElButton :type="'danger'" :plain="true" :icon="HomeFilled" @click="$router.push('/')"></ElButton>
      </HeaderText>
      <HeaderText>
        <span>用户 - </span>
        <span :style="{ userSelect: 'all' }">{{ email.isOk() ? email.unwrap() : email.unwrapErr().message }}</span>
      </HeaderText>
    </template>
    <template #header-extra>
      <UserInfoDropdown></UserInfoDropdown>
      <SwitchDark></SwitchDark>
    </template>
    <FlexBox>
      <ElTabs>
        <ElTabPane label="TA的提问">
          <div v-if="questionBriefs.isOk()">
            <div v-for="questionBrief of questionBriefs.unwrap().questionBriefs" :key="questionBrief.id">
              <FlexCard>
                <HeaderText class="brief" @click="$router.push({
                  path: '/question/',
                  query: {
                    id: questionBrief.id,
                  }
                })">
                  <span>问题：{{ questionBrief.title }}</span>
                </HeaderText>
                <p :style="{ marginTop: '10px' }">{{ new Date(questionBrief.createdTime).toLocaleString() }}</p>
              </FlexCard>
            </div>
            <div v-if="questionBriefs.unwrap().questionBriefs.length === 0">
              <p :style="{ margin: '15px' }">TA还没有提问</p>
            </div>
          </div>
          <div v-else>
            <p>{{ questionBriefs.unwrapErr().message }}</p>
          </div>
        </ElTabPane>
        <ElTabPane label="TA的文章">
          <div v-if="articleBriefs.isOk()">
            <div v-for="articleBrief of articleBriefs.unwrap().articleBriefs" :key="articleBrief.id">
              <FlexCard>
                <HeaderText class="brief" @click="$router.push({
                  path: '/article/',
                  query: {
                    id: articleBrief.id,
                  }
                })">
                  <span>文章：{{ articleBrief.title }}</span>
                </HeaderText>
                <p :style="{ marginTop: '10px' }">{{ new Date(articleBrief.createdTime).toLocaleString() }}</p>
              </FlexCard>
            </div>
            <div v-if="articleBriefs.unwrap().articleBriefs.length === 0">
              <p :style="{ margin: '15px' }">TA还没有文章</p>
            </div>
          </div>
          <div v-else>
            <p>{{ articleBriefs.unwrapErr().message }}</p>
          </div>
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
.brief {
  border-bottom: 1px dashed var(--el-color-info);
  transition: background-color 0.3s, border-bottom 0.3s;
}

.brief:hover {
  cursor: pointer;
  background-color: var(--el-color-info-lighten-5);
  border-bottom: 1px solid var(--el-color-info);
}
</style>
