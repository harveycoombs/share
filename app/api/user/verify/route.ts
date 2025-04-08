import { NextResponse } from "next/server";

import { verifyUserAuthCode } from "@/lib/users";

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.formData();

    const email = data.get("email")?.toString() ?? "";
    const code = parseInt(data.get("code")?.toString() ?? "0");

    const verified = await verifyUserAuthCode(email, code);
    return NextResponse.json({ verified });
}