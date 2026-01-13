"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { faDiscord, faGoogle } from "@fortawesome/free-brands-svg-icons";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function RegistrationForm() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [captchaToken, setCaptchaToken] = useState<string>("");
    const [consent, setConsent] = useState<boolean>(false);

    const [passwordStrength, setPasswordStrength] = useState<number>(0);

    const [loading, setLoading] = useState<boolean>(false);

    const [error, setError] = useState<string>("");
    const [warning, setWarning] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    async function register() {
        setError("");
        setWarning("");
        setSuccess("");
        setLoading(true);

        if (!name?.length || !email?.length || !password?.length || !captchaToken?.length || !consent) {
            setWarning("One or more fields were not provided");
            setLoading(false);
            return;
        }

        const response = await fetch("/api/user", {
            method: "POST",
            body: JSON.stringify({
                name,
                email,
                password,
                captchaToken
            })
        });

        const json = await response.json();

        switch (response.status) {
            case 200:
                window.location.href = `/verify?email=${encodeURIComponent(email)}`;
                break;
            case 400:
            case 401:
            case 409:
                setWarning(json.error);
                break;
            default:
                setError(json.error);
                break;
        }

        setLoading(false);
    }

    useEffect(() => {
        const symbolsExpr = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        const numbersExpr = /[0-9]/;
        const uppercaseExpr = /[A-Z]/;
        const lowercaseExpr = /[a-z]/;

        const hasSymbols = symbolsExpr.test(password);
        const hasNumbers = numbersExpr.test(password);
        const hasUppercaseChars = uppercaseExpr.test(password);
        const hasLowercaseChars = lowercaseExpr.test(password);

        switch (true) {
            case (hasSymbols || hasNumbers) && (hasUppercaseChars || hasLowercaseChars) && password.length >= 12:
                setPasswordStrength(2);
                break;
            case (hasSymbols || hasNumbers) && (hasUppercaseChars || hasLowercaseChars) && password.length >= 6:
                setPasswordStrength(1);
                break;
            default:
                setPasswordStrength(0);
        }
    }, [password])

    const resetFeedback = useCallback(() => {
        setError("");
        setWarning("");
        setSuccess("");
    }, []);

    return (
        <div onInput={resetFeedback}>
            {success.length > 0 && <div className="text-sm font-medium text-emerald-500 text-center mb-5">{success}</div>}
            {warning.length > 0 && <div className="text-sm font-medium text-amber-500 text-center mb-5">{warning}</div>}
            {error.length > 0 && <div className="text-sm font-medium text-red-500 text-center mb-5">{error}</div>}

            <Label classes="block mt-2.5" error={error.length > 0} warning={warning.length > 0}>Name</Label>
            <Field type="text" classes="block w-full" error={error.length > 0} warning={warning.length > 0} onInput={(e: any) => setName(e.target.value.trim())} />

            <Label classes="block mt-2.5" error={error.length > 0} warning={warning.length > 0}>Email Address</Label>
            <Field type="email" classes="block w-full" error={error.length > 0} warning={warning.length > 0} onInput={(e: any) => setEmail(e.target.value.trim())} />

            <Label classes="block mt-2.5" error={error.length > 0} warning={warning.length > 0}>Password</Label>
            <Field type="password" classes="block w-full" error={error.length > 0} warning={warning.length > 0} onInput={(e: any) => setPassword(e.target.value.trim())} />

            <div className="mt-3">
                <div className="text-[0.8rem] font-medium mb-1">{passwordStrength == 0 ? "Weak" : passwordStrength == 1 ? "Average" : "Strong"} password</div>

                <div className="flex gap-1.5">
                    <div className={`w-1/3 h-1.25 rounded-l-full ${passwordStrength == 0 ? "bg-red-500" : passwordStrength == 1 ? "bg-amber-500" : "bg-green-500"}`}></div>
                    <div className={`w-1/3 h-1.25 ${passwordStrength == 2 ? "bg-green-500" : passwordStrength == 1 ? "bg-amber-500" : "bg-gray-200"}`}></div>
                    <div className={`w-1/3 h-1.25 rounded-r-full ${passwordStrength == 2 ? "bg-green-500" : "bg-gray-200"}`}></div>
                </div>
            </div>

            <div className="mt-5 mb-4.5 w-fit relative left-1/2 -translate-x-1/2">
                <HCaptcha
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""}
                    onVerify={(token: string, _: any) => setCaptchaToken(token)}
                />
            </div>

            <div className="text-sm text-center text-slate-400 select-none my-5 flex items-center justify-center gap-2 dark:text-zinc-500">
                <input type="checkbox" className="w-4 h-4 accent-blue-500" checked={consent} onChange={(e: any) => setConsent(e.target.checked)} />

                <div>
                    I agree to the
                    <Link href="/documents/terms-of-service.pdf" className="text-blue-500 font-semibold ml-1.25 hover:underline">Terms of Service</Link>
                </div>
            </div>

            <Button classes="block w-full" loading={loading} disabled={error.length > 0 || warning.length > 0 || !captchaToken?.length || !consent} onClick={register}>Continue</Button>
            
            <div className="text-sm text-center text-slate-400 select-none my-5 dark:text-zinc-500">
                Already have an account?
                <Link href="/signin" className="text-blue-500 font-semibold ml-1.25 hover:underline">Sign In</Link>
            </div>

            <div className="relative border-b border-slate-400/40 text-slate-400/60 text-xs font-medium select-none my-6">
                <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center bg-white px-1.5 dark:bg-zinc-950">OR</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <Button color="gray" url="https://discord.com/oauth2/authorize?client_id=1394762759232819400&response_type=code&redirect_uri=https%3A%2F%2Fshare.surf%2Fapi%2Fsso%2Fdiscord&scope=identify+email">
                    <FontAwesomeIcon icon={faDiscord} />
                </Button>
                
                <Button color="gray" title="Currently Unavailable" disabled={true}>
                    <FontAwesomeIcon icon={faGoogle} />
                </Button>
            </div>
        </div>
    );
}