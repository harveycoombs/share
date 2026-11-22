import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { authenticate } from "@/lib/jwt";
import { updateUserAccessCode, getUserByEmailAddress, verifyCredentials } from "@/lib/users";
import sendEmail from "@/lib/email";
import { createJWT } from "@/lib/jwt";
import { getFileMetadata } from "@/lib/storage";

export async function GET(_: Request): Promise<NextResponse> {
    const cookieJar = await cookies();
    const token = cookieJar.get("token")?.value ?? "";
    const user = await authenticate(token);

    if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    return NextResponse.json({ user });
}

export async function POST(request: Request): Promise<NextResponse> {
     try {
          const { email, password }: any = await request.json();
     
          if (!email?.length) return NextResponse.json({ error: "One or more fields were not provided." }, { status: 400 });

          const user = await getUserByEmailAddress(email);
     
          if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
     
          if (password?.length) {
               const success = await verifyCredentials(email, password);
     
               if (!success) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });

              const credentials = await createJWT(user);
              
              try {
                  const metadata = await getFileMetadata(`avatars/${user.user_id}`);
                  user.avatar = metadata ? `https://uploads.share.surf/share/avatars/${user.user_id}` : "/images/default.jpg";
              } catch {
                  user.avatar = "/images/default.jpg";
              }

               const response = NextResponse.json({ success: true, usingPassword: true }, { status: 200 });

               response.cookies.set("token", credentials.token, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 2592000
               });
          
               return response;
          }
     
          const code = crypto.randomUUID();
     
          await updateUserAccessCode(email, code);
     
          await sendEmail({
               to: email, 
               subject: "Share.surf - Sign In", 
               html: `<p>Hello ${user.name},</p> <p>To continue signing in to <i>Share.surf</i>, <a href="${new URL(request.url).origin}/signin/confirm?email=${encodeURIComponent(user.email_address)}&code=${code}" style="font-weight: bold;">click here</a>.</p>` 
          });
     
          return NextResponse.json({ success: true, usingPassword: false }, { status: 200 });
     } catch (ex: any) {
          return NextResponse.json({ success: false, error: ex.message }, { status: 500 });
     }
}

export async function DELETE(): Promise<NextResponse> {
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.delete("token");

    return response;
}