import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import { cookies } from "next/headers";
import { authenticate } from "@/data/jwt";
import { getUploadHistory } from "@/data/users";

export async function GET(): Promise<NextResponse> {
    let cookieJar = await cookies();
    let token = cookieJar.get("token")?.value;
    let user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    
    let history = await Promise.all((await getUploadHistory(user.user_id)).map(async (upload) => {
        upload.available = await fs.access(`./uploads/${upload.upload_id}`).then(() => true).catch(() => false);
        return upload;
    }));

    return NextResponse.json({ history }, { status: 200 });
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