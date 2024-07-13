<script setup lang="ts">
import { HeaderText } from '@yyhhenry/element-extra';
import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
} from 'element-plus';
import { logoutApi } from '@/utils/fetch';
import { userInfo } from '@/utils/fetch';
</script>

<template>
  <ElDropdown v-if="userInfo.isOk()" :style="{ margin: '10px' }">
    <HeaderText :font-size="'12pt'" :style="{ cursor: 'pointer' }">
      {{ userInfo.unwrap().email }}
    </HeaderText>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem @click="logoutApi"> 退出 </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
  <span v-else>
    <span>{{ userInfo.unwrapErr().message }}</span>
    <ElButton :type="'primary'" :style="{ margin: '15px' }" @click="$router.push('/login')">登录/注册</ElButton>
  </span>
</template>
