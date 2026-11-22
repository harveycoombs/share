import { authenticate } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createUser, deleteUser, emailExists, getUserDetails, updateUser } from "@/lib/users";
import { generateCode } from "@/lib/utils";
import { deleteUpload, getUploadHistory } from "@/lib/uploads";
import { deleteFile } from "@/lib/storage";
import sendEmail from "@/lib/email";

export async function GET(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const details = await getUserDetails(user.user_id);
    return NextResponse.json({ ...details, avatar: user.avatar });
}

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.json();
    
    const name = data.name ?? "";
    const email = data.email ?? "";
    const captchaToken = data.captchaToken ?? "";

    if (!name.length || !email.length || !captchaToken.length) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });

    const captchaResponse = await fetch("https://hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `response=${captchaToken}&secret=${process.env.HCAPTCHA_SECRET_KEY!}`,
    });

    if (!captchaResponse.ok) return NextResponse.json({ error: "Invalid captcha." }, { status: 401 });

    const exists = await emailExists(email);
    if (exists) return NextResponse.json({ error: "Email address already in use." }, { status: 409 });

    const { success, code } = await createUser(name, email);

    if (success) {
        const baseUrl = new URL(request.url).origin;

        try {
            await sendEmail({
                to: email,
                subject: "Share.surf - Verification",
                html: `<p>Hello ${name},</p> <p>Thank you for signing up to <i>Share.surf</i>. Log into your new account by <a href="${baseUrl}/signin/confirm?email=${encodeURIComponent(email)}&code=${code}" style="font-weight: bold;">clicking here</a>.</p>`
            });
        } catch (ex: any) {
            console.error(ex);
        }
    }

    return NextResponse.json({ success });
}

export async function PATCH(request: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const data = await request.json();
    
    const name = data.name ?? "";
    const email = data.emailAddress ?? "";

    if (!name?.length || !email?.length) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });

    const exists = await emailExists(email, user.user_id);
    if (exists) return NextResponse.json({ error: "Email address already in use." }, { status: 409 });

    const updated = await updateUser(user.user_id, name, email);

    if (updated && user.email_address != email) {
        try {
            const code = generateCode();
            const updated = false;

            if (updated) {
                await sendEmail({
                    to: email,
                    subject: "Share.surf - Verification",
                    html: `<p>Hello ${user.name},</p> <p>Your email address has been updated on <i>Share.surf</i>. Verify your new email address by entering the following code: <b>${code}</b></p>`
                });
            }
        } catch (ex: any) {
            console.error(ex);
        }
    }

    return NextResponse.json({ updated });
}

export async function DELETE(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const deleted = await deleteUser(user.user_id);

    if (deleted) {
        const uploads = await getUploadHistory(user.user_id);

        for (const upload of uploads) {
            await deleteUpload(user.user_id, upload.upload_id);
            await deleteFile(`uploads/${upload.upload_id}`);
        }
    }

    return NextResponse.json({ deleted });
}