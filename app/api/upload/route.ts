import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import { cookies } from "next/headers";

import { authenticate } from "@/lib/jwt";
import { insertUploadHistory } from "@/lib/users";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "4gb"
        }
    }
};

export async function POST(request: Request): Promise<NextResponse> {
    const now = new Date().getTime();

    const data = await request.formData();
    const files: any[] = data.getAll("files");

    if (!files) return NextResponse.json({ error: "No files were uploaded." }, { status: 400 });

    if (files.reduce((total: number, file: any) => total + file.size, 0) > 2147483648) return NextResponse.json({ error: "Uploaded files are too large." }, { status: 413 });

    try {
        await fs.mkdir(`./uploads/${now}`);
    } catch (ex: any) {
        return NextResponse.json({ error: ex.message }, { status: 500 });
    }
    
    const errors: any[] = [];
    
    for (const file of files) {
        if (!(file instanceof File)) continue;
        
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(`./uploads/${now}/${file.name}`, new Uint8Array(buffer));
        } catch (ex: any) {
            errors.push({
                error: ex.message,
                file: file.name
            });
        }
    }

    if (errors.length) return NextResponse.json({ errors: errors }, { status: 500 });

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    const password = data.get("password")?.toString() ?? "";

    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-host") ?? request.headers.get("x-forwarded-host");
    await insertUploadHistory(user?.user_id ?? 0, now.toString(), ip ?? "", files.length, files.map(file => file.size).reduce((a, b) => a + b, 0), password);

    return NextResponse.json({ id: now }, { status: 200 });
}