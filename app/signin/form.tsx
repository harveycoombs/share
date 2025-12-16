"use client";
import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faGoogle } from "@fortawesome/free-brands-svg-icons";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";

export default function LoginForm() {
    const [email, setEmailAddress] = useState<string>("");
    const [password, setPassword] = useState<string>("");

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

        if (!password?.length) {
            setWarning("Missing password");
            setLoading(false);
            return;
        }
    
        const response = await fetch("/api/user/session", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        const json = await response.json();

        setLoading(false);
    
        switch (response.status) {
            case 200:
            case 201:
                setSuccess("Success! You will be redirected shortly");
                window.location.href = json.destination;
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
            {success.length > 0 && <div className="text-sm font-medium text-emerald-500 text-center mb-5">{success}</div>}
            {warning.length > 0 && <div className="text-sm font-medium text-amber-500 text-center mb-5">{warning}</div>}
            {error.length > 0 && <div className="text-sm font-medium text-red-500 text-center mb-5">{error}</div>}

            <Label classes="block" error={error.length > 0} warning={warning.length > 0}>Email Address</Label>
            <Field type="email" classes="block w-full" error={error.length > 0} warning={warning.length > 0} onInput={(e: any) => setEmailAddress(e.target.value)} />
            <Label classes="block mt-2.5" error={error.length > 0} warning={warning.length > 0}>Password</Label>
            <Field type="password" classes="block w-full" error={error.length > 0} warning={warning.length > 0} onInput={(e: any) => setPassword(e.target.value)} />
            <Button classes="block w-full mt-2.5" loading={loading}>Continue</Button>

            <div className="text-sm text-center text-slate-400 select-none mt-5 dark:text-zinc-500">
                Don&apos;t have an account?<Link href="/signup" className="text-blue-500 font-semibold ml-1.5 hover:underline">Sign Up</Link>
            </div>

            <div className="text-sm text-center text-slate-400 select-none mt-2.5 dark:text-zinc-500">
                Can&apos;t sign in?<Link href="/recover" className="text-blue-500 font-semibold ml-1.5 hover:underline">Recover Account</Link>
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
        </form>
    );
}