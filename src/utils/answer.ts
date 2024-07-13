import { get, post } from '@/utils/fetch';
import { isArrayOf, isPartialUnknown } from './types';
import { err, ok, type Result } from '@yyhhenry/rust-result';

export interface UploadAnswerRequest {
    questionId: string;
    content: string;
}

export async function UploadAnswerApi(
    questionId: string,
    content: string,
): Promise<Result<void, Error>> {
    const response = await post(
        '/api/answer/upload',
        { questionId, content } as UploadAnswerRequest,
        isPartialUnknown,
    );
    if (response.isErr()) {
        return err(response.unwrapErr());
    }
    return ok();
}

export interface AnswerResponse {
    id: string;
    content: string;
    authorEmail: string;
    createdTime: string;
}

export function isAnswerResponse(value: unknown): value is AnswerResponse {
    return (
        isPartialUnknown<AnswerResponse>(value) &&
        typeof value.id === 'string' &&
        typeof value.content === 'string' &&
        typeof value.authorEmail === 'string' &&
        typeof value.createdTime === 'string'
    );
}

export interface AnswerListResponse {
    answers: AnswerResponse[];
}

export function isAnswerListResponse(value: unknown): value is AnswerListResponse {
    return (
        isPartialUnknown<AnswerListResponse>(value) &&
        isArrayOf(value.answers, isAnswerResponse)
    );
}

export async function getAnswersByQuestionApi(
    questionId: string,
): Promise<Result<AnswerListResponse, Error>> {
    return await get(`/api/answer/by-question/${questionId}`, isAnswerListResponse, { skipAuth: true });
}
