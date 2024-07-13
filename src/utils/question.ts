import { get, post } from '@/utils/fetch';
import { isArrayOf, isPartialUnknown } from './types';
import type { Result } from '@yyhhenry/rust-result';

export interface UploadQuestionRequest {
    title: string;
    content: string;
}

export interface UploadQuestionResponse {
    id: string;
}

export function isUploadQuestionResponse(value: unknown): value is UploadQuestionResponse {
    return (
        isPartialUnknown<UploadQuestionResponse>(value) &&
        typeof value.id === 'string'
    );
}

export async function uploadQuestionApi(title: string, content: string): Promise<Result<UploadQuestionResponse, Error>> {
    return await post('/api/question/upload', { title, content } satisfies UploadQuestionRequest, isUploadQuestionResponse);
}

export interface QuestionResponse {
    title: string;
    content: string;
    authorEmail: string;
    createdTime: string;
}

export function isQuestionResponse(value: unknown): value is QuestionResponse {
    return (
        isPartialUnknown<QuestionResponse>(value) &&
        typeof value.title === 'string' &&
        typeof value.content === 'string' &&
        typeof value.authorEmail === 'string' &&
        typeof value.createdTime === 'string'
    );
}

export async function getQuestionApi(id: string): Promise<Result<QuestionResponse, Error>> {
    return await get(`/api/question/${id}`, isQuestionResponse);
}

export interface QuestionBrief {
    id: string;
    title: string;
    authorEmail: string;
    createdTime: string;
}

export function isQuestionBrief(value: unknown): value is QuestionBrief {
    return (
        isPartialUnknown<QuestionBrief>(value) &&
        typeof value.id === 'string' &&
        typeof value.title === 'string' &&
        typeof value.authorEmail === 'string' &&
        typeof value.createdTime === 'string'
    );
}

export interface QuestionsResponse {
    questionBriefs: QuestionBrief[];
}

export function isQuestionsResponse(value: unknown): value is QuestionsResponse {
    return (
        isPartialUnknown<QuestionsResponse>(value) &&
        isArrayOf(value.questionBriefs, isQuestionBrief)
    );
}

export async function getQuestionsByApi(email: string): Promise<Result<QuestionsResponse, Error>> {
    const url = new URL('/api/question/by-user', window.location.href);
    url.searchParams.append('email', email);
    return await get(url, isQuestionsResponse);
}

export async function getLatestQuestionsApi(offset?: number): Promise<Result<QuestionsResponse, Error>> {
    const url = new URL('/api/question/latest', window.location.href);
    url.searchParams.append('offset', `${offset ?? 0}`);
    return await get(url, isQuestionsResponse);
}
