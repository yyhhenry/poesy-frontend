<template>
    <div class="ai-customer-service">
        <div class="chat">
            <div class="messages">
                <div
                    v-for="(message, index) in messages"
                    :key="index"
                    :class="['message', message.role]"
                >
                    <div v-if="index >= 1">
                        <div
                            v-if="
                                message.role === 'assistant' ||
                                message.role === 'system'
                            "
                        >
                            <ElCard class="custom-card">
                                <span>
                                    <img
                                        src="@/assets/icons/ai.png"
                                        alt="AI Icon"
                                        class="message-icon"
                                    />
                                </span>

                                <span class="content">
                                    {{ message.content }}
                                </span>
                            </ElCard>
                        </div>
                        <div v-if="message.role === 'user'">
                            <ElCard>
                                <span class="content">{{
                                    message.content
                                }}</span>
                                <img
                                    src="@/assets/icons/user.png"
                                    alt="User Icon"
                                    class="message-icon"
                                />
                            </ElCard>
                        </div>
                    </div>
                </div>
            </div>
            <div class="input-area">
                <input
                    v-model="userInput"
                    @keyup.enter="submitMessage"
                    type="text"
                    placeholder="Type your message..."
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from 'vue';
import { ElCard, ElMessage } from 'element-plus';
import { ChatWithQwen } from '@/utils/qwen'; 

const userInput = ref('');
const messages = ref([
    {
        role: 'user',
        content: '你是一个ai',
    },
    {
        role: 'system',
        content: '您好，我是Poesy的ai助手，有什么需要我帮忙的吗？',
    },
]);


const getHistory = () => {
    return messages.value.map(m => m.content);
};

const submitMessage = async () => {
    if (!userInput.value.trim()) return;
    const userMessage = userInput.value.trim();
    messages.value.push({ role: 'user', content: userMessage });
    userInput.value = '';

    try {
        const history = getHistory();
        const gptResponse = await ChatWithQwen(userMessage, history, true);
        if (gptResponse.isOk()) {
            messages.value.push({
                role: 'assistant',
                content: gptResponse.value,
            });
        } else {
            throw new Error(gptResponse.error.toString());
        }
    } catch (error) {
        messages.value.push({
            role: 'system',
            content: `Error: ${error.message}`,
        });
        console.error('Error fetching response from AI:', error);
    }
};
</script>

<style scoped>
.ai-customer-service {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.custom-card {
    display: flex;
    align-items: center;
    height: 100%;
}
.chat {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.message-icon {
    width: 35px;
    height: 35px;
    margin: 4px;
}

.messages {
    flex-grow: 1;
    overflow-y: auto;
    padding: 16px;
}

.message.user .content,
.message.assistant .content,
.message.system .content {
    padding: 5px 10px;
    border-radius: 5px;
}

.message {
    margin-bottom: 8px;
}

.user {
    text-align: right;
}

.input-area {
    display: flex;
    padding: 8px;
}

input {
    flex-grow: 1;
    padding: 8px;
    border-radius: 4px;
}
</style>

