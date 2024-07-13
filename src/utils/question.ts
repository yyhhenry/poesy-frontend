import { post } from '@/utils/fetch';
import { isPartialUnknown } from './types';
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
