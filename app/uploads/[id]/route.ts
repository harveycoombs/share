import { NextResponse } from "next/server";
import fs from "fs/promises";
import { createReadStream } from "fs";
import mime from "mime";
import AdmZip from "adm-zip";

import { checkUploadProtection, getUploadPasswordHash } from "@/lib/uploads";
import { verify } from "@/lib/passwords";

export async function GET(request: Request, { params }: any) {
    const { id } = await params;

    const isProtected = await checkUploadProtection(id);
    const password = request.headers.get("Share-Upload-Password") ?? "";

    if (isProtected && !password?.length) return NextResponse.redirect(`${request.headers.get("x-forwarded-proto")}://${request.headers.get("host")}/protected/${id}`);

    if (isProtected && password?.length) {
        const hash = await getUploadPasswordHash(id);
        const verified = await verify(password, hash);
    
        if (!verified) return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    let files: string[] = [];

    try {
        files = await fs.readdir(`./uploads/${id}`);
    } catch {
        return NextResponse.json({ error: "The specified upload does not exist." }, { status: 404 });
    }

    files = files.filter(file => file != "." && file != "..");

    switch (files.length) {
        case 0:
            return NextResponse.json({ error: "The specified upload does not exist." }, { status: 404 });
        case 1:
            const stats = await fs.stat(`./uploads/${id}/${files[0]}`);

            let contentType = mime.getType(`./uploads/${id}/${files[0]}`) ?? "application/octet-stream";

            if (contentType.startsWith("video/")) {
                const fileStream = createReadStream(`./uploads/${id}/${files[0]}`);

                const stream = new ReadableStream({
                    async start(controller) {
                        for await (const chunk of fileStream) {
                            controller.enqueue(chunk);
                        }

                        controller.close();
                    }
                });

                return new NextResponse(stream, {
                    headers: {
                        "Content-Type": contentType,
                        "Content-Disposition": `${isProtected ? "attachment" : "inline"}; filename="${files[0]}"`,
                        "Transfer-Encoding": "chunked",
                        "Cache-Control": "no-cache"
                    }
                });
            } else {
                const content = await fs.readFile(`./uploads/${id}/${files[0]}`);

                if (contentType == "text/html") {
                    contentType = "text/plain";
                }

                return new NextResponse(new Uint8Array(content), {
                    headers: {
                        "Content-Type": contentType,
                        "Content-Disposition": `${isProtected ? "attachment" : "inline"}; filename="${files[0]}"`,
                        "Content-Length": stats.size.toString()
                    }
                });
            }
        default:
            const zip = new AdmZip();

            try {
                for (const file of files) {
                    zip.addLocalFile(`./uploads/${id}/${file}`);
                }
                
                const buffer = await zip.toBufferPromise();

                return new NextResponse(new Uint8Array(buffer), {
                    headers: {
                        "Content-Type": "application/zip"
                    }
                });
            } catch (ex: any) {
                return NextResponse.json({ error: "An unexpected server error occured." }, { status: 500 });
            }
    }
}