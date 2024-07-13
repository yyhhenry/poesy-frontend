<script setup lang="ts">
import { computedAsync } from '@vueuse/core';
import { PageLayout, FlexCard, HeaderText, SwitchDark, FlexBox } from '@yyhhenry/element-extra';
import { ok, type Result, anyhow } from '@yyhhenry/rust-result';
import { ElButton, ElDivider, ElInput, ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import { HomeFilled } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { getArticleApi, getArticleCommentsApi, uploadArticleCommentApi } from '@/utils/article';
import MdBox from '@/components/MdBox.vue';
import UserInfoDropdown from '@/components/UserInfoDropdown.vue';

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

const uploadCommentCount = ref(0);

const comments = computedAsync(async () => {
  uploadCommentCount.value; // trigger reactivity
  if (articleId.value.isErr()) {
    return anyhow(articleId.value.unwrapErr().message);
  }
  const id = articleId.value.unwrap();
  return await getArticleCommentsApi(id);
}, anyhow('评论加载中'));


const commentContent = ref('');

async function uploadComment() {
  if (articleId.value.isErr()) {
    return;
  }
  const content = commentContent.value;
  if (content === '') {
    ElMessage.error('评论内容不能为空');
    return;
  }
  const id = articleId.value.unwrap();
  await uploadArticleCommentApi(id, content);
  commentContent.value = '';
  uploadCommentCount.value++;
}
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
    <FlexCard v-if="comments.isOk()">
      <ElInput v-model="commentContent" :placeholder="'写下你的评论'">
        <template #append>
          <ElButton :type="'primary'" @click="uploadComment">评论</ElButton>
        </template>
      </ElInput>
      <div v-for="comment in comments.unwrap().comments" :key="comment.id">
        <ElDivider></ElDivider>
        <div>
          <p>
            <span>By </span>
            <span class="by-user" @click="$router.push({
              path: '/user/',
              query: {
                email: comment.authorEmail,
              }
            })">
              {{ comment.authorEmail }}
            </span>
            <span> | </span>
            <span>{{ new Date(comment.createdTime).toLocaleString() }}</span>
          </p>
          <p :style="{ marginLeft: '20px', marginTop: '10px' }">{{ comment.content }}</p>
        </div>
      </div>
      <div v-if="comments.unwrap().comments.length === 0">
      </div>
    </FlexCard>
    <FlexBox v-else>
      <p :style="{ margin: '25px' }">{{ comments.unwrapErr().message }}</p>
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
