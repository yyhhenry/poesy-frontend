import { type Result, anyhow, err, ok } from '@yyhhenry/rust-result';
import { isPartialUnknown } from './types';
import { post } from '@/utils/fetch';

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
  const response = await post('/api/user/exists', { email } satisfies UserExistsRequest);
  if (response.isErr()) {
    return err(response.unwrapErr());
  }
  const userExists = response.unwrap();
  if (!isUserExistsResponse(userExists)) {
    return anyhow('/api/user/exists 返回结果异常');
  }
  return ok(userExists.exists);
}

export async function registerApi(user: User): Promise<Result<void, Error>> {
  const response = await post('/api/user/register', user);
  if (response.isErr()) {
    return err(response.unwrapErr());
  }
  return ok(undefined);
}
