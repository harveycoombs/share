import { NextResponse } from "next/server";
import fs from "fs/promises";
import mime from "mime";
import AdmZip from "adm-zip";

export async function GET(request: any, { params }: any) {
    let { id } = params;

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
            let content = await fs.readFile(`./uploads/${id}/${files[0]}`);
            let stats = await fs.stat(`./uploads/${id}/${files[0]}`);

            return new NextResponse(content, {
                headers: {
                    "Content-Type": mime.getType(`./uploads/${id}/${files[0]}`) ?? "application/octet-stream",
                    "Content-Length": stats.size.toString()
                }
            });
        default:
            let zip = new AdmZip();

            try {
                for (let file of files) {
                    zip.addLocalFile(`./uploads/${id}/${file}`);
                }
                
                let buffer = await zip.toBufferPromise();

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