
"use client";
import { useState, useEffect } from "react";
import router from "next/router";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import { faApple, faGoogle, faMicrosoft } from "@fortawesome/free-brands-svg-icons";

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

        if (!name || !email || !password) {
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

        setLoading(false);

        switch (response.status) {
            case 200:
                router.push("/verify");
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

            <div className="my-4.5 w-fit relative left-1/2 -translate-x-1/2">
                <HCaptcha
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""}
                    onVerify={(token,ekey) => setCaptchaToken(token)}
                />
            </div>

            <Button classes="block w-full" loading={loading} disabled={errorExists || warningExists} onClick={register}>Continue</Button>
            <Button url="/login" transparent={true} classes="block w-full mt-2.5">I Already Have An Account</Button>

            <div className="relative border-b border-slate-400/40 text-slate-400/60 text-xs font-medium select-none mt-4.5 mb-6">
                <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center bg-white px-1.5">OR</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <SSOButton icon={faGoogle} classes="hover:bg-blue-100 hover:text-blue-500" />
                <SSOButton icon={faApple} classes="text-xl hover:bg-slate-300 hover:text-white" />
                <SSOButton icon={faMicrosoft} classes="hover:bg-emerald-100 hover:text-emerald-500" />
            </div>
        </div>
    );
}

function SSOButton({ icon, classes = "", ...rest }: any) {
    return (
        <div className={`p-2 rounded-md bg-slate-100 text-slate-500 text-lg text-center select-none cursor-pointer duration-150 ${classes}`} {...rest}>
            <FontAwesomeIcon icon={icon} className="duration-150" />
        </div>
    );
}