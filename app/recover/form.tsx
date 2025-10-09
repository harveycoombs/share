"use client";
import { useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";

export default function RecoveryForm() {
    const [email, setEmail] = useState<string>("");
    const [captchaToken, setCaptchaToken] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [firstDigit, setFirstDigit] = useState<string>("");
    const [secondDigit, setSecondDigit] = useState<string>("");
    const [thirdDigit, setThirdDigit] = useState<string>("");
    const [fourthDigit, setFourthDigit] = useState<string>("");
    const [fifthDigit, setFifthDigit] = useState<string>("");
    const [sixthDigit, setSixthDigit] = useState<string>("");
    
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [warning, setWarning] = useState<string>("");

    const [sent, setSent] = useState<boolean>(false);
    const [verified, setVerified] = useState<boolean>(false);
    
    async function sendEmail(e: any) {
        e.preventDefault();

        setLoading(true);
        setError("");
        setWarning("");

        if (!email?.length) {
            setWarning("Missing email address");
            setLoading(false);
            return;
        }

        const response = await fetch("/api/user/recover", {
            method: "POST",
            body: JSON.stringify({ email, captchaToken })
        });

        setLoading(false);

        if (!response.ok) {
            const json = await response.json();
            setError(json.error);
        }

        setSent(response.ok);
    }

    async function resetPassword(e: any) {
        e.preventDefault();

        if (!firstDigit?.length || !secondDigit?.length || !thirdDigit?.length || !fourthDigit?.length || !fifthDigit?.length || !sixthDigit?.length) {
            setWarning("Please enter all digits");
            return;
        }

        const code = `${firstDigit}${secondDigit}${thirdDigit}${fourthDigit}${fifthDigit}${sixthDigit}`;

        setLoading(true);

        const response = await fetch("/api/user/password/reset", {
            method: "POST",
            body: JSON.stringify({ email, password, code })
        });

        setLoading(false);

        if (!response.ok) {
            const json = await response.json();
            setError(json.error);
        }

        setVerified(response.ok);

        if (response.ok) {
            window.location.href = "/signin";
        }
    }

    function handleDigitInput(e: any, index: number) {
        const value = e.target.value;

        switch (index) {
            case 0:
                setFirstDigit(value);
                break;
            case 1:
                setSecondDigit(value);
                break;
            case 2:
                setThirdDigit(value);
                break;
            case 3:
                setFourthDigit(value);
                break;
            case 4:
                setFifthDigit(value);
                break;
            case 5:
                setSixthDigit(value);
                break;
        }

        if (!value?.length) {
            e.target.previousSibling?.focus();

            switch (index) {
                case 0:
                    setFirstDigit("");
                    break;
                case 1:
                    setSecondDigit("");
                    break;
                case 2:
                    setThirdDigit("");
                    break;
                case 3:
                    setFourthDigit("");
                    break;
                case 4:
                    setFifthDigit("");
                    break;
                case 5:
                    setSixthDigit("");
                    break;
            }
        } else {
            e.target.nextSibling?.focus();
        }
    }

    function handlePaste(e: any) {
        if (!e.clipboardData?.getData("text")?.length) return;

        const text = (e.clipboardData?.getData("text") ?? "");

        setFirstDigit(text.charAt(0));
        setSecondDigit(text.charAt(1));
        setThirdDigit(text.charAt(2));
        setFourthDigit(text.charAt(3));
        setFifthDigit(text.charAt(4));
        setSixthDigit(text.charAt(5));

        e.preventDefault();
    }

    return (
        <form onSubmit={sent ? resetPassword : sendEmail}>
            {warning.length > 0 && <div className="text-sm font-medium text-amber-500 text-center mb-5">{warning}</div>}
            {error.length > 0 && <div className="text-sm font-medium text-red-500 text-center mb-5">{error}</div>}
            {sent && verified && <div className="text-sm font-medium text-emerald-500 text-center mb-5">Success! You will be redirected shortly</div>}

            {!sent && (
                <>
                    <Label classes="block mt-2.5" error={error.length > 0} warning={warning.length > 0}>Email Address</Label>
                    <Field type="email" classes="block w-full" error={error.length > 0} warning={warning.length > 0} onInput={(e: any) => setEmail(e.target.value.trim())} />
                </>
            )}

            {sent && !verified && (
                <>
                    <Label classes="block" error={error.length > 0} warning={warning.length > 0}>Verification Code</Label>

                    <div className="w-full mt-2.5 grid grid-cols-6 gap-2 mb-2.5">
                        <Field error={error.length > 0} warning={warning.length > 0} classes="text-center" defaultValue={firstDigit} onInput={(e: any) => handleDigitInput(e, 0)} onPaste={handlePaste} />
                        <Field error={error.length > 0} warning={warning.length > 0} classes="text-center" defaultValue={secondDigit} onInput={(e: any) => handleDigitInput(e, 1)} onPaste={handlePaste} />
                        <Field error={error.length > 0} warning={warning.length > 0} classes="text-center" defaultValue={thirdDigit} onInput={(e: any) => handleDigitInput(e, 2)} onPaste={handlePaste} />
                        <Field error={error.length > 0} warning={warning.length > 0} classes="text-center" defaultValue={fourthDigit} onInput={(e: any) => handleDigitInput(e, 3)} onPaste={handlePaste} />
                        <Field error={error.length > 0} warning={warning.length > 0} classes="text-center" defaultValue={fifthDigit} onInput={(e: any) => handleDigitInput(e, 4)} onPaste={handlePaste} />
                        <Field error={error.length > 0} warning={warning.length > 0} classes="text-center" defaultValue={sixthDigit} onInput={(e: any) => handleDigitInput(e, 5)} onPaste={handlePaste} />
                    </div>

                    <Label classes="block" error={error.length > 0} warning={warning.length > 0}>New Password</Label>
                    <Field type="password" classes="block w-full my-2.5" error={error.length > 0} warning={warning.length > 0} onInput={(e: any) => setPassword(e.target.value.trim())} />
                </>
            )}

            {!sent && (
                <div className="mt-5 mb-4.5 w-fit relative left-1/2 -translate-x-1/2">
                    <HCaptcha
                        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""}
                        onVerify={(token, _) => setCaptchaToken(token)}
                    />
                </div>
            )}

            <Button classes="block w-full" loading={loading} disabled={error.length > 0 || warning.length > 0 || !captchaToken?.length || !email.length}>{sent ? "Reset Password" : "Send Code"}</Button>
        </form>
    );
}