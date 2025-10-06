import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";

import { checkUserVerification, getUserByEmailAddress, updateUserAuthCode, verifyCredentials, getUserTOTPSecret } from "@/lib/users";
import { authenticate, createJWT } from "@/lib/jwt";
import { generateCode } from "@/lib/utils";
import { getFileMetadata } from "@/lib/files";

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
        const password = data.password ?? "";
    
        if (!email?.length) return NextResponse.json({ error: "Email address was not provided." }, { status: 400 });
        if (!password?.length) return NextResponse.json({ error: "Password was not provided." }, { status: 400 });
    
        const valid = await verifyCredentials(email, password);
        if (!valid) return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
    
        let user = await getUserByEmailAddress(email);
    
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
                        html: `<p>Hello ${user.name},</p> <p>Thank you for signing up to <i>Share.surf</i>. Verify your email address by entering the following code: <b>${code}</b></p>`
                    });
                }
            } catch (ex: any) {
                console.error(ex);
            }

            return NextResponse.json({ success: true, destination: `/verify?email=${encodeURIComponent(email)}` }, { status: 200 });
        }

        const totpSecret = await getUserTOTPSecret(user.user_id);

        if (totpSecret?.length) {
            const response = NextResponse.json({ success: true, destination: "/authenticate" }, { status: 200 });
            
            response.cookies.set("email", email, {
                httpOnly: true,
                secure: true,
                maxAge: 300
            });

            return response;
        }

        try {
            const metadata = await getFileMetadata(`avatars/${user.user_id}`);
            user.avatar = metadata ? `https://uploads.share.surf/share/avatars/${user.user_id}` : "/images/default.jpg";
        } catch {
            user.avatar = "/images/default.jpg";
        }

        const credentials = createJWT(user);
    
        const response = NextResponse.json({ success: true, destination: "/" }, { status: 200 });
    
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