import { NextResponse } from "next/server";

import { verifyUserAuthCode, updateUserAuthCode, updateUserPasswordByEmail } from "@/lib/users";
import { Resend } from "resend";

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.json();

    const email = data.email ?? "";
    const password = data.password ?? "";
    const code = parseInt(data.code || "0");

    const verified = await verifyUserAuthCode(email, code);

    await updateUserAuthCode(email, null);

    if (!verified) return NextResponse.json({ error: "Invalid code." }, { status: 400 });

    const updated = await updateUserPasswordByEmail(email, password);
    
    if (updated) {
        const resend = new Resend(process.env.RESEND_API_KEY!);

        resend.emails.send({
            from: "noreply@share.surf",
            to: email,
            subject: "Share.surf - Password Reset",
            html: "Your password was just reset. If you did not request this, please <a href='mailto:contact@harveycoombs.com'>click here</a> to receive support."
        });
    }

    return NextResponse.json({ updated });
}