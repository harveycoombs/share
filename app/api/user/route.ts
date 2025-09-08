import { authenticate } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";

import { createUser, deleteUser, emailExists, getUserDetails, updateUser, verifyCredentials, updateUserPassword, updateUserAuthCode } from "@/lib/users";
import { generateCode } from "@/lib/utils";

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
    
    const name = data.get("name")?.toString() ?? "";
    const email = data.get("email")?.toString() ?? "";
    const password = data.get("password")?.toString() ?? "";
    const captchaToken = data.get("captchaToken")?.toString() ?? "";

    if (!name.length || !email.length || !password.length || !captchaToken.length) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });

    const captchaResponse = await fetch("https://hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `response=${captchaToken}&secret=${process.env.HCAPTCHA_SECRET_KEY}`,
    });

    if (!captchaResponse.ok) return NextResponse.json({ error: "Invalid captcha." }, { status: 401 });

    const exists = await emailExists(email);
    if (exists) return NextResponse.json({ error: "Email address already in use." }, { status: 409 });

    const created = await createUser(name, email, password);

    if (created) {
        try {
            const code = generateCode();
            const updated = await updateUserAuthCode(email, code);

            if (updated) {
                const resend = new Resend(process.env.RESEND_API_KEY);

                resend.emails.send({
                    from: "noreply@share.surf",
                    to: email,
                    subject: "Share.surf - Verification",
                    html: `<p>Hello ${name},</p> <p>Thank you for signing up to <i>Share.surf</i>. Verify your email address by entering the following code:<b>${code}</b></p>`
                });
            }
        } catch (ex: any) {
            console.error(ex);
        }
    }

    return NextResponse.json({ success: created });
}

export async function PATCH(request: Request): Promise<NextResponse> {
    let passwordUpdated = false;

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const data = await request.json();
    
    const name = data.get("name")?.toString() ?? "";
    const email = data.get("emailAddress")?.toString() ?? "";

    const oldPassword = data.get("oldpassword")?.toString() ?? "";
    const newPassword = data.get("newpassword")?.toString() ?? "";

    if (oldPassword?.length && newPassword?.length) {
        const validExistingPassword = await verifyCredentials(user.email_address, oldPassword);
        if (!validExistingPassword) return NextResponse.json({ error: "Invalid existing password." }, { status: 401 });

        passwordUpdated = await updateUserPassword(user.user_id, newPassword);
    }

    if ((!name?.length || !email?.length) && (!oldPassword?.length || !newPassword?.length)) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });

    const exists = await emailExists(email, user.user_id);
    if (exists) return NextResponse.json({ error: "Email address already in use." }, { status: 409 });

    const updated = await updateUser(user.user_id, name, email);

    if (updated && user.email_address != email) {
        try {
            const code = generateCode();
            const updated = await updateUserAuthCode(email, code);

            if (updated) {
                const resend = new Resend(process.env.RESEND_API_KEY);

                resend.emails.send({
                    from: "noreply@share.surf",
                    to: email,
                    subject: "Share.surf - Verification",
                    html: `<p>Hello ${user.name},</p> <p>Your email address has been updated on <i>Share.surf</i>. Verify your new email address by entering the following code: <b>${code}</b></p>`
                });
            }
        } catch (ex: any) {
            console.error(ex);
        }
    }

    return NextResponse.json({ updated, passwordUpdated });
}

export async function DELETE(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const deleted = await deleteUser(user.user_id);
    return NextResponse.json({ deleted });
}
