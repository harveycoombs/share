"use client";
import { useState } from "react";
import router from "next/router";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";

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

        setLoading(false);
    
        switch (response.status) {
            case 200:
                window.location.href = "/";
                break;
            case 400:
                setFeedback(<div className="text-sm font-medium text-amber-500 text-center mb-5">Invalid credentials</div>);
                setWarningExistence(true);
                break;
            case 403:
                router.push("/verify");
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
            <Button url="/register" transparent={true} classes="block w-full mt-2.5">Register</Button>
        </form>
    );
}