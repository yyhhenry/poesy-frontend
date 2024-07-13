<script setup lang="ts">
import { computedAsync } from '@vueuse/core';
import { PageLayout, FlexCard, HeaderText, SwitchDark, FlexBox, } from '@yyhhenry/element-extra';
import { ok, type Result, anyhow } from '@yyhhenry/rust-result';
import { ElButton, ElTabPane, ElTabs } from 'element-plus';
import { computed } from 'vue';
import { DocumentAdd, HomeFilled } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { getArticleApi } from '@/utils/article';
import MdBox from '@/components/MdBox.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import { useTypedStorage } from '@/utils/typed-storage';
import { isString } from '@/utils/types';
import UserInfoDropdown from '@/components/UserInfoDropdown.vue';

const router = useRouter();
const route = useRoute();
const articleId = computed((): Result<string, Error> => {
  const id = route.query.id;
  if (typeof id === 'string') {
    return ok(id);
  }
  return anyhow('文章 ID 不能为空');
});

const article = computedAsync(async () => {
  if (articleId.value.isErr()) {
    return anyhow(articleId.value.unwrapErr().message);
  }
  const id = articleId.value.unwrap();
  return await getArticleApi(id);
}, anyhow('文章加载中'));
</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>
        <ElButton :type="'danger'" :plain="true" :icon="HomeFilled" @click="$router.push('/')"></ElButton>
      </HeaderText>
      <HeaderText>
        <span>Poesy - 文章：</span>
        <span v-if="article.isOk()" :style="{ userSelect: 'all' }">{{ article.unwrap().title }}</span>
      </HeaderText>
    </template>
    <template #header-extra>
      <UserInfoDropdown></UserInfoDropdown>
      <SwitchDark></SwitchDark>
    </template>
    <FlexCard v-if="article.isOk()">
      <template #header>
        <HeaderText>
          <span>By </span>
          <span class="by-user" @click="$router.push({
            path: '/user/',
            query: {
              email: article.unwrap().authorEmail,
            }
          })">
            {{ article.unwrap().authorEmail }}
          </span>
        </HeaderText>
        <p :style="{ marginTop: '10px' }">{{ new Date(article.unwrap().createdTime).toLocaleString() }}</p>
      </template>
      <MdBox :content="article.unwrap().content">
      </MdBox>
    </FlexCard>
    <FlexCard v-else>
      <HeaderText>
        {{ article.unwrapErr().message }}
      </HeaderText>
    </FlexCard>
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
