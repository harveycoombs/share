import { authenticate } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, deleteUser, emailExists, getUserDetails, updateUser, verifyCredentials, updateUserPassword } from "@/lib/users";

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

export async function PATCH(request: Request): Promise<NextResponse> {
    let passwordUpdated = false;

    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const data = await request.formData();
    
    const firstName = data.get("firstName")?.toString() ?? "";
    const lastName = data.get("lastName")?.toString() ?? "";
    const email = data.get("emailAddress")?.toString() ?? "";

    const oldPassword = data.get("oldpassword")?.toString() ?? "";
    const newPassword = data.get("newpassword")?.toString() ?? "";

    if (oldPassword?.length && newPassword?.length) {
        const validExistingPassword = await verifyCredentials(user.email_address, oldPassword);
        if (!validExistingPassword) return NextResponse.json({ error: "Invalid existing password." }, { status: 401 });

        passwordUpdated = await updateUserPassword(user.user_id, newPassword);
    }

    if ((!firstName?.length || !lastName?.length || !email?.length) && (!oldPassword?.length || !newPassword?.length)) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });

    const exists = await emailExists(email, user.user_id);
    if (exists) return NextResponse.json({ error: "Email address already in use." }, { status: 409 });

    const updated = await updateUser(user.user_id, firstName, lastName, email);
    return NextResponse.json({ updated, passwordUpdated });
}

export async function DELETE(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const deleted = await deleteUser(user.user_id);
    return NextResponse.json({ deleted });
}
