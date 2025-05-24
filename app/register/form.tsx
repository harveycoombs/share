
"use client";
import { useState } from "react";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";

export default function RegistrationForm() {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [emailAddress, setEmailAddress] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");

    const [feedback, setFeedback] = useState<React.JSX.Element|null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorExists, setErrorExistence] = useState<boolean>(false);
    const [warningExists, setWarningExistence] = useState<boolean>(false);

    const [verifying, setVerifying] = useState<boolean>(false);

    const [firstDigit, setFirstDigit] = useState<string>("");
    const [secondDigit, setSecondDigit] = useState<string>("");
    const [thirdDigit, setThirdDigit] = useState<string>("");
    const [fourthDigit, setFourthDigit] = useState<string>("");
    const [fifthDigit, setFifthDigit] = useState<string>("");
    const [sixthDigit, setSixthDigit] = useState<string>("");

    async function register(e: any) {
        e.preventDefault();
        
        setFeedback(null);
        setLoading(true);
        setErrorExistence(false);
        setWarningExistence(false);

        if (!firstName || !lastName || !emailAddress || !password || !passwordConfirmation) {
            setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">One or more fields were not provided</div>);
            setWarningExistence(true);
            setLoading(false);
            return;
        }

        if (password != passwordConfirmation) {
            setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">Passwords do not match</div>);
            setWarningExistence(true);
            setLoading(false);
            return;
        }

        const response = await fetch("/api/user", {
            method: "POST",
            body: new URLSearchParams({ firstName, lastName, emailAddress, password })
        });

        setLoading(false);

        switch (response.status) {
            case 200:
                setVerifying(true);
                break;
            case 409:
                setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">Email address already in use</div>);
                setWarningExistence(true);
                break;
            default:
                setFeedback(<div className="text-sm font-medium text-red-500 text-center mt-5">Something went wrong</div>);
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
            body: new URLSearchParams({ email: emailAddress, code })
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
        } else {
            e.target.nextSibling?.focus();
        }
    }

    return verifying ? (
        <form onSubmit={verify} onInput={() => { setFeedback(null); setErrorExistence(false); setWarningExistence(false); }}>
            {feedback}
            <Label classes="block mt-5" error={errorExists} warning={warningExists}>Verification Code</Label>

            <div className="w-full mt-2.5 grid grid-cols-6 gap-2">
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => handleDigitInput(e, 0)} />
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => handleDigitInput(e, 1)} />
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => handleDigitInput(e, 2)} />
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => handleDigitInput(e, 3)} />
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => handleDigitInput(e, 4)} />
                <Field error={errorExists} warning={warningExists} classes="text-center" onInput={(e: any) => handleDigitInput(e, 5)} />
            </div>

            <Button classes="block w-full mt-2.5" loading={loading} disabled={errorExists || warningExists}>Verify</Button>
        </form>
    ) : (
        <form onSubmit={register} onInput={() => { setFeedback(null); setErrorExistence(false); setWarningExistence(false); }}>
            {feedback}
            <Label classes="block mt-5" error={errorExists} warning={warningExists}>First Name</Label>
            <Field type="text" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setFirstName(e.target.value)} />
            <Label classes="block mt-2.5" error={errorExists} warning={warningExists}>Last Name</Label>
            <Field type="text" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setLastName(e.target.value)} />
            <Label classes="block mt-5" error={errorExists} warning={warningExists}>Email Address</Label>
            <Field type="email" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setEmailAddress(e.target.value)} />
            <Label classes="block mt-2.5" error={errorExists} warning={warningExists}>Password</Label>
            <Field type="password" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setPassword(e.target.value)} />
            <Label classes="block mt-2.5" error={errorExists} warning={warningExists}>Confirm Password</Label>
            <Field type="password" classes="block w-full" error={errorExists} warning={warningExists} onInput={(e: any) => setPasswordConfirmation(e.target.value)} />
            <Button classes="block w-full mt-2.5" loading={loading} disabled={errorExists || warningExists}>Continue</Button>
            <Button url="/login" transparent={true} classes="block w-full mt-2.5">I Already Have An Account</Button>
        </form>
    );
}