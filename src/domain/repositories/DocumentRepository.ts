import { Document } from "../entities/Document";

export interface DocumentRepository {
    get(): Promise<Document[]>;
    uploadFile(file: ArrayBuffer, options?: UploadFileOptions): Promise<string>;
    delete(id: string[]): Promise<void>;
}

export interface UploadFileOptions {
    id?: string;
    name?: string;
}
