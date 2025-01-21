import { Document } from "../entities/Document";

export interface DocumentRepository {
    get(): Promise<Document[]>;
    delete(id: string[]): Promise<void>;
}
