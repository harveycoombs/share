import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import { cookies } from "next/headers";

export async function POST(request: Request): Promise<NextResponse> {
    let historyCookie = cookies().get("history")?.value ?? "[]";
    let ids: number[] = JSON.parse(historyCookie);
   
    let history = await Promise.all(ids.map(async (id) => {
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
    }));

    return NextResponse.json({ history: history }, { status: 200 });
}