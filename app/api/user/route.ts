import { authenticate } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createUser, updateUserStatus, emailExists, getUserDetails, updateUser, updateUserPassword, verifyCredentials, checkUserPasswordUsage, UserStatus } from "@/lib/users";
import { generateCode, normalizeEmail } from "@/lib/utils";
import { deleteUpload, getUploadHistory } from "@/lib/uploads";
import { deleteFolder } from "@/lib/storage";
import sendEmail from "@/lib/email";

export async function GET(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const details = await getUserDetails(user.user_id);
    if (!details) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const { totp_secret, ...rest } = details;
    const has_password = await checkUserPasswordUsage(details.email_address);

    return NextResponse.json({ ...rest, has_totp: !!totp_secret?.length, has_password, avatar: user.avatar });
}

export async function POST(request: Request): Promise<NextResponse> {
    const data:any = await request.json();
    
    const name = (data.name ?? "").trim();
    const email = normalizeEmail(data.email);
    const captchaToken = data.captchaToken ?? "";

    if (!name.length || !email.length || !captchaToken.length) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email address." }, { status: 400 });

    const captchaResponse = await fetch("https://hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ response: captchaToken, secret: process.env.HCAPTCHA_SECRET_KEY! }).toString(),
    });

    const captchaResult: any = captchaResponse.ok ? await captchaResponse.json() : null;
    if (!captchaResult?.success) return NextResponse.json({ error: "Invalid captcha." }, { status: 401 });

    const exists = await emailExists(email);
    if (exists) return NextResponse.json({ error: "Email address already in use." }, { status: 409 });

    const { success, duplicate, code } = await createUser(name, email);
    if (duplicate) return NextResponse.json({ error: "Email address already in use." }, { status: 409 });

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

    const data:any = await request.json();
    
    const current = await getUserDetails(user.user_id);
    if (!current) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    // Untouched fields fall back to the current values.
    const name = (data.name ?? "").trim() || current.name;
    const email = normalizeEmail(data.emailAddress) || current.email_address;
    const oldPassword: string = data.oldPassword ?? "";
    const newPassword: string = data.newPassword ?? "";

    if (!name?.length || !email?.length) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });

    if (newPassword.length) {
        if (newPassword.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

        // Accounts that already have a password must confirm it; passwordless accounts can set one directly.
        const hasPassword = await checkUserPasswordUsage(current.email_address);

        if (hasPassword && !(await verifyCredentials(current.email_address, oldPassword))) {
            return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
        }
    }

    const exists = await emailExists(email, user.user_id);
    if (exists) return NextResponse.json({ error: "Email address already in use." }, { status: 409 });

    let updated = false;

    try {
        updated = await updateUser(user.user_id, name, email);
        if (updated && newPassword.length) updated = await updateUserPassword(user.user_id, newPassword);
    } catch (ex: any) {
        if (/UNIQUE constraint failed/i.test(ex?.message ?? "")) return NextResponse.json({ error: "Email address already in use." }, { status: 409 });
        throw ex;
    }

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

    const deleted = await updateUserStatus(user.user_id, UserStatus.Deleted);

    if (deleted) {
        const uploads = await getUploadHistory(user.user_id);

        for (const upload of uploads) {
            await deleteFolder(`uploads/${upload.access_id}/`).catch((ex: any) => console.error(ex.message));
            await deleteUpload(user.user_id, upload.upload_id);
        }
    }

    return NextResponse.json({ deleted });
}