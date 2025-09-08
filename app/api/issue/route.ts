import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";

import { authenticate } from "@/lib/jwt";

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.json();

    const description = data.description ?? "";
    const name = data.name ?? "";
    const emailAddress = data.email ?? "";
    const captchaToken = data.captchaToken ?? "";

    if (!description.length || !name.length || !emailAddress.length || !captchaToken.length) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });

    const captchaResponse = await fetch("https://hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `response=${captchaToken}&secret=${process.env.HCAPTCHA_SECRET_KEY}`,
    });

    if (!captchaResponse.ok) return NextResponse.json({ error: "Invalid captcha." }, { status: 401 });

    const ipAddress = request.headers.get("x-forwarded-for") ?? "Unknown";
    const userAgent = request.headers.get("user-agent") ?? "Unknown";

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");
    
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        resend.emails.send({
            from: "noreply@share.surf",
            to: "contact@harveycoombs.com",
            subject: "Share.surf - Issue",
            html: `<p>${description}</p><br/><br/><p>Reporter Name: <strong>${name}</strong></p><p>Reporter Email Address: <strong>${emailAddress}</strong></p><p>User ID: <strong>${user?.user_id ?? "Guest"}</strong></p><p>IP Address: <strong>${ipAddress}</strong></p><p>User Agent: <strong>${userAgent}</strong></p>`
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (ex: any) {
        console.error(ex);
        return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }
}