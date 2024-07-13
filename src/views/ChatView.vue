<template>
    <header class="header">
        <h1 class="title">Poesy ai</h1>
    </header>
    <div>
        <Chat />
    </div>
</template>

<script lang="ts" setup>
import Chat from '@/components/ChatQianWen.vue';
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
