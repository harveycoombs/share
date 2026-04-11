import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { authenticate } from "@/lib/jwt";
import { updateUserAccessCode } from "@/lib/users";
import sendEmail from "@/lib/email";

export async function GET(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value ?? "";
    const user = await authenticate(token);

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    return NextResponse.json({ user });
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const data = await request.json();

        const email = data.email ?? "";
        const captchaToken = data.captchaToken ?? "";
    
        if (!email?.length || !captchaToken?.length) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });

        const captchaResponse = await fetch("https://hcaptcha.com/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `response=${captchaToken}&secret=${process.env.HCAPTCHA_SECRET_KEY!}`,
        });

        if (!captchaResponse.ok) return NextResponse.json({ error: "Invalid captcha." }, { status: 401 });

        const code = crypto.randomUUID();

        await updateUserAccessCode(email, code);

        const baseUrl = new URL(request.url).origin;

        await sendEmail({ 
            to: email, 
            subject: "Share.surf - Sign In", 
            html: `<p>Hello,</p> <p>To continue signing in to <i>Share.surf</i>, <a href="${baseUrl}/signin/confirm?email=${encodeURIComponent(email)}&code=${code}" style="font-weight: bold;">click here</a>.</p>` 
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (ex: any) {
        return NextResponse.json({ success: false, error: ex.message }, { status: 500 });
    }
}

export async function DELETE(): Promise<NextResponse> {
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.delete("token");

    return response;
}