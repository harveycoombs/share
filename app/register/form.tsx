
"use client";
import { useState, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";

export default function RegistrationForm() {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [emailAddress, setEmailAddress] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
    const [passwordStrength, setPasswordStrength] = useState<number>(0);

    const [feedback, setFeedback] = useState<React.JSX.Element|null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorExists, setErrorExistence] = useState<boolean>(false);
    const [warningExists, setWarningExistence] = useState<boolean>(false);
    const [captchaIsVisible, setCaptchaVisibility] = useState<boolean>(false);

    const [verifying, setVerifying] = useState<boolean>(false);

    const [firstDigit, setFirstDigit] = useState<string>("");
    const [secondDigit, setSecondDigit] = useState<string>("");
    const [thirdDigit, setThirdDigit] = useState<string>("");
    const [fourthDigit, setFourthDigit] = useState<string>("");
    const [fifthDigit, setFifthDigit] = useState<string>("");
    const [sixthDigit, setSixthDigit] = useState<string>("");

    async function register(token: string, ekey: string) {
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
            body: new URLSearchParams({
                firstName,
                lastName,
                emailAddress,
                password,
                captchaToken: token
            })
        });

        setLoading(false);

        switch (response.status) {
            case 200:
                setVerifying(true);
                break;
            case 400:
                setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">One or more fields were not provided</div>);
                setWarningExistence(true);
                break;
            case 401:
                setFeedback(<div className="text-sm font-medium text-amber-500 text-center mt-5">Invalid captcha</div>);
                setWarningExistence(true);
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

    useEffect(() => {
        const symbolsExpr = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        const numbersExpr = /[0-9]/;
        const uppercaseExpr = /[A-Z]/;
        const lowercaseExpr = /[a-z]/;

        const hasSymbols = symbolsExpr.test(password);
        const hasNumbers = numbersExpr.test(password);
        const hasUppercaseChars = uppercaseExpr.test(password);
        const hasLowercaseChars = lowercaseExpr.test(password);

        switch (true) {
            case (hasSymbols || hasNumbers) && (hasUppercaseChars || hasLowercaseChars) && password.length >= 12:
                setPasswordStrength(2);
                break;
            case (hasSymbols || hasNumbers) && (hasUppercaseChars || hasLowercaseChars) && password.length >= 6:
                setPasswordStrength(1);
                break;
            default:
                setPasswordStrength(0);
        }
    }, [password])

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
        <div onInput={() => { setFeedback(null); setErrorExistence(false); setWarningExistence(false); }}>
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

            <div className="mt-4 mb-5">
                <div className="text-sm font-medium mb-1">{passwordStrength == 0 ? "Weak" : passwordStrength == 1 ? "Average" : "Strong"}</div>

                <div className="flex gap-2">
                    <div className={`w-1/3 h-1.25 rounded-l-full ${passwordStrength == 0 ? "bg-red-500" : passwordStrength == 1 ? "bg-amber-500" : "bg-green-500"}`}></div>
                    <div className={`w-1/3 h-1.25 ${passwordStrength == 2 ? "bg-green-500" : passwordStrength == 1 ? "bg-amber-500" : "bg-gray-200"}`}></div>
                    <div className={`w-1/3 h-1.25 rounded-r-full ${passwordStrength == 2 ? "bg-green-500" : "bg-gray-200"}`}></div>
                </div>
            </div>

            {captchaIsVisible && <div className="mt-2.5 w-fit relative left-1/2 -translate-x-1/2">
                <HCaptcha
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""}
                    onVerify={(token,ekey) => register(token, ekey)}
                />
            </div>}

            {!captchaIsVisible && <Button classes="block w-full mt-2.5" loading={loading} disabled={errorExists || warningExists} onClick={() => setCaptchaVisibility(true)}>Continue</Button>}
            <Button url="/login" transparent={true} classes="block w-full mt-2.5">I Already Have An Account</Button>
        </div>
    );
}