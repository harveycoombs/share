import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import { cookies } from "next/headers";
import mime from "mime";

import { authenticate } from "@/lib/jwt";
import { getUploadHistory, renameUpload, deleteUpload } from "@/lib/uploads";

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
                await fs.rmdir(`./uploads/${id}`, { recursive: true });
                success = await deleteUpload(user.user_id, id);
                break;
            case (uploadids.length > 0):
                for (let uploadid of uploadids) {
                    try {
                        await fs.rmdir(`./uploads/${uploadid}`, { recursive: true });
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