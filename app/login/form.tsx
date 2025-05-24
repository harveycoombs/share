"use client";
import { useState } from "react";

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
    
    const [firstDigit, setFirstDigit] = useState<string>("");
    const [secondDigit, setSecondDigit] = useState<string>("");
    const [thirdDigit, setThirdDigit] = useState<string>("");
    const [fourthDigit, setFourthDigit] = useState<string>("");
    const [fifthDigit, setFifthDigit] = useState<string>("");
    const [sixthDigit, setSixthDigit] = useState<string>("");

    const [verifying, setVerifying] = useState<boolean>(false);

    async function login(e: any) {
        e.preventDefault();
        
        setFeedback(null);
        setLoading(true);
        setErrorExistence(false);
        setWarningExistence(false);
        setVerifying(false);
    
        const response = await fetch("/api/user/session", {
            method: "POST",
            body: new URLSearchParams({ email, password })
        });
    
        switch (response.status) {
            case 200:
                window.location.href = "/";
                break;
            case 400:
                setFeedback(<div className="text-sm font-medium text-amber-500 text-center mb-5">Invalid credentials</div>);
                setWarningExistence(true);
                setLoading(false);
                break;
            case 403:
                setVerifying(true);
                break;
            default:
                setFeedback(<div className="text-sm font-medium text-red-500 text-center mb-5">Something went wrong</div>);
                setErrorExistence(true);
                setLoading(false);
                break;
        }
    }

    async function verify() {
        if (!firstDigit?.length || !secondDigit?.length || !thirdDigit?.length || !fourthDigit?.length || !fifthDigit?.length || !sixthDigit?.length) {
            setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">Please enter all digits</div>);
            return;
        }

        const code = `${firstDigit}${secondDigit}${thirdDigit}${fourthDigit}${fifthDigit}${sixthDigit}`;

        setLoading(true);

        const response = await fetch("/api/user/verify", {
            method: "POST",
            body: new URLSearchParams({ code })
        });

        const json = await response.json();

        switch (response.status) {
            case 200:
                if (!json.success) break;
                window.location.href = "/";
                break;
            default:
                setFeedback(<div className="text-sm font-medium text-red-500 text-center mt-5">Something went wrong</div>);
                setErrorExistence(true);
                break;
        }

        setLoading(false);
    }

    function resetForm() {
        setFeedback(null); 
        setErrorExistence(false); 
        setWarningExistence(false);
    }

    return verifying ? (
        <form onSubmit={verify} onInput={() => { setFeedback(null); setErrorExistence(false); setWarningExistence(false); }}>
            {feedback}
            <Label classes="block mt-5" error={errorExists} warning={warningExists}>Verification Code</Label>

            <div className="w-full mt-2.5 grid grid-cols-6 gap-2">
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => { setFirstDigit(e.target.value); e.target.nextSibling?.focus(); }} />
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => { setSecondDigit(e.target.value); e.target.nextSibling?.focus(); }} />
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => { setThirdDigit(e.target.value); e.target.nextSibling?.focus(); }} />
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => { setFourthDigit(e.target.value); e.target.nextSibling?.focus(); }} />
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => { setFifthDigit(e.target.value); e.target.nextSibling?.focus(); }} />
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => { setSixthDigit(e.target.value); e.target.nextSibling?.focus(); }} />
            </div>

            <Button classes="block w-full mt-2.5" loading={loading} disabled={errorExists || warningExists}>Verify</Button>
        </form>
    ) : (
        <form onSubmit={login} onInput={resetForm}>
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