import { NextResponse } from "next/server";
import * as fs from "fs/promises";

export async function POST(request: Request): Promise<NextResponse> {
    let now = new Date();

    let data = await request.formData();

    let title = data.get("title")?.valueOf();
    let description = data.get("description")?.valueOf();
    
    try {
        await fs.writeFile(`./reports/${now.getTime()}.txt`, `${title}\n\n${description}\n\nReported at: ${now}`);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch {
        return NextResponse.json({ success: false, error: "An unexpected server error occured." }, { status: 500 });
    }
}