import { useState } from "react";
import Link from "next/link";

import Popup from "@/app/components/common/Popup";
import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import RegistrationForm from "@/app/components/common/popups/RegistrationForm";

interface Properties {
    onClose: () => void;
}

export default function LoginForm({ onClose }: Properties) {
    const [email, setEmailAddress] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [feedback, setFeedback] = useState<React.JSX.Element|null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorExists, setErrorExistence] = useState<boolean>(false);
    const [warningExists, setWarningExistence] = useState<boolean>(false);

    const [registrationFormIsVisible, setRegistrationFormVisibility] = useState<boolean>(false);

    async function login(e: any) {
        e.preventDefault();
        
        setFeedback(null);
        setLoading(true);
        setErrorExistence(false);
        setWarningExistence(false);

        const response = await fetch("/api/user/session", {
            method: "POST",
            body: new URLSearchParams({ email, password })
        });

        switch (response.status) {
            case 200:
                window.location.href = "/";
                break;
            case 400:
                setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">Invalid credentials</div>);
                setWarningExistence(true);
                setLoading(false);
                break;
            default:
                setFeedback(<div className="text-sm font-medium text-red-500 text-center mt-5">Something went wrong</div>);
                setErrorExistence(true);
                setLoading(false);
                break;
        }
    }

    return (
        <>{registrationFormIsVisible ? <RegistrationForm onClose={onClose} /> : <Popup title="Sign In" onClose={onClose} classes="w-72 max-[290px]:w-15/16">
        <form className="" onSubmit={login} onInput={() => { setFeedback(null); setErrorExistence(false); setWarningExistence(false); }}>
            <strong className="block font-semibold text-lg text-center mt-2 select-none">Welcome Back</strong>
            <div className="text-sm font-medium text-center text-slate-400 select-none">Sign in using the form below</div>
            {feedback}
            <Label classes="block mt-5" error={errorExists} warning={warningExists}>Email Address</Label>
            <Field type="email" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setEmailAddress(e.target.value)} />
            <Label classes="block mt-2.5" error={errorExists} warning={warningExists}>Password</Label>
            <Field type="password" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setPassword(e.target.value)} />
            <Button classes="block w-full mt-2.5" loading={loading}>Continue</Button>
            <Button transparent={true} classes="block w-full mt-2.5" onClick={() => setRegistrationFormVisibility(true)}>Register</Button>
            <div className="text-sm text-slate-400/60 text-center select-none mt-2.5">
                <Link href="/recovery" className="hover:underline">Recover Account</Link> &middot; <Link href="https://github.com/harveycoombs/share/issues/new" className="hover:underline">Report Issue</Link>
            </div>
        </form>
    </Popup>}</>
    );
}