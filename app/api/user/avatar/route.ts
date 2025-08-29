import { NextResponse } from "next/server";
import fs from "fs/promises";
import { uploadFile } from "@/lib/files";
import { authenticate } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: any) {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const data = await request.formData();
    const files: any[] = data.getAll("files");

    if (!files || !(files[0] instanceof File)) return NextResponse.json({ error: "No files were uploaded." }, { status: 400 });

    const file = files[0];
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(`./temp/avatars/${file.name.substring(file.name.lastIndexOf("/") + 1)}`, new Uint8Array(buffer));

    await uploadFile(`./temp/avatars/${file.name.substring(file.name.lastIndexOf("/") + 1)}`, `avatars/${user.user_id}`);

    await fs.unlink(`./temp/avatars/${file.name.substring(file.name.lastIndexOf("/") + 1)}`);

    return NextResponse.json({ uploaded: true }, { status: 200 });
}