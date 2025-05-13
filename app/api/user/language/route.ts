import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { authenticate } from "@/lib/jwt";
import { getUserLanguage, updateLanguage } from "@/lib/users";

export async function GET(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value ?? "";
    const user = await authenticate(token);

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const language = await getUserLanguage(user.user_id);

    return NextResponse.json({ language });
}

export async function PATCH(request: Request): Promise<NextResponse> {
    const data = await request.formData();
    const language = data.get("language")?.toString() ?? "";

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const success = await updateLanguage(user.user_id, language);
    return NextResponse.json({ success }, { status: 200 });
}