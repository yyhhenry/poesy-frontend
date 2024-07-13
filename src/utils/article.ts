import { get, post } from '@/utils/fetch';
import { isArrayOf, isPartialUnknown } from './types';
import type { Result } from '@yyhhenry/rust-result';

export interface UploadArticleRequest {
    title: string;
    content: string;
}

export interface UploadArticleResponse {
    id: string;
}

export function isUploadArticleResponse(value: unknown): value is UploadArticleResponse {
    return (
        isPartialUnknown<UploadArticleResponse>(value) &&
        typeof value.id === 'string'
    );
}

export async function uploadArticleApi(title: string, content: string): Promise<Result<UploadArticleResponse, Error>> {
    return await post('/api/article/upload', { title, content } satisfies UploadArticleRequest, isUploadArticleResponse);
}

export interface ArticleResponse {
    title: string;
    content: string;
    authorEmail: string;
    createdTime: string;
}

export function isArticleResponse(value: unknown): value is ArticleResponse {
    return (
        isPartialUnknown<ArticleResponse>(value) &&
        typeof value.title === 'string' &&
        typeof value.content === 'string' &&
        typeof value.authorEmail === 'string' &&
        typeof value.createdTime === 'string'
    );
}

export async function getArticleApi(id: string): Promise<Result<ArticleResponse, Error>> {
    return await get(`/api/article/${id}`, isArticleResponse, { skipAuth: true });
}

export interface ArticleBrief {
    id: string;
    title: string;
    authorEmail: string;
    createdTime: string;
}

export function isArticleBrief(value: unknown): value is ArticleBrief {
    return (
        isPartialUnknown<ArticleBrief>(value) &&
        typeof value.id === 'string' &&
        typeof value.title === 'string' &&
        typeof value.authorEmail === 'string' &&
        typeof value.createdTime === 'string'
    );
}

export interface ArticlesResponse {
    articleBriefs: ArticleBrief[];
}

export function isArticlesResponse(value: unknown): value is ArticlesResponse {
    return (
        isPartialUnknown<ArticlesResponse>(value) &&
        isArrayOf(value.articleBriefs, isArticleBrief)
    );
}

export async function getArticlesByApi(email: string): Promise<Result<ArticlesResponse, Error>> {
    const url = new URL('/api/article/by-user', window.location.href);
    url.searchParams.append('email', email);
    return await get(url, isArticlesResponse, { skipAuth: true });
}
