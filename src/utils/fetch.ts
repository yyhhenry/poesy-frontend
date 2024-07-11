import { type Result, anyhow, safelyAsync, err, ok, safely } from '@yyhhenry/rust-result';
import { isPartialUnknown, type Predicate } from '@/utils/types';
import { useLocalStorage, useStorage } from '@vueuse/core';
import { ElMessage } from 'element-plus';
import { computed } from 'vue';

type UrlLike = string | URL;

export interface MsgResponse {
  msg: string;
}
export function isMsgResponse(u: unknown): u is MsgResponse {
  return isPartialUnknown<MsgResponse>(u) && typeof u.msg === 'string';
}

export interface TokenPair {
  accessToken: string;
  expireTime: number;
  refreshToken: string;
}
export function isTokenPair(u: unknown): u is TokenPair {
  return (
    isPartialUnknown<TokenPair>(u)
    && typeof u.accessToken === 'string'
    && typeof u.expireTime === 'number'
    && typeof u.refreshToken === 'string'
  );
}

export const tokenPairJSONStorage = useLocalStorage<string | undefined>('token-pair', undefined);
export const tokenPairStorage = computed<TokenPair | undefined>({
  get: () => {
    const str = tokenPairJSONStorage.value;
    if (!str) {
      return undefined;
    }
    const tokenPairResult = safely(() => JSON.parse(str) as unknown);
    if (tokenPairResult.isErr()) {
      return undefined;
    }
    const tokenPair = tokenPairResult.unwrap();
    if (!isTokenPair(tokenPair)) {
      return undefined;
    }
    return tokenPair;
  },
  set: (value: TokenPair | undefined) => {
    if (!value) {
      tokenPairJSONStorage.value = undefined;
      return;
    }
    tokenPairJSONStorage.value = JSON.stringify(value);
  }
});
export function putTokenPair(tokenPair: TokenPair): void {
  tokenPairStorage.value = tokenPair;
}
export interface RefreshRequest {
  refreshToken: string;
}
export async function refreshToken(): Promise<Result<void, Error>> {
  const refreshToken = tokenPairStorage.value?.refreshToken;
  if (!refreshToken) {
    return anyhow('找不到 refreshToken');
  }
  return (await post('/api/user/refresh', { refreshToken } satisfies RefreshRequest, isTokenPair, {
    skipAuth: true,
  })).map(putTokenPair);
}
export function logoutApi(): void {
  tokenPairStorage.value = undefined;
}
/**
 * Refresh when expire time is within 1 minute
 */
export async function getAutoRefreshedToken(): Promise<Result<string, Error>> {
  const tokenPair = tokenPairStorage.value;
  if (!tokenPair) {
    return anyhow('未登录');
  }
  const now = Date.now();
  const gap = 60 * 1000;
  if (tokenPair.expireTime < now + gap) {
    await refreshToken();
  }
  const accessToken = tokenPairStorage.value?.accessToken;
  if (!accessToken) {
    return anyhow('未登录');
  }
  return ok(accessToken);
}


export interface ErrorResponse {
  error: string;
}
export function isErrorResponse(u: unknown): u is ErrorResponse {
  return isPartialUnknown<ErrorResponse>(u) && typeof u.error === 'string';
}

export interface PostOptions {
  skipAuth?: boolean;
}
export async function post<T>(url: UrlLike, bodyJson: unknown, isT: Predicate<T>, options?: PostOptions): Promise<Result<T, Error>> {
  return await safelyAsync(async () => {
    let auth = '';
    if (!options?.skipAuth) {
      const accessToken = await getAutoRefreshedToken();
      if (accessToken.isErr()) {
        throw accessToken.unwrapErr();
      }
      auth = `Bearer ${accessToken.unwrap()}`;
    }
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(bodyJson),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
    });
    const json = (await response.json()) as unknown;
    if (response.status !== 200) {
      const errorText = `HTTP ${response.status} ${response.statusText}`;
      if (isErrorResponse(json)) {
        throw new Error(`${errorText}: ${json.error}`);
      }
      throw new Error(errorText);
    }
    if (!isT(json)) {
      throw new Error(`${url} 返回结果异常`);
    }
    return json;
  });
}
export async function get<T>(url: UrlLike, isT: Predicate<T>): Promise<Result<T, Error>> {
  return await safelyAsync(async () => {
    const accessToken = await getAutoRefreshedToken();
    if (accessToken.isErr()) {
      throw accessToken.unwrapErr();
    }
    const auth = `Bearer ${accessToken.unwrap()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': auth,
      },
    });
    const json = (await response.json()) as unknown;
    if (response.status !== 200) {
      const errorText = `HTTP ${response.status} ${response.statusText}`;
      if (isErrorResponse(json)) {
        throw new Error(`${errorText}: ${json.error}`);
      }
      throw new Error(errorText);
    }
    if (!isT(json)) {
      throw new Error(`${url} 返回结果异常`);
    }
    return json;
  });
}

export interface User {
  email: string;
  password: string;
}
export function isUser(value: unknown): value is User {
  return (
    isPartialUnknown<User>(value) &&
    typeof value.email === 'string' &&
    typeof value.password === 'string'
  );
}
export interface UserExistsResponse {
  exists: boolean;
}
export function isUserExistsResponse(value: unknown): value is UserExistsResponse {
  return (
    isPartialUnknown<UserExistsResponse>(value) &&
    typeof value.exists === 'boolean'
  );
}

export interface UserExistsRequest {
  email: string;
}

export async function userExistsApi(email: string): Promise<Result<boolean, Error>> {
  const response = await post('/api/user/exists', { email } satisfies UserExistsRequest, isUserExistsResponse, { skipAuth: true });
  if (response.isErr()) {
    return err(response.unwrapErr());
  }
  return ok(response.unwrap().exists);
}

export interface TokenInfo {
  email: string;
  expireTime: number;
}

export function isTokenInfo(value: unknown): value is TokenInfo {
  return (
    isPartialUnknown<TokenInfo>(value) &&
    typeof value.email === 'string' &&
    typeof value.expireTime === 'number'
  );
}

export async function tokenInfoApi(): Promise<Result<TokenInfo, Error>> {
  return await get('/api/user/info', isTokenInfo);
}

export async function registerApi(user: User): Promise<Result<void, Error>> {
  return (await post('/api/user/register', user, isMsgResponse, { skipAuth: true }))
    .map((msg) => {
      ElMessage.info(msg.msg);
    });
}

export async function loginApi(user: User): Promise<Result<void, Error>> {
  return (await post('/api/user/login', user, isTokenPair, { skipAuth: true }))
    .map(putTokenPair);
}

export interface VerifyRequest {
  email: string;
  code: string;
}
export async function verifyApi(email: string, code: string): Promise<Result<void, Error>> {
  return (await post('/api/user/verify', { email, code } satisfies VerifyRequest, isTokenPair, { skipAuth: true }))
    .map(putTokenPair);
}
