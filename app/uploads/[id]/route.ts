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

            if (contentType == "text/html") {
                contentType = "text/plain";
            }

            const range = request.headers.get("range");
            let start = 0;
            let end = stats.size - 1;

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                start = parseInt(parts[0], 10);
                end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
            }

            const contentLength = end - start + 1;
            const fileStream = createReadStream(`./uploads/${id}/${files[0]}`, { start, end });

            const stream = new ReadableStream({
                async start(controller) {
                    for await (const chunk of fileStream) {
                        controller.enqueue(chunk);
                    }
                    controller.close();
                }
            });

            return new NextResponse(stream, {
                status: range ? 206 : 200,
                headers: {
                    "Content-Type": contentType,
                    "Content-Disposition": `${isProtected ? "attachment" : "inline"}; filename="${files[0]}"`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": contentLength.toString(),
                    "Content-Range": `bytes ${start}-${end}/${stats.size}`,
                    "Cache-Control": "no-cache"
                }
            });
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