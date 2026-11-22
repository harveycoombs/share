import { NextResponse } from "next/server";

import { verifyUserAuthCode, updateUserAuthCode, verifyUserAccessCode, updateUserAccessCode, updateUserStatus, getUserByEmailAddress, UserStatus } from "@/lib/users";
import { createJWT } from "@/lib/jwt";

export async function GET(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") ?? "";
    const code = searchParams.get("code") ?? "";

    const fail = () => NextResponse.redirect(new URL("/signin/error", request.url));

    if (!email.length || !code.length) return fail();

    const user = await getUserByEmailAddress(email);
    if (!user) return fail();

    if (/^\d+$/.test(code) && await verifyUserAuthCode(email, parseInt(code))) {
        // Sign-up verification link (numeric code)
        await updateUserAuthCode(email, null);
        await updateUserStatus(user.user_id, UserStatus.Verified);
    } else if (await verifyUserAccessCode(email, code)) {
        // Passwordless sign-in link (UUID code)
        await updateUserAccessCode(email, null);
    } else {
        return fail();
    }

    const credentials = await createJWT(user);
    const response = NextResponse.redirect(new URL("/", request.url));

    response.cookies.set("token", credentials.token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 2592000
    });

    return response;
}
