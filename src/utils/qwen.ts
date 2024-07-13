import { post } from '@/utils/fetch';
import { isPartialUnknown } from './types';
import { anyhow, type Result } from '@yyhhenry/rust-result';
import { ElMessage } from 'element-plus';
import { useTypedStorage } from './typed-storage';

export interface QwenResponse {
    response: string;
}

export function isQwenResponse(value: unknown): value is QwenResponse {
    return (
        isPartialUnknown<QwenResponse>(value) && typeof value.response === 'string'
    );
}

export async function askQwen(
    prompt: string,
    info?: boolean,
): Promise<Result<string, Error>> {
    const requestPromise = post('/api/qwen/answer', { prompt }, isQwenResponse);
    if (info === true) {
        ElMessage.info('正在等待Qwen的回答...');
    }
    return (await requestPromise).map((response) => response.response);
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
    info?: boolean,
): Promise<Result<string, Error>> {
    return await askQwen(JSON.stringify(history), info);
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

export async function qwenGreeting(email: string): Promise<Result<string, Error>> {
    const role = getQwenRole();
    const requestJson = {
        背景: '你是网站Poesy（意味着Quora和Poe的结合）的主页迎宾员AI',
        当前用户邮箱: email,
        任务: '根据给定的用户邮箱和时间，模仿要求的人设写一段简短的欢迎文字，30-50字，直接以文本输出。但是你不应该在回答中提到你的人设',
        人设: role,
        时间: new Date().toLocaleString(),
    };
    return await askQwen(JSON.stringify(requestJson));
}
