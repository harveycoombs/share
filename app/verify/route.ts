import { NextResponse } from "next/server";

import { verifyUserAccessCode, updateUserAccessCode, updateUserAccessDate, getUserByEmailAddress } from "@/lib/users";
import { createJWT } from "@/lib/jwt";
import { getFileMetadata } from "@/lib/storage";

export async function GET(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") ?? "";
    const code = searchParams.get("code") ?? "";

    if (!email?.length || !code?.length) return NextResponse.json({ error: "One or more fields were not provided." });

    const valid = await verifyUserAccessCode(email, code);

    if (!valid) return NextResponse.json({ error: "Invalid code." });

    await updateUserAccessDate(email);
    await updateUserAccessCode(email, null);

    const user = await getUserByEmailAddress(email);
    
    if (!user) return NextResponse.json({ success: false }, { status: 500 });

    const credentials = createJWT(user);
    
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