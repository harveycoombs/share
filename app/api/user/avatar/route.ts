import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { authenticate } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function PUT(request: any) {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const data = await request.formData();
    const files: any[] = data.getAll("files");

    if (!files || !(files[0] instanceof File)) return NextResponse.json({ error: "No files were uploaded." }, { status: 400 });

    const file = files[0];

    await uploadFile(file, `avatars/${user.user_id}`);

    return NextResponse.json({ uploaded: true }, { status: 200 });
}