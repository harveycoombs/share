import { NextResponse } from "next/server";

import { verifyUserAuthCode, updateUserAuthCode, updateUserVerification } from "@/lib/users";

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.formData();

    const email = data.get("email")?.toString() ?? "";
    const code = parseInt(data.get("code")?.toString() ?? "0");

    const verified = await verifyUserAuthCode(email, code);

    if (!verified) return NextResponse.json({ error: "Invalid code." }, { status: 400 });

    await updateUserVerification(email, true);
    await updateUserAuthCode(email, null);
    
    return NextResponse.json({ verified });
}