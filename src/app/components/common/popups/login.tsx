import { useState } from "react";
import Link from "next/link";

import Popup from "@/app/components/common/popup";
import Button from "@/app/components/common/button";
import Field from "@/app/components/common/field";
import Label from "@/app/components/common/label";

interface Properties {
    onClose: () => void;
}

export default function LoginForm({ onClose }: Properties) {
    let [email, setEmail] = useState<string>("");
    let [password, setPassword] = useState<string>("");

    let [feedback, setFeedback] = useState<React.JSX.Element|null>(null);
    let [loading, setLoading] = useState<boolean>(false);
    let [errorExists, setErrorExistence] = useState<boolean>(false);
    let [warningExists, setWarningExistence] = useState<boolean>(false);

    async function login(e: any) {
        e.preventDefault();
        
        setFeedback(null);
        setLoading(true);
        setErrorExistence(false);
        setWarningExistence(false);

        let response = await fetch("/api/login", {
            method: "POST",
            body: new URLSearchParams({ email, password })
        });

        setLoading(false);

        switch (response.status) {
            case 200:
                window.location.href = "/";
                break;
            case 400:
                setFeedback(<div className="text-sm text-amber-500 text-center mt-2.5">Invalid credentials</div>);
                setWarningExistence(true);
                break;
            default:
                setFeedback(<div className="text-sm text-red-500 text-center mt-2.5">Something went wrong</div>);
                setErrorExistence(true);
                break;
        }
    }

    return (
        <Popup title="Sign In" onClose={onClose}>
            <form className="w-72" onSubmit={login}>
                <strong className="block font-semibold text-lg text-center mt-2 select-none">Welcome Back</strong>
                <div className="text-sm font-medium text-center text-slate-400 select-none">Sign in using the form below</div>
                {feedback}
                <Label classes="block mt-5" error={errorExists} warning={warningExists}>Email Address</Label>
                <Field type="email" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setEmail(e.target.value)} />
                <Label classes="block mt-2.5" error={errorExists} warning={warningExists}>Password</Label>
                <Field type="password" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setPassword(e.target.value)} />
                <Button classes="block w-full mt-2.5" loading={loading}>Continue</Button>
                <Button transparent={true} classes="block w-full mt-2.5">Register</Button>
                <div className="text-sm text-slate-400/60 text-center select-none mt-2.5">
                    <Link href="/recovery" className="hover:underline">Recover Account</Link> &middot; <Link href="https://github.com/harveycoombs/share/issues/new" className="hover:underline">Report Issue</Link>
                </div>
            </form>
        </Popup>
    );
}