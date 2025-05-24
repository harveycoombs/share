import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EmailParams, Recipient } from "mailersend";

import sendEmail from "@/lib/mail";
import { authenticate } from "@/lib/jwt";

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.formData();

    const content = data.get("content")?.toString() ?? "";
    const name = data.get("name")?.toString() ?? "";
    const emailAddress = data.get("email")?.toString() ?? "";

    const ipAddress = request.headers.get("x-forwarded-for") ?? "Unknown";
    const userAgent = request.headers.get("user-agent") ?? "Unknown";

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");
    
    try {
        const recipients = [new Recipient("contact@harveycoombs.com", "Harvey Coombs")];

        const emailParams = new EmailParams()
            .setFrom({ email: "noreply@share.surf", name: "Share.surf" })
            .setSubject("Share.surf - Issue")
            .setHtml(`<p>${content}</p><br/><br/><p>Reporter Name: <strong>${name}</strong></p><p>Reporter Email Address: <strong>${emailAddress}</strong></p><p>User ID: <strong>${user?.user_id ?? "Guest"}</strong></p><p>IP Address: <strong>${ipAddress}</strong></p><p>User Agent: <strong>${userAgent}</strong></p>`);
    
        await sendEmail(emailParams, recipients);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (ex: any) {
        console.error(ex);
        return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }
}