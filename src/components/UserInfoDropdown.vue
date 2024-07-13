<script setup lang="ts">
import { HeaderText } from '@yyhhenry/element-extra';
import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessageBox,
} from 'element-plus';
import { logoutApi } from '@/utils/fetch';
import { userInfo } from '@/utils/fetch';

async function attemptLogout() {
  await ElMessageBox.confirm('确定要退出吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await logoutApi();
  });
}
</script>

<template>
  <ElDropdown v-if="userInfo.isOk()" :style="{ margin: '10px' }">
    <HeaderText :font-size="'12pt'" :style="{ cursor: 'pointer' }">
      {{ userInfo.unwrap().email }}
    </HeaderText>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem @click="$router.push({
          path: '/user/',
          query: {
            email: userInfo.unwrap().email,
          }
        })"> 个人信息 </ElDropdownItem>
        <ElDropdownItem @click="attemptLogout"> 退出 </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
  <span v-else>
    <ElButton :type="'primary'" :style="{ margin: '15px' }" @click="$router.push('/login')">登录/注册</ElButton>
  </span>
</template>
