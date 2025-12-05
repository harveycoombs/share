import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyUploadPassword, incrementUploadViews, checkPasswordIsSet } from "@/lib/uploads";

export async function proxy(request: NextRequest) {
    const url = request.nextUrl;
    const { pathname } = url;

    if (!pathname.startsWith("/uploads/")) return NextResponse.next();

    const id = pathname.slice(9);
    const password = request.headers.get("Share-Upload-Password");

    const passwordSet = await checkPasswordIsSet(id);

    if (!password && passwordSet) return NextResponse.redirect(`https://share.surf/protected/${id}`);

    const valid = await verifyUploadPassword(id, password ?? "");
    if (!valid) return NextResponse.json({ error: "Invalid password." }, { status: 401 });

    await incrementUploadViews(id);

    return NextResponse.redirect(`https://uploads.share.surf/share/uploads/${id}`);
}

export const config = {
    matcher: ["/uploads/:path*"]
};