import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import AdmZip from "adm-zip";
import { Resend } from "resend";

import { authenticate } from "@/lib/jwt";
import { getUserData } from "@/lib/users";
import { getUploadHistory } from "@/lib/uploads";

export async function GET(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value;
    const user = await authenticate(token ?? "");

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const zip = new AdmZip();

    const details = await getUserData(user.user_id);
    const uploads = await getUploadHistory(user.user_id);

    const detailsBuff = Buffer.from(JSON.stringify(details, null, 2));
    const uploadsBuff = Buffer.from(JSON.stringify(uploads, null, 2));

    zip.addFile("details.json", detailsBuff);
    zip.addFile("uploads.json", uploadsBuff);

    const buffer = await zip.toBufferPromise();

    const resend = new Resend(process.env.RESEND_API_KEY ?? "");

    const result = await resend.emails.send({
        from: "noreply@share.surf",
        to: details?.email_address ?? "",
        subject: "Share - GDPR Data Export",
        html: "Please see the attached file for your data.",
        attachments: [{
            filename: "data.zip",
            content: Buffer.from(buffer)
        }]
    });

    return NextResponse.json({ success: !result.error?.message?.length, error: result.error?.message }, { status: result.error?.message?.length ? 500 : 200 });
}