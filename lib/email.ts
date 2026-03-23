import { Resend } from "resend";

interface EmailParameters {
    to: string;
    subject: string;
    html: string;
}

export default async function sendEmail({ to, subject, html }: EmailParameters): Promise<void> {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const result = await resend.emails.send({ from: "noreply@share.surf", to, subject, html });

    if (result.error?.message?.length) throw new Error(result.error.message);
}