import { headerAuth } from '@/utils/fetch';
import { isPartialUnknown } from './types';
import { anyhow, err, ok, safely, safelyAsync, type Result } from '@yyhhenry/rust-result';
import { ElMessage } from 'element-plus';
import { useTypedStorage } from './typed-storage';
import { ref, type Ref } from 'vue';

export interface QwenResponse {
    response: string;
}

export function isQwenResponse(value: unknown): value is QwenResponse {
    return (
        isPartialUnknown<QwenResponse>(value) && typeof value.response === 'string'
    );
}

export interface AskQwenOptions {
    onMsg?: (response: QwenResponse) => void;
    onDone?: () => void;
    info?: boolean;
}
export async function askQwen(
    prompt: string,
    { onMsg, onDone, info }: AskQwenOptions = {},
): Promise<Result<void, Error>> {
    const response = await safelyAsync(async () => {
        const headers = await headerAuth();
        return await fetch('/api/qwen/answer-stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify({ prompt }),
        });
    });
    if (response.isErr()) {
        return err(response.unwrapErr());
    }
    const reader = response.unwrap().body?.getReader();
    if (!reader) {
        return anyhow('无法获取响应');
    }
    let stopped = false;
    async function readStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
        const decoder = new TextDecoder();
        while (!stopped) {
            const { done, value } = await reader.read();
            if (done) {
                onDone?.();
                break;
            }
            const chunks = decoder.decode(value).split('\n').filter((line) => line.trim() !== '');
            const objs = safely(() => chunks.map(chunk => JSON.parse(chunk) as unknown));
            if (objs.isErr()) {
                ElMessage.error('无法解析Qwen的回答');
                console.error(chunks, objs.unwrapErr());
                break;
            }
            for (const response of objs.unwrap()) {
                if (isQwenResponse(response)) {
                    onMsg?.(response);
                }
            }
        }
    }
    if (info === true) {
        ElMessage.info('正在等待Qwen的回答...');
    }
    readStream(reader); // No await here, because we want to return the ref immediately
    return ok();
}

export interface ChatMsg {
    role: string;
    content: string;
}

export interface ChatHistory {
    history: ChatMsg[];
}


export async function chatWithQwen(
    history: ChatHistory,
    options: AskQwenOptions = {},
): Promise<Result<void, Error>> {
    return await askQwen(JSON.stringify(history), options);
}

export const qwenRoles = ['活泼/女孩/偏好表情', '沉稳/大叔/偏好诗句'] as const;

export type QwenRole = (typeof qwenRoles)[number];

export function isQwenRole(value: unknown): value is QwenRole {
    return qwenRoles.includes(value as QwenRole);
}

export const qwenRole = useTypedStorage<QwenRole>('qwen-role', isQwenRole);

export function getQwenRole(): QwenRole {
    return qwenRole.value ?? qwenRoles[0];
}

export function toggleQwenRole(): void {
    const index = qwenRoles.indexOf(getQwenRole());
    const newIndex = (index + 1) % qwenRoles.length;
    qwenRole.value = qwenRoles[newIndex];
}

export async function qwenGreeting(email: string, options: AskQwenOptions = {}): Promise<Result<void, Error>> {
    const role = getQwenRole();
    const requestJson = {
        背景: '你是网站Poesy（意味着Quora和Poe的结合）的主页迎宾员AI',
        当前用户邮箱: email,
        任务: '根据给定的用户邮箱和时间，模仿要求的人设写一段简短的欢迎文字，30-50字，直接以文本输出。但是你不应该在回答中提到你的人设',
        人设: role,
        时间: new Date().toLocaleString(),
    };
    return await askQwen(JSON.stringify(requestJson), options);
}
