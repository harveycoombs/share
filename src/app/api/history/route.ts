import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import { cookies } from "next/headers";

export async function GET(): Promise<NextResponse> {
    let historyCookie = (await cookies()).get("history")?.value ?? "[]";
    let ids: number[] = JSON.parse(historyCookie);
   
    let history = await Promise.all(ids.map(async (id) => {
        try {
            let files = await fs.readdir(`./uploads/${id}`);

            let size = (await Promise.all(files.map(async (file) => {            
                let stats = await fs.stat(`./uploads/${id}/${file}`);
                return stats.size;
            }))).reduce((a, b) => a + b, 0);

            return {
                id: id,
                files: files.length,
                size: size
            };
        } catch {
            return null;
        }
    }));

    return NextResponse.json(history.filter(upload => upload).reverse(), { status: 200 });
}

export async function DELETE(request: Request): Promise<NextResponse> {
    let data = await request.formData();
    let id = parseInt(data.get("id")?.toString() ?? "0");

    let response = NextResponse.json({ success: true }, { status: 200 });

    try {
        await fs.unlink(`./uploads/${id}`);

        let historyCookie = (await cookies()).get("history")?.value ?? "[]";
        let ids: number[] = JSON.parse(historyCookie);

        ids.splice(ids.indexOf(id), 1);

        response.cookies.set("history", JSON.stringify(ids), {
            httpOnly: true,
            maxAge: 3155760000
        });

        
    } catch (ex: any) {
        console.error(ex);
        response = NextResponse.json({ success: false }, { status: 500 });
    }

    return response;
}