import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { totp, authenticator } from "otplib";
import qrcode from "qrcode";

import { authenticate } from "@/lib/jwt";
import { getUserTOTPSecret, updateUserTOTPSettings } from "@/lib/users";

export async function GET(request: Request): Promise<NextResponse> {
    const data = await request.formData();
    const email = data.get("email")?.toString() ?? "";
    const token = data.get("token")?.toString() ?? "";

    const secret = await getUserTOTPSecret(email);

    const valid = totp.verify({ token, secret });
    return NextResponse.json({ valid });
}

export async function POST(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email_address, "Share.surf", secret);
    const qr = await qrcode.toDataURL(otpauth);

    await updateUserTOTPSettings(user.user_id, secret, true);

    return NextResponse.json({ qr });
}

export async function DELETE(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const disabled = await updateUserTOTPSettings(user.user_id, "", false);

    return NextResponse.json({ disabled });
}