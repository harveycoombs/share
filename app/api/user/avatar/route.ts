import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import mime from "mime";
import { authenticate } from "@/lib/jwt";

export async function GET(_: any) {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    let files: string[] = [];

    let content: Buffer;
    let contentType: string;

    try {
        files = await fs.readdir(`./uploads/avatars/${user.user_id}`);
        files = files.filter(file => file != "." && file != "..");

        if (files.length) {
            content = await fs.readFile(`./uploads/avatars/${user.user_id}/${files[0]}`);
            contentType = mime.getType(`./uploads/avatars/${user.user_id}/${files[0]}`) ?? "application/octet-stream";
        } else {
            content = await fs.readFile("./uploads/avatars/default.jpg");
            contentType = "image/jpeg";
        }
    } catch {
        content = await fs.readFile("./uploads/avatars/default.jpg");
        contentType = "image/jpeg";
    }

    return new NextResponse(content, {
        headers: {
            "Content-Type": contentType
        }
    });
}

export async function POST(request: any) {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const data = await request.formData();
    const files: any[] = data.getAll("files");

    if (!files || !(files[0] instanceof File)) return NextResponse.json({ error: "No files were uploaded." }, { status: 400 });

    try {
        await fs.access(`./uploads/avatars/${user.user_id}`);
    } catch {
        await fs.mkdir(`./uploads/avatars/${user.user_id}`);
    }

    try {
        const file = files[0];
        const buffer = Buffer.from(await file.arrayBuffer());
        
        const existingFiles = await fs.readdir(`./uploads/avatars/${user.user_id}`);

        await Promise.all(
            existingFiles
                .filter(existing => existing != "." && existing != "..")
                .map(existing => fs.unlink(`./uploads/avatars/${user.user_id}/${existing}`))
        );

        await fs.writeFile(`./uploads/avatars/${user.user_id}/${file.name}`, new Uint8Array(buffer));

        return NextResponse.json({ uploaded: true }, { status: 200 });
    } catch (ex: any) {
        return NextResponse.json({ error: ex.message }, { status: 500 });
    }
}