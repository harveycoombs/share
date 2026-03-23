"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { faDiscord, faGoogle } from "@fortawesome/free-brands-svg-icons";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from "motion/react";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function RegistrationForm() {
    const [proceed, setProceed] = useState<boolean>(false);
    
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [captchaToken, setCaptchaToken] = useState<string>("");
    const [consent, setConsent] = useState<boolean>(false);

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

            <AnimatePresence>
                {proceed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <Label classes="block mt-2.5" error={error.length > 0} warning={warning.length > 0}>Password</Label>
                        <Field type="password" classes="block w-full" error={error.length > 0} warning={warning.length > 0} onInput={(e: any) => setPassword(e.target.value.trim())} />

                        <div className={`mt-4 flex items-center justify-center text-sm font-semibold gap-0.5 select-none ${password.length >= 16 ? "text-green-500" : "text-red-500"}`}>
                            <FontAwesomeIcon icon={password.length >= 16 ? faCheck : faXmark} className={password.length >= 16 ? "" : "translate-y-px"} />
                            <div>Contains at least 16 characters</div>
                        </div>

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

            <Button classes="block w-full my-4" loading={loading} disabled={error.length > 0 || warning.length > 0 || (proceed && (!captchaToken?.length || !consent || password.length < 16))} onClick={proceed ? register : () => setProceed(true)}>{proceed ? "Continue" : "Next"}</Button>
            
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