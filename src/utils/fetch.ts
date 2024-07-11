import { type Result, anyhow, safelyAsync } from '@yyhhenry/rust-result';
import { isPartialUnknown } from '@/utils/types';

type UrlLike = string | URL;

export interface ErrorResponse {
  error: string;
}
export function isErrorResponse(u: unknown): u is ErrorResponse {
  return isPartialUnknown<ErrorResponse>(u) && typeof u.error === 'string';
}
export async function post(url: UrlLike, bodyJson: unknown): Promise<Result<unknown, Error>> {
  return await safelyAsync(async () => {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(bodyJson),
      headers: {
        'Content-Type': 'application/json',
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
    return json;
  });
}

export async function get(url: UrlLike): Promise<Result<unknown, Error>> {
  return await safelyAsync(async () => {
    const response = await fetch(url);
    const json = (await response.json()) as unknown;
    if (response.status !== 200) {
      const errorText = `HTTP ${response.status} ${response.statusText}`;
      if (isErrorResponse(json)) {
        throw new Error(`${errorText}: ${json.error}`);
      }
      throw new Error(errorText);
    }
    return json;
  });
}
