
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
                window.location.href = "/";
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

    return (
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