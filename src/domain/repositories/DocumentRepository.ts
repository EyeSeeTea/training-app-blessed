import { Document } from "../entities/Document";

export interface DocumentRepository {
    get(): Promise<Document[]>;
    save(file: ArrayBuffer, options?: Partial<Document>): Promise<string>;
    delete(id: string[]): Promise<void>;
}
