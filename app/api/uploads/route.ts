import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as fs from "fs/promises";
import AdmZip from "adm-zip";
import mime from "mime";

import { insertUploadHistory, getUploadHistory, renameUpload, deleteUpload } from "@/lib/uploads";
import { authenticate } from "@/lib/jwt";
import { uploadFile, deleteFile } from "@/lib/files";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "4gb"
        }
    }
};

export async function GET(request: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const search = new URL(request.url).searchParams.get("search") ?? "";

    const history = (await Promise.all((await getUploadHistory(user.user_id, search)).map(async (upload) => {
        try {
            upload.available = await fs.access(`./uploads/${upload.upload_id}`).then(() => true).catch(() => false);
            upload.types = (await fs.readdir(`./uploads/${upload.upload_id}`)).map((file) => mime.getType(file));

            return upload;
        } catch {
            return null;
        }
    }))).filter(upload => upload != null);

    return NextResponse.json({ history }, { status: 200 });
}

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.formData();
    const files: any[] = data.getAll("files");
    const password = data.get("password")?.toString() ?? "";

    if (!files.length) return NextResponse.json({ error: "No files were uploaded." }, { status: 400 });

    if (files.reduce((total: number, file: any) => total + file.size, 0) > 750000000) return NextResponse.json({ error: "Uploaded files are too large." }, { status: 413 });

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    const title = (files.length == 1) ? files[0].name : new Date().getTime().toString();
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-host") ?? request.headers.get("x-forwarded-host");

    const uploadid = await insertUploadHistory(user?.user_id, title, ip ?? "", files.length, files.map(file => file.size).reduce((a, b) => a + b, 0), password);

    if (!uploadid?.length) return NextResponse.json({ error: "Unable to record upload in database." }, { status: 500 });

    try {
        if (files.length == 1) {
            const file = files[0];

            if (!(file instanceof File)) return NextResponse.json({ error: "Invalid file." }, { status: 400 });

            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(`./temp/${file.name.substring(file.name.lastIndexOf("/") + 1)}`, new Uint8Array(buffer));

            await uploadFile(`./temp/${file.name.substring(file.name.lastIndexOf("/") + 1)}`, `uploads/${uploadid}`);

            await fs.unlink(`./temp/${file.name.substring(file.name.lastIndexOf("/") + 1)}`);

            return NextResponse.json({ id: uploadid }, { status: 200 });
        }
    } catch (ex: any) {
        return NextResponse.json({ error: `Unable to upload file: ${ex.message}` }, { status: 500 });
    }

    try {
        const zip = new AdmZip();

        for (const file of files) {
            if (!(file instanceof File)) continue;
            
            const buffer = Buffer.from(await file.arrayBuffer());
            zip.addFile(file.name.substring(file.name.lastIndexOf("/") + 1), buffer);
        }

        const buffer = await zip.toBufferPromise();
        await fs.writeFile("./temp/files.zip", new Uint8Array(buffer));

        await uploadFile("./temp/files.zip", `uploads/${uploadid}/files.zip`);

        await fs.unlink("./temp/files.zip");

        return NextResponse.json({ id: uploadid }, { status: 200 });
    } catch (ex: any) {
        return NextResponse.json({ error: `Unable to upload files: ${ex.message}` }, { status: 500 });
    }
}

export async function PATCH(request: Request): Promise<NextResponse> {
    const data = await request.formData();
    const id =data.get("uploadid")?.toString() ?? "0";
    const title = data.get("name")?.toString() ?? "";

    if (!id.length) return NextResponse.json({ error: "Invalid upload ID." }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Invalid upload name." }, { status: 400 });

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const success = await renameUpload(user.user_id, id, title);
    return NextResponse.json({ success }, { status: 200 });
}

export async function DELETE(request: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const data = await request.formData();
    const id = data.get("uploadid")?.toString() ?? "0";
    const uploadids = JSON.parse(data.get("uploads")?.toString() ?? "[]");

    let success = false;

    try {
        switch (true) {
            case (id.length > 0):
                await deleteFile(`uploads/${id}`);
                success = await deleteUpload(user.user_id, id);
                break;
            case (uploadids.length > 0):
                for (let uploadid of uploadids) {
                    try {
                        await deleteFile(`uploads/${id}`);
                    } catch (ex: any) {
                        console.error(`Unable to delete ${uploadid}: `, ex.message);
                    } finally {
                        success = await deleteUpload(user.user_id, uploadid);
                    }
                }
                break;
            default:
                return NextResponse.json({ error: "Invalid upload ID(s)." }, { status: 400 });
        }

        return NextResponse.json({ success }, { status: 200 });
    } catch (ex: any) {
        console.error(ex);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}