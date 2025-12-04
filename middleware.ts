import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getUploadPasswordHash } from "@/lib/uploads";
import { verify } from "argon2";

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const { pathname } = url;
    const password = request.headers.get("Share-Upload-Password");

    if (!pathname.startsWith("/uploads/")) return NextResponse.next();

    const id = pathname.slice(9);

    const passwordHash = await getUploadPasswordHash(id);

    if (!passwordHash?.length) return NextResponse.redirect(`https://uploads.share.surf/share/uploads/${id}`);

    if (!password?.length) return NextResponse.redirect(`https://share.surf/protected/${id}/error`);

    const valid = await verify(password, passwordHash);
    if (!valid) return NextResponse.redirect(`https://share.surf/protected/${id}/error`);

    return NextResponse.redirect(`https://uploads.share.surf/share/uploads/${id}`);
}

export const config = {
    matcher: ["/uploads/:path*"]
};