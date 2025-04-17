import { NextResponse } from "next/server";
import fs from "fs/promises";
import mime from "mime";
import AdmZip from "adm-zip";

export async function GET(_: any, { params }: any) {
    const { id } = await params;

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
            const content = await fs.readFile(`./uploads/${id}/${files[0]}`);
            const stats = await fs.stat(`./uploads/${id}/${files[0]}`);

            let contentType = mime.getType(`./uploads/${id}/${files[0]}`) ?? "application/octet-stream";

            if (contentType == "text/html") {
                contentType = "text/plain";
            }

            return new NextResponse(content, {
                headers: {
                    "Content-Type": contentType,
                    "Content-Length": stats.size.toString()
                }
            });
        default:
            const zip = new AdmZip();

            try {
                for (const file of files) {
                    zip.addLocalFile(`./uploads/${id}/${file}`);
                }
                
                const buffer = await zip.toBufferPromise();

                return new NextResponse(buffer, {
                    headers: {
                        "Content-Type": "application/zip"
                    }
                });
            } catch (ex: any) {
                return NextResponse.json({ error: "An unexpected server error occured." }, { status: 500 });
            }
    }
}