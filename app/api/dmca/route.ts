import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.json();

    const description = data.description ?? "";
    const name = data.name ?? "";
    const organisation = data.organisation ?? "";
    const emailAddress = data.email ?? "";
    const captchaToken = data.captchaToken ?? "";

    if (!description.length || !name.length || !organisation.length || !emailAddress.length || !captchaToken.length) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });

    const captchaResponse = await fetch("https://hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `response=${captchaToken}&secret=${process.env.HCAPTCHA_SECRET_KEY!}`,
    });

    if (!captchaResponse.ok) return NextResponse.json({ error: "Invalid captcha." }, { status: 401 });
    
    try {
        const resend = new Resend(process.env.RESEND_API_KEY!);

        resend.emails.send({
            from: "noreply@share.surf",
            to: process.env.ADMIN_EMAIL ?? "",
            subject: "Share.surf - DMCA Takedown Request",
            html: `<p>${description}</p><br/><br/><p>Name: <strong>${name}</strong></p><p>Email Address: <strong>${emailAddress}</strong></p><p>Organisation: <strong>${organisation}</strong></p>`
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (ex: any) {
        console.error(ex);
        return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }
}