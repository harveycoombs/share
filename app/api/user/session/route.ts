import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getUserByEmailAddress, verifyCredentials } from "@/lib/users";
import { authenticate, createJWT } from "@/lib/jwt";

export async function GET(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value ?? "";
    const user = await authenticate(token);

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    return NextResponse.json({ user });
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const data = await request.formData();

        const email = data.get("email")?.toString();
        const password = data.get("password")?.toString();
    
        if (!email?.length) return NextResponse.json({ error: "Email address was not provided." }, { status: 400 });
        if (!password?.length) return NextResponse.json({ error: "Password was not provided." }, { status: 400 });
    
        const valid = await verifyCredentials(email, password);
        if (!valid) return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
    
        const user = await getUserByEmailAddress(email);
    
        if (!user) return NextResponse.json({ success: false }, { status: 500 });
    
        const credentials = createJWT(user);
    
        const response = NextResponse.json({ success: true }, { status: 200 });
    
        response.cookies.set("token", credentials.token, {
            httpOnly: true,
            secure: true,
            maxAge: 3155760000
        });
    
        return response;
    } catch (ex: any) {
        return NextResponse.json({ error: ex.message }, { status: 500 });
    }
}

export async function DELETE(): Promise<NextResponse> {
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.delete("token");

    return response;
}