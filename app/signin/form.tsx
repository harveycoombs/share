"use client";
import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faGoogle } from "@fortawesome/free-brands-svg-icons";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Notice from "@/app/components/common/Notice";

export default function LoginForm() {
    const [email, setEmailAddress] = useState<string>("");
    const [captchaToken, setCaptchaToken] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [warning, setWarning] = useState<string>("");
    
    async function login(e: any) {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");
        setWarning("");

        if (!email?.length) {
            setWarning("Missing email address");
            setLoading(false);
            return;
        }
    
        const response = await fetch("/api/user/session", {
            method: "POST",
            body: JSON.stringify({ email, captchaToken })
        });

        const json = await response.json();

        setLoading(false);
    
        switch (response.status) {
            case 200:
            case 201:
                setSuccess("Success! A sign-in link has been sent to your email.");
                break;
            case 400:
            case 401:
            case 403:
                setWarning(json.error);
                break;
            default:
                setError(json.error);
                break;
        }
    }

    return (
        <form onSubmit={login}>
            {success.length > 0 && <Notice color="green" classes="mb-5">{success}</Notice>}
            {warning.length > 0 && <Notice color="amber" classes="mb-5">{warning}</Notice>}
            {error.length > 0 && <Notice color="red" classes="mb-5">{error}</Notice>}

            <Label classes="block mt-2.5">Email Address</Label>
            <Field type="email" classes="block w-full" readOnly={success.length > 0} onInput={(e: any) => setEmailAddress(e.target.value)} />

            {!success.length && (
                <div className="my-4 w-fit relative left-1/2 -translate-x-1/2">
                    <HCaptcha
                        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""}
                        onVerify={(token: string, _: any) => setCaptchaToken(token)}
                    />
                </div>
            )}


            {!success.length && <Button classes="block w-full mt-4" disabled={!email.length || !captchaToken.length} loading={loading}>Continue</Button>}

            <div className="text-sm text-center text-slate-400 select-none mt-5 dark:text-zinc-500">
                Don&apos;t have an account?<Link href="/signup" className="text-blue-500 font-semibold ml-1.5 hover:underline">Sign Up</Link>
            </div>

            {!success.length && (
                <div className="text-sm text-center text-slate-400 select-none mt-2.5 dark:text-zinc-500">
                    Can&apos;t sign in?<Link href="/recover" className="text-blue-500 font-semibold ml-1.5 hover:underline">Recover Account</Link>
                </div>
            )}

            {!success.length && (
                <div className="relative border-b border-slate-400/40 text-slate-400/60 text-xs font-medium select-none my-6">
                    <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center bg-white px-1.5 dark:bg-zinc-950">OR</span>
                </div>
            )}
            
            {!success.length && (
                <div className="grid grid-cols-2 gap-2">
                    <Button color="gray" url="https://discord.com/oauth2/authorize?client_id=1394762759232819400&response_type=code&redirect_uri=https%3A%2F%2Fshare.surf%2Fapi%2Fsso%2Fdiscord&scope=identify+email">
                        <FontAwesomeIcon icon={faDiscord} />
                    </Button>

                    <Button color="gray" title="Currently Unavailable" disabled={true}>
                        <FontAwesomeIcon icon={faGoogle} />
                    </Button>
                </div>
            )}
        </form>
    );
}