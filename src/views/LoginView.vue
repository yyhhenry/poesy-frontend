<script setup lang="ts">
import { loginApi, registerApi, userExistsApi, type User } from '@/utils/fetch';
import { computedAsync, useDebounce, useStorage } from '@vueuse/core';
import { PageLayout, FlexCard, HeaderText, SwitchDark, } from '@yyhhenry/element-extra';
import { ok, err, type Result, anyhow } from '@yyhhenry/rust-result';
import { ElButton, ElInput, ElMessage, ElTabPane, ElTabs } from 'element-plus';
import { computed, ref } from 'vue';
import { ArrowLeftBold } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const mode = useStorage<'register' | 'login'>('login-mode', 'register');
const email = ref('');
const password = ref('');
const debouncedEmail = useDebounce(email, 300, { maxWait: 2000 });
const debouncedPassword = useDebounce(password, 300, { maxWait: 2000 });
async function checkEmail(email: string): Promise<Result<[], Error>> {
  mode.value; // required to trigger reactivity
  if (email === '') {
    return anyhow('邮箱不能为空');
  }
  const reg = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;
  if (!reg.test(email)) {
    return anyhow('邮箱格式不正确');
  }
  const isUserExists = await userExistsApi(email);
  if (isUserExists.isErr()) {
    return err(isUserExists.unwrapErr());
  }
  if (isUserExists.unwrap() && mode.value === 'register') {
    return anyhow(`邮箱 ${email} 已被注册`);
  }
  if (!isUserExists.unwrap() && mode.value === 'login') {
    return anyhow(`邮箱 ${email} 未注册`);
  }
  return ok([]);
}

function checkPassword(password: string): Result<[], Error> {
  if (password === '') {
    return anyhow('密码不能为空');
  }
  if (password.length < 6) {
    return anyhow('密码长度不能小于 6 个字符');
  }
  if (password.length > 20) {
    return anyhow('密码长度不能超过 20 个字符');
  }
  return ok([]);
}
const emailInfo = computedAsync<Result<[], Error>>(
  () => checkEmail(debouncedEmail.value),
  ok([]),
);
const passwordInfo = computed<Result<[], Error>>(() =>
  checkPassword(debouncedPassword.value),
);
async function checkedForm(): Promise<Result<User, Error>> {
  return (await checkEmail(email.value))
    .andThen(() => checkPassword(password.value))
    .map((): User => ({
      email: email.value,
      password: password.value,
    }));
}
async function register() {
  const user = await checkedForm();
  if (user.isErr()) {
    ElMessage.error(user.unwrapErr().message);
    return;
  }
  ElMessage.info('正在连接服务器...');
  const registerResponse = await registerApi(user.unwrap());
  if (registerResponse.isErr()) {
    ElMessage.error(registerResponse.unwrapErr().message);
    return;
  }
  ElMessage.success('注册成功');
  router.push({
    path: '/verify',
    query: {
      email: email.value,
    },
  });
}
async function login() {
  const user = await checkedForm();
  if (user.isErr()) {
    ElMessage.error(user.unwrapErr().message);
    return;
  }
  const registerResponse = await loginApi(user.unwrap());
  if (registerResponse.isErr()) {
    ElMessage.error(registerResponse.unwrapErr().message);
    return;
  }
  ElMessage.success('登录成功');
  router.push('/');
}
async function submit() {
  if (mode.value === 'register') {
    await register();
  } else {
    await login();
  }
}
</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>
        <ElButton :type="'danger'" :plain="true" :icon="ArrowLeftBold" @click="$router.push('/')"></ElButton>
      </HeaderText>
      <HeaderText>注册 / 登录</HeaderText>

    </template>
    <template #header-extra>
      <SwitchDark></SwitchDark>
    </template>
    <FlexCard>
      <div :style="{ margin: '25px' }">
        <ElTabs v-model="mode">
          <ElTabPane name="register" label="注册"></ElTabPane>
          <ElTabPane name="login" label="登录"></ElTabPane>
        </ElTabs>
        <ElInput v-model="email" placeholder="Email" :style="{ marginBottom: '15px' }">
          <template #suffix>
            <p :style="{ color: 'var(--el-color-danger)' }" v-if="emailInfo.isErr()">
              {{ emailInfo.unwrapErr().message }}
            </p>
          </template>
        </ElInput>
        <ElInput :show-password="true" type="password" v-model="password" placeholder="密码"
          :style="{ marginBottom: '15px' }">
          <template #suffix>
            <p :style="{ color: 'var(--el-color-danger)' }" v-if="passwordInfo.isErr()">
              {{ passwordInfo.unwrapErr().message }}
            </p>
          </template>
        </ElInput>

        <div :style="{ display: 'flex', 'justify-content': 'center' }">
          <ElButton v-if="mode === 'register'" type="danger" @click="register"> 注册 </ElButton>
          <ElButton v-else type="primary" @click="login"> 登录 </ElButton>
        </div>
      </div>
    </FlexCard>
  </PageLayout>
</template>
