import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth0 } from "@/lib/auth0";
import { verifyUploadPassword, incrementUploadViews, checkPasswordIsSet } from "@/lib/uploads";

export async function proxy(request: NextRequest) {
    const url = request.nextUrl;
    const { pathname } = url;

    if (!pathname.startsWith("/uploads/")) return await auth0.middleware(request);

    const id = pathname.slice(9);
    const password = request.headers.get("Share-Upload-Password");

    await incrementUploadViews(id);

    const passwordSet = await checkPasswordIsSet(id);

    if (!password && passwordSet) return NextResponse.redirect(`https://share.surf/protected/${id}`);

    const valid = await verifyUploadPassword(id, password ?? "");
    if (!valid) return NextResponse.json({ error: "Invalid password." }, { status: 401 });

    return NextResponse.redirect(`https://uploads.share.surf/share/uploads/${id}`);
}

export const config = {
    matcher: ["/uploads/:path*", "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"]
};