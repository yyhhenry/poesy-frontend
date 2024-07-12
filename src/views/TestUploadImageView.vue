<script setup lang="ts">
import { PageLayout, FlexCard, HeaderText, SwitchDark, } from '@yyhhenry/element-extra';
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu, ElIcon, ElImage, ElMessage, ElUpload } from 'element-plus';
import { websiteName } from '@/utils/website-name';
import { computedAsync } from '@vueuse/core';
import { tokenInfoApi, logoutApi } from '@/utils/fetch';
import { anyhow } from '@yyhhenry/rust-result';
import { tokenPairStorage } from '@/utils/fetch';
import { UploadFilled } from '@element-plus/icons-vue';
import { uploadImageApi } from '@/utils/image';
import { useTypedStorage } from '@/utils/typed-storage';
import { isStringArray } from '@/utils/types';

const info = computedAsync(() => {
  tokenPairStorage.value;
  return tokenInfoApi();
}, anyhow('获取用户信息中'));
const imgList = useTypedStorage('img-list', isStringArray);
function pushImgList(url: string) {
  imgList.value ??= [];
  imgList.value.push(url);
}
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
      <ElUpload :drag="true" :accept="'.jpg,.jpeg,.png'" :show-file-list="false" :http-request="async (options) => {
        const response = await uploadImageApi(options.file);
        if (response.isErr()) {
          ElMessage.error(response.unwrapErr().message);
          return;
        }
        ElMessage.success('上传成功');
        pushImgList(response.unwrap().url);
      }">
        <ElIcon class="el-icon--upload">
          <UploadFilled></UploadFilled>
        </ElIcon>
        <div class="el-upload__text">
          拖放文件到此处，或<em>点击上传</em>
        </div>
      </ElUpload>
    </FlexCard>
    <FlexCard v-if="imgList !== undefined && imgList.length != 0">
      <ElImage v-for="url in imgList" :key="url" :src="url"></ElImage>
    </FlexCard>
  </PageLayout>
</template>
