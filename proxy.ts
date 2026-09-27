import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyUploadPassword, incrementUploadViews, checkPasswordIsSet, getUploadTitle } from "@/lib/uploads";

export async function proxy(request: NextRequest) {
	const url = request.nextUrl;
	const { pathname } = url;
	
	if (pathname.length != 9 || /[\.\-\?\&]/g.test(pathname)) return NextResponse.next();
	
	const id = pathname.slice(1);
	const password = request.headers.get("Share-Upload-Password");
	
	await incrementUploadViews(id);
	
	const passwordSet = await checkPasswordIsSet(id);
	
	if (!password && passwordSet) return NextResponse.redirect(`https://share.surf/protected/${id}`);
	
	const valid = await verifyUploadPassword(id, password ?? "");
	if (!valid) return NextResponse.json({ error: "Invalid password." }, { status: 401 });
	
	const title = await getUploadTitle(id);
	return NextResponse.redirect(`https://uploads.share.surf/share/uploads/${id}/${title}`);
}

export const config = {
	matcher: ["/:path*"]
};