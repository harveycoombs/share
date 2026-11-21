import { NextResponse } from "next/server";

import { emailExists, checkUserPasswordUsage } from "@/lib/users";

export async function GET(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") ?? "";

    if (!email?.length) return NextResponse.json({ error: "Missing email address." }, { status: 400 });

    const exists = await emailExists(email);
    const usingPassword = await checkUserPasswordUsage(email);

    return NextResponse.json({ exists, usingPassword });
}