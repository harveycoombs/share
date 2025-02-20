import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import { cookies } from "next/headers";
import { authenticate } from "@/lib/jwt";
import { getUploadHistory, renameUpload, deleteUpload } from "@/lib/users";

export async function GET(): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    
    const history = await Promise.all((await getUploadHistory(user.user_id)).map(async (upload) => {
        upload.available = await fs.access(`./uploads/${upload.upload_id}`).then(() => true).catch(() => false);
        return upload;
    }));

    return NextResponse.json({ history }, { status: 200 });
}

export async function PATCH(request: Request): Promise<NextResponse> {
    const data = await request.formData();
    const id = parseInt(data.get("uploadid")?.toString() ?? "0");
    const name = data.get("name")?.toString() ?? "";

    if (!id) return NextResponse.json({ error: "Invalid upload ID." }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Invalid upload name." }, { status: 400 });

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const success = await renameUpload(user.user_id, id, name);
    return NextResponse.json({ success }, { status: 200 });
}

export async function DELETE(request: Request): Promise<NextResponse> {
    const data = await request.formData();
    const id = parseInt(data.get("uploadid")?.toString() ?? "0");

    if (!id) return NextResponse.json({ error: "Invalid upload ID." }, { status: 400 });

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    try {
        await fs.unlink(`./uploads/${id}`);
        const success = await deleteUpload(user.user_id, id);

        return NextResponse.json({ success }, { status: 200 });
    } catch (ex: any) {
        console.error(ex);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}