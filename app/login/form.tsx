"use client";
import { useState } from "react";
import Link from "next/link";
import { faDiscord, faGoogle, faMicrosoft } from "@fortawesome/free-brands-svg-icons";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import SSOButton from "@/app/components/common/SSOButton";

export default function LoginForm() {
    const [email, setEmailAddress] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    
    const [feedback, setFeedback] = useState<React.JSX.Element|null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorExists, setErrorExistence] = useState<boolean>(false);
    const [warningExists, setWarningExistence] = useState<boolean>(false);
    
    async function login(e: any) {
        e.preventDefault();

        setLoading(true);

        setFeedback(null);
        setErrorExistence(false);
        setWarningExistence(false);
    
        const response = await fetch("/api/user/session", {
            method: "POST",
            body: new URLSearchParams({ email, password })
        });

        const json = await response.json();

        setLoading(false);
    
        switch (response.status) {
            case 200:
                window.location.href = json.destination;
                break;
            case 400:
                setFeedback(<div className="text-sm font-medium text-amber-500 text-center mb-5">Invalid credentials</div>);
                setWarningExistence(true);
                break;
            default:
                setFeedback(<div className="text-sm font-medium text-red-500 text-center mb-5">Something went wrong</div>);
                setErrorExistence(true);
                break;
        }
    }

    return (
        <form onSubmit={login}>
            {feedback}
            <Label classes="block" error={errorExists} warning={warningExists}>Email Address</Label>
            <Field type="email" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setEmailAddress(e.target.value)} />
            <Label classes="block mt-2.5" error={errorExists} warning={warningExists}>Password</Label>
            <Field type="password" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setPassword(e.target.value)} />
            <Button classes="block w-full mt-2.5" loading={loading}>Continue</Button>

            <div className="text-sm font-medium text-center text-slate-400 select-none my-5">
                Don&apos;t have an account?<Link href="/register" className="text-indigo-500 font-semibold ml-1.5 hover:underline">Sign Up</Link>
            </div>

            <div className="relative border-b border-slate-400/40 text-slate-400/60 text-xs font-medium select-none my-6">
                <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center bg-white px-1.5">OR</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <SSOButton icon={faGoogle} classes="hover:from-blue-50 hover:to-blue-100 hover:text-blue-500 hover:border-blue-300" title="Sign in with Google" />
                <SSOButton icon={faDiscord} classes="hover:from-indigo-50 hover:to-indigo-100 hover:text-indigo-500 hover:border-indigo-300" title="Sign in with Discord" url="https://discord.com/oauth2/authorize?client_id=1394762759232819400&response_type=code&redirect_uri=https%3A%2F%2Fshare.surf%2Fapi%2Fauth%2Fdiscord&scope=identify+email" />
                <SSOButton icon={faMicrosoft} classes="hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-500 hover:border-emerald-300" title="Sign in with Microsoft" />
            </div>
        </form>
    );
}