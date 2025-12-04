import { NextResponse } from "next/server";

import { verifyUserAuthCode, updateUserAuthCode, updateUserPasswordByEmail } from "@/lib/users";

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.json();

    const email = data.email ?? "";
    const password = data.password ?? "";
    const code = parseInt(data.code || "0");

    const verified = await verifyUserAuthCode(email, code);

    await updateUserAuthCode(email, null);

    if (!verified) return NextResponse.json({ error: "Invalid code." }, { status: 400 });

    const updated = await updateUserPasswordByEmail(email, password);
    
    return NextResponse.json({ updated });
}