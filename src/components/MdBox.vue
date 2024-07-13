<script setup lang="ts">
import { FlexBox, HeaderText } from '@yyhhenry/element-extra';
import { md } from '@/utils/md';
import { computed } from 'vue';
import { ElButton, ElMessage } from 'element-plus';
import { CopyDocument } from '@element-plus/icons-vue';
const props = defineProps<{
  content: string;
  copyable?: boolean;
  lang?: string;
}>();
const slots = defineSlots<{
  header?: (_: unknown) => unknown;
}>();
const mdSrc = computed(() => {
  if (props.lang) {
    return `\`\`\`${props.lang}\n${props.content}\n\`\`\``;
  }
  return props.content;
});
const mdHtml = computed(() => md.render(mdSrc.value));
const copy = async () => {
  await navigator.clipboard.writeText(props.content);
  ElMessage.success('Copied to clipboard');
};
</script>
<template>
  <FlexBox>
    <HeaderText>
      <slot v-if="slots.header" name="header"></slot>
      <ElButton v-if="copyable" :style="{ margin: '5px' }" :icon="CopyDocument" @click="copy" circle></ElButton>
    </HeaderText>
    <div :innerHTML="mdHtml" :class="'markdown-html'"></div>
  </FlexBox>
</template>

<style>
.markdown-html pre {
  padding: 15px;
  border-radius: 15px;
  margin: 5px;
  background-color: var(--el-bg-color-page);
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.markdown-html img {
  max-width: 80%;
  border-radius: 15px;
  display: block;
  margin: 15px auto;
}

.markdown-html h1 {
  font-size: 2em;
  margin: 0.67em 0;
  border-bottom: 1px solid var(--el-border-color);
  transition: border-bottom 0.3s;
}

.markdown-html h1:hover {
  border-bottom: 1px solid var(--el-text-color-primary);
}

.markdown-html h2 {
  font-size: 1.5em;
  margin: 0.83em 0;
  border-bottom: 1px dashed var(--el-border-color);
  transition: border-bottom 0.3s;
}

.markdown-html h2:hover {
  border-bottom: 1px dashed var(--el-text-color-primary);
}
</style>
