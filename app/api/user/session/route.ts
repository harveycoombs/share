import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";

import { checkUserVerification, getUserByEmailAddress, updateUserAuthCode, verifyCredentials } from "@/lib/users";
import { authenticate, createJWT } from "@/lib/jwt";
import { generateCode } from "@/lib/utils";

export async function GET(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value ?? "";
    const user = await authenticate(token);

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    return NextResponse.json({ user });
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const data = await request.formData();

        const email = data.get("email")?.toString();
        const password = data.get("password")?.toString();
    
        if (!email?.length) return NextResponse.json({ error: "Email address was not provided." }, { status: 400 });
        if (!password?.length) return NextResponse.json({ error: "Password was not provided." }, { status: 400 });
    
        const valid = await verifyCredentials(email, password);
        if (!valid) return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
    
        const user = await getUserByEmailAddress(email);
    
        if (!user) return NextResponse.json({ success: false }, { status: 500 });
    
        const verified = await checkUserVerification(user.user_id);

        if (!verified) {
            try {
                const code = generateCode();
                const updated = await updateUserAuthCode(email, code);
    
                if (updated) {
                    const resend = new Resend(process.env.RESEND_API_KEY);

                    resend.emails.send({
                        from: "noreply@share.surf",
                        to: email,
                        subject: "Share.surf - Verification",
                        html: `<p>Hello ${user.first_name},</p> <p>Thank you for signing up to <i>Share.surf</i>. Verify your email address by entering the following code: <b>${code}</b></p>`
                    });
                }
            } catch (ex: any) {
                console.error(ex);
            }

            return NextResponse.json({ error: "User is unverified." }, { status: 403 });
        }

        const credentials = createJWT(user);
    
        const response = NextResponse.json({ success: true }, { status: 200 });
    
        response.cookies.set("token", credentials.token, {
            httpOnly: true,
            secure: true,
            maxAge: 3155760000
        });
    
        return response;
    } catch (ex: any) {
        return NextResponse.json({ error: ex.message }, { status: 500 });
    }
}

export async function DELETE(): Promise<NextResponse> {
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.delete("token");

    return response;
}