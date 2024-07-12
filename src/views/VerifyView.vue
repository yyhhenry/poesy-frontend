<script setup lang="ts">
import { verifyApi } from '@/utils/fetch';
import { useDebounce } from '@vueuse/core';
import { PageLayout, FlexCard, HeaderText, SwitchDark, } from '@yyhhenry/element-extra';
import { ok, type Result, anyhow } from '@yyhhenry/rust-result';
import { ElButton, ElInput, ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import { ArrowLeftBold } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const email = computed((): Result<string, Error> => {
  const email = route.query.email;
  if (typeof email === 'string') {
    return ok(email);
  }
  return anyhow('邮箱不能为空');
});
const code = ref('');
const debouncedCode = useDebounce(code, 300, { maxWait: 2000 });


function checkCode(code: string): Result<void, Error> {
  if (!/^\d{6}$/.test(code)) {
    return anyhow('验证码必须为 6 位数字');
  }
  return ok();
}
const codeInfo = computed<Result<void, Error>>(() =>
  checkCode(debouncedCode.value),
);
async function verify() {
  if (email.value.isErr()) {
    ElMessage.error(email.value.unwrapErr().message);
    return;
  }
  const response = await verifyApi(email.value.unwrap(), code.value);
  if (response.isErr()) {
    ElMessage.error(response.unwrapErr().message);
    return;
  }
  router.push('/');
}
</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>
        <ElButton :type="'danger'" :plain="true" :icon="ArrowLeftBold" @click="$router.push('/')"></ElButton>
      </HeaderText>
      <HeaderText>验证账号</HeaderText>
    </template>
    <template #header-extra>
      <SwitchDark></SwitchDark>
    </template>
    <FlexCard>
      <div :style="{ margin: '25px' }">
        <ElInput v-model="code" placeholder="验证码" :style="{ marginBottom: '15px' }">
          <template #suffix>
            <p :style="{ color: 'var(--el-color-danger)' }" v-if="codeInfo.isErr()">
              {{ codeInfo.unwrapErr().message }}
            </p>
          </template>
        </ElInput>

        <div :style="{ display: 'flex', 'justify-content': 'center' }">
          <ElButton type="primary" @click="verify">验证</ElButton>
        </div>
      </div>
    </FlexCard>
  </PageLayout>
</template>
