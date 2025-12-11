import { NextResponse } from "next/server";

import { getSignedURL } from "@/lib/storage";

export async function GET(request: Request): Promise<NextResponse> {
    const filename = new URL(request.url).searchParams.get("filename") ?? "";

    if (!filename.length) return NextResponse.json({ error: "Invalid filename." }, { status: 400 });

    const url = await getSignedURL(filename);
    return NextResponse.json({ url }, { status: 200 });
}