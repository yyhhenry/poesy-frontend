import { type Result, anyhow } from "@yyhhenry/rust-result";
import { post } from "./fetch";
import { isPartialUnknown } from "./types";

export interface UploadResponse {
    id: string;
    url: string;
}
export function isUploadResponse(data: any): data is UploadResponse {
    return (
        isPartialUnknown<UploadResponse>(data)
        && typeof data.id === 'string'
        && typeof data.url === 'string'
    );
}

export async function uploadImageApi(image: File): Promise<Result<UploadResponse, Error>> {
    const ext = image.name.split('.').pop();
    if (!ext || ['jpg', 'jpeg', 'png'].indexOf(ext) === -1) {
        return anyhow('Invalid image file');
    }
    const formData = new FormData();
    formData.append('image', image);
    console.log(formData, image);
    return await post('/api/image/upload', formData, isUploadResponse, { formData: true });
}
