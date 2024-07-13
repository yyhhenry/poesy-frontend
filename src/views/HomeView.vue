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
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessageBox,
} from 'element-plus';
import { websiteName } from '@/utils/website-name';
import { computedAsync } from '@vueuse/core';
import { tokenInfoApi, logoutApi } from '@/utils/fetch';
import { anyhow, type Result } from '@yyhhenry/rust-result';
import { tokenPairStorage, userInfo } from '@/utils/fetch';
import {
  getQwenRole,
  qwenGreeting,
  qwenRole,
  toggleQwenRole,
} from '@/utils/qwen';
import { ref, watch, watchEffect } from 'vue';
import { DocumentAdd, Plus, Refresh, UploadFilled } from '@element-plus/icons-vue';
import UserInfoDropdown from '@/components/UserInfoDropdown.vue';

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
</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>{{ websiteName }}</HeaderText>
    </template>
    <template #header-extra>
      <HeaderText>
        <ElButton :type="'primary'" :size="'large'" :circle="true" :icon="Plus" @click="$router.push('/editor')">
        </ElButton>
      </HeaderText>
      <UserInfoDropdown></UserInfoDropdown>
      <SwitchDark></SwitchDark>
    </template>
    <FlexCard v-if="greeting.isOk()">
      <template #header>
        <span :style="{ margin: '15px' }"> Qwen的问候 </span>
        <ElButton @click="refreshGreeting" :type="'primary'" :plain="true" :circle="true" :icon="Refresh"></ElButton>
        <ElButton :style="{}" @click="attemptToggleQwenRole" :type="'info'" :text="true">当前人设：{{ getQwenRole() }}
        </ElButton>
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
  </PageLayout>
</template>
