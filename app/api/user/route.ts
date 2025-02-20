import { authenticate } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, emailExists, getUserDetails } from "@/lib/users";

export async function GET(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const details = await getUserDetails(user.user_id);
    return NextResponse.json({ details });
}

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.formData();
    
    const firstName = data.get("firstName")?.toString() ?? "";
    const lastName = data.get("lastName")?.toString() ?? "";
    const email = data.get("emailAddress")?.toString() ?? "";
    const password = data.get("password")?.toString() ?? "";

    if (!firstName || !lastName || !email || !password) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });

    const exists = await emailExists(email);
    if (exists) return NextResponse.json({ error: "Email address already in use." }, { status: 409 });

    const success = await createUser(firstName, lastName, email, password);
    return NextResponse.json({ success });
}