import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import { cookies } from "next/headers";

import { authenticate } from "@/lib/jwt";
import { deleteUpload, insertUploadHistory } from "@/lib/uploads";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "4gb"
        }
    }
};

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.formData();
    const files: any[] = data.getAll("files");
    const password = data.get("password")?.toString() ?? "";

    if (!files.length) return NextResponse.json({ error: "No files were uploaded." }, { status: 400 });

    if (files.reduce((total: number, file: any) => total + file.size, 0) > 2147483648) return NextResponse.json({ error: "Uploaded files are too large." }, { status: 413 });

    const start = new Date().getTime();

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    const title = (files.length == 1) ? files[0].name : new Date().getTime().toString();
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-host") ?? request.headers.get("x-forwarded-host");

    const uploadid = await insertUploadHistory(user?.user_id, title, ip ?? "", files.length, files.map(file => file.size).reduce((a, b) => a + b, 0), password);

    if (!uploadid?.length) return NextResponse.json({ error: "Unable to record upload in database." }, { status: 500 });

    try {
        await fs.mkdir(`./uploads/${uploadid}`);
    } catch (ex: any) {
        await deleteUpload(user?.user_id, uploadid);
        return NextResponse.json({ error: ex.message }, { status: 500 });
    }
    
    const errors: any[] = [];
    
    for (const file of files) {
        if (!(file instanceof File)) continue;
        
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(`./uploads/${uploadid}/${file.name.substring(file.name.lastIndexOf("/") + 1)}`, new Uint8Array(buffer));
        } catch (ex: any) {
            errors.push({
                error: ex.message,
                file: file.name
            });
        }
    }

    if (errors.length) {
        await deleteUpload(user?.user_id ?? 0, uploadid);
        return NextResponse.json({ errors: errors }, { status: 500 });
    }

    const end = new Date().getTime();

    return NextResponse.json({ id: uploadid, duration: end - start }, { status: 200 });
}