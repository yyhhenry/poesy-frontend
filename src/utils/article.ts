import { get, post } from '@/utils/fetch';
import { isArrayOf, isPartialUnknown } from './types';
import { err, ok, type Result } from '@yyhhenry/rust-result';

export interface UploadArticleRequest {
    title: string;
    content: string;
}

export interface UploadArticleResponse {
    id: string;
}

export function isUploadArticleResponse(
    value: unknown,
): value is UploadArticleResponse {
    return (
        isPartialUnknown<UploadArticleResponse>(value) &&
        typeof value.id === 'string'
    );
}

export async function uploadArticleApi(
    title: string,
    content: string,
): Promise<Result<UploadArticleResponse, Error>> {
    return await post(
        '/api/article/upload',
        { title, content } satisfies UploadArticleRequest,
        isUploadArticleResponse,
    );
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

export async function getArticleApi(
    id: string,
): Promise<Result<ArticleResponse, Error>> {
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

export async function getArticlesByApi(
    email: string,
): Promise<Result<ArticlesResponse, Error>> {
    const url = new URL('/api/article/by-user', window.location.href);
    url.searchParams.append('email', email);
    return await get(url, isArticlesResponse, { skipAuth: true });
}

export interface ArticleCommentRequest {
    articleId: string;
    content: string;
}

export async function uploadArticleCommentApi(
    articleId: string,
    content: string,
): Promise<Result<void, Error>> {
    const response = await post(
        '/api/article-comment/upload',
        { articleId, content } satisfies ArticleCommentRequest,
        isPartialUnknown,
    );
    if (response.isErr()) {
        return err(response.unwrapErr());
    }
    return ok();
}

export interface ArticleCommentResponse {
    id: string;
    content: string;
    authorEmail: string;
    createdTime: string;
}

export function isArticleCommentResponse(
    value: unknown,
): value is ArticleCommentResponse {
    return (
        isPartialUnknown<ArticleCommentResponse>(value) &&
        typeof value.id === 'string' &&
        typeof value.content === 'string' &&
        typeof value.authorEmail === 'string' &&
        typeof value.createdTime === 'string'
    );
}

export interface ArticleCommentListResponse {
    comments: ArticleCommentResponse[];
}

export function isArticleCommentListResponse(
    value: unknown,
): value is ArticleCommentListResponse {
    return (
        isPartialUnknown<ArticleCommentListResponse>(value) &&
        isArrayOf(value.comments, isArticleCommentResponse)
    );
}

export async function getArticleCommentsApi(
    articleId: string,
): Promise<Result<ArticleCommentListResponse, Error>> {
    return await get(
        `/api/article-comment/by-article/${articleId}`,
        isArticleCommentListResponse,
        { skipAuth: true },
    );
}
