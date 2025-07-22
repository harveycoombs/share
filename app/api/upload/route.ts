import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import { cookies } from "next/headers";
import AdmZip from "adm-zip";

import { authenticate } from "@/lib/jwt";
import { insertUploadHistory } from "@/lib/uploads";
import { uploadFile } from "@/lib/files";

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
        await fs.writeFile(`./temp/zip.zip`, new Uint8Array(buffer));

        //await uploadFile(`./temp/zip.zip`, `uploads/${uploadid}/zip.zip`);

        await fs.unlink(`./temp/zip.zip`);

        return NextResponse.json({ id: uploadid }, { status: 200 });
    } catch (ex: any) {
        return NextResponse.json({ error: `Unable to upload files: ${ex.message}` }, { status: 500 });
    }
}