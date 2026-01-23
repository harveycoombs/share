import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mime from "mime";

import { insertUploadHistory, getUploadHistory, renameUpload, deleteUpload } from "@/lib/uploads";
import { authenticate } from "@/lib/jwt";
import { deleteFile } from "@/lib/storage";

export const maxRequestBodySize = "4gb";

export async function GET(request: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const search = new URL(request.url).searchParams.get("search") ?? "";
    const uploads = await getUploadHistory(user.user_id, search);

    return NextResponse.json({ uploads }, { status: 200 });
}

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.json();

    const total = data.total ?? 0;
    const size = data.size ?? 0;

    if (!total) return NextResponse.json({ error: "No files were uploaded." }, { status: 400 });

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (size > (user ? 750000000 : 250000000)) return NextResponse.json({ error: "Uploaded files are too large." }, { status: 413 });

    const title = data.title ?? "";
    const contentType = data.contentType ?? "";
    const password = data.password ?? "";
    
    const ip = (request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-host") ?? request.headers.get("x-forwarded-host")) ?? "";

    const uploadid = await insertUploadHistory(user?.user_id, title, ip, total, size, password, contentType);
    return NextResponse.json({ uploadid }, { status: 200 });
}

export async function PATCH(request: Request): Promise<NextResponse> {
    const data = await request.json();
    const id = data.uploadid || "0";
    const title = data.name ?? "";

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

    const data = await request.json();
    const id = data.uploadid || "0";
    const uploadids = JSON.parse(data.uploads || "[]");

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