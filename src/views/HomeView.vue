<script setup lang="ts">
import { PageLayout, FlexCard, HeaderText, SwitchDark, } from '@yyhhenry/element-extra';
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus';
import { websiteName } from '@/utils/website-name';
import { computedAsync } from '@vueuse/core';
import { tokenInfoApi, logoutApi } from '@/utils/fetch';
import { anyhow } from '@yyhhenry/rust-result';
import { tokenPairStorage } from '@/utils/fetch';

const info = computedAsync(() => {
  tokenPairStorage.value;
  return tokenInfoApi();
}, anyhow('获取用户信息中'));

</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>{{ websiteName }}</HeaderText>
    </template>
    <template #header-extra>
      <ElDropdown v-if="info.isOk()" :style="{ margin: '10px' }">
        <HeaderText :font-size="'12pt'" :style="{ cursor: 'pointer' }">
          {{ info.unwrap().email }}
        </HeaderText>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem @click="logoutApi">
              退出
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <span v-else>
        <span>{{ info.unwrapErr().message }}</span>
        <ElButton :type="'primary'" :style="{ margin: '15px' }" @click="$router.push('/login')">登录/注册</ElButton>
      </span>

      <SwitchDark></SwitchDark>
    </template>
    <FlexCard>
      首页
    </FlexCard>
  </PageLayout>
</template>
