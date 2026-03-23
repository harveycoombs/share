"use client";
import { useState, useCallback } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { motion, AnimatePresence } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faGoogle } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import Notice from "@/app/components/common/Notice";

export default function RegistrationForm() {
    const [proceed, setProceed] = useState<boolean>(false);
    
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [captchaToken, setCaptchaToken] = useState<string>("");
    const [consent, setConsent] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);

    const [error, setError] = useState<string>("");
    const [warning, setWarning] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    async function resetFeedback() {
        setError("");
        setWarning("");
        setSuccess("");
    }

    async function checkEmail() {
        resetFeedback();
        setProceed(false);
        setLoading(true);
        
        const response = await fetch(`/api/user/email?email=${encodeURIComponent(email)}`);
        const json = await response.json();

        setLoading(false);

        if (!response.ok) {
            setError(json.error);
            return;
        }

        if (json.exists) {
            setWarning("Email address already in use");
            return;
        }

        setProceed(true);
    }

    async function register(e: any) {
        e.preventDefault();

        if (!proceed) {
            await checkEmail();
            return;
        }

        resetFeedback();
        setLoading(true);

        if (!name?.length || !email?.length || !captchaToken?.length || !consent) {
            setWarning("One or more fields were not provided");
            setLoading(false);
            return;
        }

        const response = await fetch("/api/user", {
            method: "POST",
            body: JSON.stringify({
                name,
                email,
                captchaToken
            })
        });

        const json = await response.json();

        switch (response.status) {
            case 200:
                setSuccess("Success! Check your email for a verification link.");
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

    return (
        <form onSubmit={register} onInput={resetFeedback}>
            {success.length > 0 && <Notice color="green" classes="mb-5">{success}</Notice>}
            {warning.length > 0 && <Notice color="amber" classes="mb-5">{warning}</Notice>}
            {error.length > 0 && <Notice color="red" classes="mb-5">{error}</Notice>}

            {!success.length && <Label classes="block mt-2.5">Name</Label>}
            {!success.length && <Field type="text" classes="block w-full" onInput={(e: any) => setName(e.target.value.trim())} />}

            <Label classes="block mt-2.5">Email Address</Label>
            <Field type="email" classes="block w-full" readOnly={success.length > 0} onInput={(e: any) => setEmail(e.target.value.trim())} />

            <AnimatePresence>
                {proceed && !success.length && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="my-4 w-fit relative left-1/2 -translate-x-1/2">
                            <HCaptcha
                                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""}
                                onVerify={(token: string, _: any) => setCaptchaToken(token)}
                            />
                        </div>

                        <div className="text-sm text-center text-slate-400 select-none flex items-center justify-center gap-2 dark:text-zinc-500">
                            <input type="checkbox" className="w-4 h-4 accent-blue-500" checked={consent} onChange={(e: any) => setConsent(e.target.checked)} />

                            <div>
                                I agree to the
                                <Link href="/documents/terms-of-service.pdf" className="text-blue-500 font-semibold ml-1.25 hover:underline">Terms of Service</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!success.length && <Button type="submit" classes="block w-full my-4" loading={loading} disabled={error.length > 0 || warning.length > 0 || (proceed && (!captchaToken?.length || !consent))}>{proceed ? "Continue" : "Next"}</Button>}
            
            <div className="text-sm text-center text-slate-400 select-none my-5 dark:text-zinc-500">
                Already have an account?
                <Link href="/signin" className="text-blue-500 font-semibold ml-1.25 hover:underline">Sign In</Link>
            </div>

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