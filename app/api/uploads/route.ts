import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { insertUploadHistory, getUploadHistory, renameUpload, deleteUpload, getUserUpload } from "@/lib/uploads";
import { authenticate } from "@/lib/jwt";
import { deleteFolder, moveFile } from "@/lib/storage";

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
    const data:any = await request.json();

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
    const captchaToken = data.captchaToken ?? "";

    if (!user) {
        if (!captchaToken.length) return NextResponse.json({ error: "Captcha token is required." }, { status: 400 });

        const captchaResponse = await fetch("https://hcaptcha.com/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ response: captchaToken, secret: process.env.HCAPTCHA_SECRET_KEY! }).toString(),
        });
    
        const captchaResult: any = captchaResponse.ok ? await captchaResponse.json() : null;
        if (!captchaResult?.success) return NextResponse.json({ error: "Invalid captcha." }, { status: 401 });
    }

    const ip = (request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-host") ?? request.headers.get("x-forwarded-host")) ?? "";

    const accessid = await insertUploadHistory(user?.user_id, title, ip, total, size, password, contentType);
    return NextResponse.json({ accessid }, { status: 200 });
}

export async function PATCH(request: Request): Promise<NextResponse> {
    const data:any = await request.json();
    const id = data.uploadid || "";
    const title = (data.name ?? "").replace(/[\/\\]/g, "_").trim();

    if (!id.length) return NextResponse.json({ error: "Invalid upload ID." }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Invalid upload name." }, { status: 400 });

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const upload = await getUserUpload(user.user_id, id);
    if (!upload) return NextResponse.json({ error: "Upload not found." }, { status: 404 });

    try {
        await moveFile(`uploads/${upload.access_id}/${upload.title}`, `uploads/${upload.access_id}/${title}`);
    } catch (ex: any) {
        console.error(`Unable to rename file for ${id}: `, ex.message);
        return NextResponse.json({ success: false }, { status: 500 });
    }

    const success = await renameUpload(user.user_id, id, title);
    return NextResponse.json({ success }, { status: 200 });
}

export async function DELETE(request: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const data:any = await request.json();
    const uploadids: string[] = data.uploadid ? [data.uploadid] : JSON.parse(data.uploads || "[]");

    if (!uploadids.length) return NextResponse.json({ error: "Invalid upload ID(s)." }, { status: 400 });

    let success = true;

    for (const uploadid of uploadids) {
        const upload = await getUserUpload(user.user_id, uploadid);

        if (!upload) {
            success = false;
            continue;
        }

        try {
            await deleteFolder(`uploads/${upload.access_id}/`);
        } catch (ex: any) {
            console.error(`Unable to delete files for ${uploadid}: `, ex.message);
        }

        success = (await deleteUpload(user.user_id, uploadid)) && success;
    }

    return NextResponse.json({ success }, { status: success ? 200 : 500 });
}