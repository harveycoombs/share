import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const { pathname } = url;

    if (pathname.startsWith("/uploads/")) {
        const id = pathname.slice(9);
        return NextResponse.redirect(`https://uploads.share.surf/share/uploads/${id}`);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/uploads/:path*"]
};