import { NextResponse } from "next/server";

import { verifyUserAuthCode, updateUserAuthCode, verifyUserAccessCode, updateUserAccessCode, updateUserStatus, getUserByEmailAddress, UserStatus } from "@/lib/users";
import { createJWT } from "@/lib/jwt";

export async function GET(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") ?? "";
    const code = searchParams.get("code") ?? "";

    if (!email.length || !code.length) return NextResponse.redirect(new URL("/signin/error", request.url));

    const user = await getUserByEmailAddress(email);
    if (!user) return NextResponse.redirect(new URL("/signin/error", request.url));

    if (/^\d+$/.test(code) && await verifyUserAuthCode(email, parseInt(code))) {
        await updateUserAuthCode(email, null);
        await updateUserStatus(user.user_id, UserStatus.Verified);
    } else if (await verifyUserAccessCode(email, code)) {
        await updateUserAccessCode(email, null);
    } else {
        return NextResponse.redirect(new URL("/signin/error", request.url));
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
