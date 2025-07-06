
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { faApple, faGoogle, faMicrosoft } from "@fortawesome/free-brands-svg-icons";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import SSOButton from "@/app/components/common/SSOButton";

export default function RegistrationForm() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [captchaToken, setCaptchaToken] = useState<string>("");

    const [passwordStrength, setPasswordStrength] = useState<number>(0);
    const [feedback, setFeedback] = useState<React.JSX.Element|null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorExists, setErrorExistence] = useState<boolean>(false);
    const [warningExists, setWarningExistence] = useState<boolean>(false);

    async function register() {
        setFeedback(null);
        setLoading(true);
        setErrorExistence(false);
        setWarningExistence(false);

        if (!name?.length || !email?.length || !password?.length) {
            setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">One or more fields were not provided</div>);
            setWarningExistence(true);
            setLoading(false);
            return;
        }

        const response = await fetch("/api/user", {
            method: "POST",
            body: new URLSearchParams({
                name,
                email,
                password,
                captchaToken
            })
        });

        switch (response.status) {
            case 200:
                window.location.href = `/verify?email=${encodeURIComponent(email)}`;
                break;
            case 400:
                setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">One or more fields were not provided</div>);
                setWarningExistence(true);
                break;
            case 401:
                setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">Invalid captcha</div>);
                setWarningExistence(true);
                break;
            case 409:
                setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">Email address already in use</div>);
                setWarningExistence(true);
                break;
            default:
                setFeedback(<div className="text-sm font-medium text-red-500 text-center mt-5">Something went wrong</div>);
                setErrorExistence(true);
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

    return (
        <div onInput={() => { setFeedback(null); setErrorExistence(false); setWarningExistence(false); }}>
            {feedback}
            <Label classes="block mt-2.5" error={errorExists} warning={warningExists}>Name</Label>
            <Field type="text" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setName(e.target.value)} />

            <Label classes="block mt-2.5" error={errorExists} warning={warningExists}>Email Address</Label>
            <Field type="email" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setEmail(e.target.value)} />

            <Label classes="block mt-2.5" error={errorExists} warning={warningExists}>Password</Label>
            <Field type="password" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setPassword(e.target.value)} />

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
                    onVerify={(token, _) => setCaptchaToken(token)}
                />
            </div>

            <Button classes="block w-full" loading={loading} disabled={errorExists || warningExists || !captchaToken?.length} onClick={register}>Continue</Button>
            
            <div className="text-sm font-medium text-center text-slate-400 select-none my-5">
                Already have an account?<Link href="/login" className="text-indigo-500 font-semibold ml-1.5 hover:underline">Sign In</Link>
            </div>

            <div className="relative border-b border-slate-400/40 text-slate-400/60 text-xs font-medium select-none my-6">
                <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center bg-white px-1.5">OR</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <SSOButton icon={faGoogle} classes="hover:from-blue-50 hover:to-blue-100 hover:text-blue-500 hover:border-blue-300" title="Sign up with Google" />
                <SSOButton icon={faApple} classes="text-xl hover:from-slate-100 hover:to-slate-200" title="Sign up with Apple" />
                <SSOButton icon={faMicrosoft} classes="hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-500 hover:border-emerald-300" title="Sign up with Microsoft" />
            </div>
        </div>
    );
}