import { NextResponse } from "next/server";
import fs from "fs/promises";
import mime from "mime";

export async function GET(_: any, { params }: any) {
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

            return new NextResponse(content, {
                headers: {
                    "Content-Type": mime.getType(`./uploads/${id}/${files[0]}`) ?? "application/octet-stream"
                }
            });
        default:
            return;
    }
  }