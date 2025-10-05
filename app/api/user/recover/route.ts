import { NextResponse } from "next/server";
import { Resend } from "resend";

import { updateUserAuthCode } from "@/lib/users";
import { generateCode } from "@/lib/utils";

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.json();

    const email = data.email ?? "";
    const captchaToken = data.captchaToken ?? "";

    if (!email.length || !captchaToken.length) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });
    
    const captchaResponse = await fetch("https://hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `response=${captchaToken}&secret=${process.env.HCAPTCHA_SECRET_KEY}`,
    });

    if (!captchaResponse.ok) return NextResponse.json({ error: "Invalid captcha." }, { status: 401 });

    try {
        const code = generateCode();
        const updated = await updateUserAuthCode(email, code);

        if (!updated) return NextResponse.json({ error: "Failed to generate authentication code." }, { status: 500 });

        const resend = new Resend(process.env.RESEND_API_KEY);

        const result = await resend.emails.send({
            from: "noreply@share.surf",
            to: email,
            subject: "Share.surf - Reset Password",
            html: `<p>Hello, You can reset your password by entering the following code: <b>${code}</b></p>`
        });

        return NextResponse.json({ success: result.data ? true : false });
    } catch (ex: any) {
        console.error(ex);
        return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }
}