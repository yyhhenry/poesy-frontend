<template>
  <PageLayout>
    <template #header>
      <HeaderText>
        <ElButton :type="'danger'" :plain="true" :icon="HomeFilled" @click="$router.push('/')"></ElButton>
      </HeaderText>
      <HeaderText>{{ websiteName }} - Qwen</HeaderText>
    </template>

    <template #header-extra>
      <ElDropdown v-if="info.isOk()" :style="{ margin: '10px' }">
        <HeaderText :font-size="'12pt'" :style="{ cursor: 'pointer' }">
          {{ info.unwrap().email }}
        </HeaderText>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem @click="logoutApi"> 退出 </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <span v-else>
        <span>{{ info.unwrapErr().message }}</span>
        <ElButton :type="'primary'" :style="{ margin: '15px' }" @click="$router.push('/login')">登录/注册</ElButton>
      </span>

      <SwitchDark></SwitchDark>

    </template>

    <Chat />

  </PageLayout>
</template>



<script lang="ts" setup>
import Chat from '@/components/ChatQwen.vue';
import {
  PageLayout,
  HeaderText,
  SwitchDark,
} from '@yyhhenry/element-extra';
import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
} from 'element-plus';
import { websiteName } from '@/utils/website-name';
import { computedAsync } from '@vueuse/core';
import { tokenInfoApi, logoutApi } from '@/utils/fetch';
import { anyhow } from '@yyhhenry/rust-result';
import { tokenPairStorage } from '@/utils/fetch';
import { ref, } from 'vue';
import { HomeFilled } from '@element-plus/icons-vue';

const info = computedAsync(() => {
  tokenPairStorage.value;
  return tokenInfoApi();
}, anyhow('获取用户信息中'));
const drawer = ref(false);
</script>

<style scoped>
.header {
  width: 100%;
  background-color: #4a4a4a;
  padding: 15px 0;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin: 0;
}
</style>
