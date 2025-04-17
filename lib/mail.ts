import { Recipient, EmailParams, MailerSend } from "mailersend";

export const mailersend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY ?? "",
});

export default async function sendEmail(parameters: EmailParams, recipients: Recipient[]) {
    const emailParams = new EmailParams()
        .setFrom(parameters.from)
        .setTo(recipients)
        .setSubject(parameters.subject)
        .setHtml(parameters.html);

    await mailersend.email.send(emailParams);
}