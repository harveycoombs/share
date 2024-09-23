import { NextResponse } from "next/server";
import * as fs from "fs/promises";

export async function POST(request: Request): Promise<NextResponse> {
    let now = new Date().getTime();    

    let data = await request.formData();
    let files = data.getAll("files");
    
    if (!files) return NextResponse.json({ error: "No files were uploaded." }, { status: 400 });

    try {
        await fs.mkdir(`./uploads/${now}`);
    } catch (ex: any) {
        return NextResponse.json({ error: ex.message }, { status: 500 });
    }
    
    let errors: any[] = [];
    
    for (let file of files) {
        if (!(file instanceof File)) continue;
        
        try {
            let buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(`./uploads/${now}/${file.name}`, buffer);
        } catch (ex: any) {
            errors.push({
                error: ex.message,
                file: file.name
            });
        }
    }

    if (errors.length) return NextResponse.json({ errors: errors }, { status: 500 });
    
    return NextResponse.json({ id: now }, { status: 200 });
}