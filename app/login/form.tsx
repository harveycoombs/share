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

        setLoading(true);

        setFeedback(null);
        setErrorExistence(false);
        setWarningExistence(false);
        setVerifying(false);
    
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
                setVerifying(true);
                break;
            default:
                setFeedback(<div className="text-sm font-medium text-red-500 text-center mb-5">Something went wrong</div>);
                setErrorExistence(true);
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
            body: new URLSearchParams({ email, code })
        });

        setLoading(false);

        switch (response.status) {
            case 200:
                //window.location.href = "/";
                break;
            case 400:
                setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">Invalid code</div>);
                setWarningExistence(true);
                break;
            default:
                setFeedback(<div className="text-sm font-medium text-red-500 text-center mt-5">Something went wrong</div>);
                setErrorExistence(true);
                break;
        }
    }

    function resetForm() {
        setFeedback(null); 
        setErrorExistence(false); 
        setWarningExistence(false);
        setVerifying(false);
    }

    function handleDigitInput(e: any, index: number) {
        const value = e.target.value;

        switch (index) {
            case 0:
                setFirstDigit(value);
                break;
            case 1:
                setSecondDigit(value);
                break;
            case 2:
                setThirdDigit(value);
                break;
            case 3:
                setFourthDigit(value);
                break;
            case 4:
                setFifthDigit(value);
                break;
            case 5:
                setSixthDigit(value);
                break;
        }

        if (!value?.length) {
            e.target.previousSibling?.focus();

            switch (index) {
                case 0:
                    setFirstDigit("");
                    break;
                case 1:
                    setSecondDigit("");
                    break;
                case 2:
                    setThirdDigit("");
                    break;
                case 3:
                    setFourthDigit("");
                    break;
                case 4:
                    setFifthDigit("");
                    break;
                case 5:
                    setSixthDigit("");
                    break;
            }
        } else {
            e.target.nextSibling?.focus();
        }
    }

    function handlePaste(e: any) {
        if (!e.clipboardData?.getData("text")?.length) return;

        const text = (e.clipboardData?.getData("text") ?? "");

        setFirstDigit(text.charAt(0));
        setSecondDigit(text.charAt(1));
        setThirdDigit(text.charAt(2));
        setFourthDigit(text.charAt(3));
        setFifthDigit(text.charAt(4));
        setSixthDigit(text.charAt(5));

        e.preventDefault();
    }

    return verifying ? (
        <form onSubmit={verify} onInput={() => { setFeedback(null); setErrorExistence(false); setWarningExistence(false); }}>
            {feedback}
            <Label classes="block mt-5" error={errorExists} warning={warningExists}>Verification Code</Label>

            <div className="w-full mt-2.5 grid grid-cols-6 gap-2">
                <Field error={errorExists} warning={warningExists} classes="text-center" defaultValue={firstDigit} onInput={(e: any) => handleDigitInput(e, 0)} onPaste={handlePaste} />
                <Field error={errorExists} warning={warningExists} classes="text-center" defaultValue={secondDigit} onInput={(e: any) => handleDigitInput(e, 1)} onPaste={handlePaste} />
                <Field error={errorExists} warning={warningExists} classes="text-center" defaultValue={thirdDigit} onInput={(e: any) => handleDigitInput(e, 2)} onPaste={handlePaste} />
                <Field error={errorExists} warning={warningExists} classes="text-center" defaultValue={fourthDigit} onInput={(e: any) => handleDigitInput(e, 3)} onPaste={handlePaste} />
                <Field error={errorExists} warning={warningExists} classes="text-center" defaultValue={fifthDigit} onInput={(e: any) => handleDigitInput(e, 4)} onPaste={handlePaste} />
                <Field error={errorExists} warning={warningExists} classes="text-center" defaultValue={sixthDigit} onInput={(e: any) => handleDigitInput(e, 5)} onPaste={handlePaste} />
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