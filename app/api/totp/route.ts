import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticator } from "otplib";
import qrcode from "qrcode";

import { authenticate, createJWT } from "@/lib/jwt";
import { getUserByEmailAddress, getUserTOTPSecret, updateUserTOTPSettings } from "@/lib/users";

export async function GET(request: Request): Promise<NextResponse> {
    const token = new URL(request.url).searchParams.get("token") ?? "";

    const cookieJar = await cookies();
    const email = cookieJar.get("email")?.value ?? "";

    if (!email.length) return NextResponse.json({ error: "Missing email address." }, { status: 400 });

    const secret = await getUserTOTPSecret(email);
    const valid = authenticator.verify({ token, secret });

    if (!valid) return NextResponse.json({ error: "Invalid token." }, { status: 400 });

    const response = NextResponse.json({ success: true }, { status: 200 });

    cookieJar.delete("email");

    const user = await getUserByEmailAddress(email);
    const credentials = createJWT(user);

    response.cookies.set("token", credentials.token, {
        httpOnly: true,
        secure: true,
        maxAge: 3155760000
    });

    return response;
}

export async function POST(request: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const data = await request.json();
    const email = data.email ?? "";

    if (!email.length) return NextResponse.json({ error: "Missing email address." }, { status: 400 });

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, "Share.surf", secret);
    const qr = await qrcode.toDataURL(otpauth);

    await updateUserTOTPSettings(user.user_id, secret);

    return NextResponse.json({ qr });
}

export async function DELETE(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const disabled = await updateUserTOTPSettings(user.user_id, "");

    return NextResponse.json({ disabled });
}