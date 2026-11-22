import { NextResponse } from "next/server";

import { verifyUserAuthCode, updateUserAuthCode, getUserByEmailAddress } from "@/lib/users";
import { createJWT } from "@/lib/jwt";
import { getFileMetadata } from "@/lib/storage";

export async function GET(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") ?? "";
    const code = parseInt(searchParams.get("code") || "0");

    if (!email?.length || !code) return NextResponse.redirect(new URL("/signin/error", request.url));

    const user = await getUserByEmailAddress(email);
    
    if (!user) return NextResponse.redirect(new URL("/signin/error", request.url));

    const valid = await verifyUserAuthCode(email, code);

    if (!valid) return NextResponse.redirect(new URL("/signin/error", request.url));

    await updateUserAuthCode(email, null);

    const credentials = await createJWT(user);
    
    try {
        const metadata = await getFileMetadata(`avatars/${user.user_id}`);
        user.avatar = metadata ? `https://uploads.share.surf/share/avatars/${user.user_id}` : "/images/default.jpg";
    } catch {
        user.avatar = "/images/default.jpg";
    }

    const response = NextResponse.redirect(new URL("/", request.url));

    response.cookies.set("token", credentials.token, {
        httpOnly: true,
        secure: true,
        maxAge: 3155760000
    });

    return response;
}