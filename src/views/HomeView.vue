<script setup lang="ts">
import { PageLayout, FlexCard, HeaderText, SwitchDark, } from '@yyhhenry/element-extra';
import { ElButton } from 'element-plus';
import { websiteName } from '@/utils/website-name';

</script>

<template>
  <PageLayout>
    <template #header>
      <HeaderText>{{ websiteName }}</HeaderText>
    </template>
    <template #header-extra>
      <ElButton :type="'primary'" :style="{ margin: '15px' }" @click="$router.push('/register')">注册</ElButton>
      <SwitchDark></SwitchDark>
    </template>
    <FlexCard>
      首页
    </FlexCard>
  </PageLayout>
</template>
