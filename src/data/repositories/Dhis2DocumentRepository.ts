import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import FileType from "file-type/browser";
import Resizer from "react-image-file-resizer";
import { Document } from "../../domain/entities/Document";
import { DocumentRepository } from "../../domain/repositories/DocumentRepository";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../utils/d2-api";
import { getUid } from "../utils/uid";
import { Instance } from "../entities/Instance";

export class Dhis2DocumentRepository implements DocumentRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    public async save(data: ArrayBuffer, options: Partial<Document> = {}): Promise<string> {
        const type = await FileType.fromBuffer(data);
        const { mime = "application/unknown", ext } = type ?? {};
        const blob = new Blob([data], { type: mime });
        const name = options.name ?? `Uploaded file${ext ? `.${ext}` : ""}`;

        const { id } = await this.api.files
            .upload({
                id: options.id ?? getUid(await arrayBufferToString(data)),
                name: `[Training App] ${name}`,
                data: await transformFile(blob, mime),
            })
            .getData();

        return `../../documents/${id}/data`;
    }

    public async get(): Promise<Document[]> {
        return this.api.models.documents
            .get({
                filter: { name: { $like: "[Training App]" } },
                fields: { id: true, name: true },
                paging: false,
            })
            .getData()
            .then(data => data.objects.map(({ id, name }) => ({ id, name })));
    }

    public async delete(ids: string[]): Promise<void> {
        await this.api.metadata.post({ documents: ids.map(id => ({ id })) }, { importStrategy: "DELETE" }).getData();
    }
}

async function transformFile(blob: Blob, mime: string): Promise<Blob> {
    if (["image/jpeg", "image/png"].includes(mime)) {
        return new Promise(resolve => {
            Resizer.imageFileResizer(blob, 600, 600, "PNG", 100, 0, blob => resolve(blob as Blob), "blob");
        });
    } else if (process.env.NODE_ENV === "development" && mime === "image/gif") {
        try {
            const ffmpeg = createFFmpeg({ corePath: "https://unpkg.com/@ffmpeg/core/dist/ffmpeg-core.js" });

            await ffmpeg.load();
            ffmpeg.FS("writeFile", "file.gif", await fetchFile(blob));
            await ffmpeg.run(
                "-i",
                "file.gif",
                "-movflags",
                "faststart",
                "-pix_fmt",
                "yuv420p",
                "-vf",
                "scale=trunc(iw/2)*2:trunc(ih/2)*2",
                "file.mp4"
            );

            const data = ffmpeg.FS("readFile", "file.mp4");
            return new Blob([data.buffer], { type: "video/mp4" });
        } catch (error: any) {
            return blob;
        }
    }

    return blob;
}

function arrayBufferToString(buffer: ArrayBuffer, encoding = "UTF-8"): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const blob = new Blob([buffer], { type: "text/plain" });
        const reader = new FileReader();

        reader.onload = ev => {
            if (ev.target) {
                resolve(ev.target.result as string);
            } else {
                reject(new Error("Could not convert array to string!"));
            }
        };

        reader.readAsText(blob, encoding);
    });
}
