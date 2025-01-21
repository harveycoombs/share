import { authenticate } from "@/data/jwt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserDetails } from "@/data/users";

export async function GET(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const details = await getUserDetails(user.user_id);
    return NextResponse.json({ details });
}

/*export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.formData();
}

export async function PATCH(request: Request): Promise<NextResponse> {
    const data = await request.formData();
}

export async function DELETE(request: Request): Promise<NextResponse> {
}*/