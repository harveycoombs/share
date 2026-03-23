"use client";
import { useState } from "react";

import Button from "@/app/components/common/Button";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import Notice from "@/app/components/common/Notice";

interface Properties {
    email: string;
}

export default function VerificationForm({ email }: Properties) {
    const [firstDigit, setFirstDigit] = useState<string>("");
    const [secondDigit, setSecondDigit] = useState<string>("");
    const [thirdDigit, setThirdDigit] = useState<string>("");
    const [fourthDigit, setFourthDigit] = useState<string>("");
    const [fifthDigit, setFifthDigit] = useState<string>("");
    const [sixthDigit, setSixthDigit] = useState<string>("");

    const [error, setError] = useState<string>("");
    const [warning, setWarning] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    async function verify(e: any) {
        e.preventDefault();

        if (!firstDigit?.length || !secondDigit?.length || !thirdDigit?.length || !fourthDigit?.length || !fifthDigit?.length || !sixthDigit?.length) {
            setWarning("Please enter all digits");
            return;
        }

        const code = `${firstDigit}${secondDigit}${thirdDigit}${fourthDigit}${fifthDigit}${sixthDigit}`;

        setLoading(true);

        const response = await fetch("/api/user/verify", {
            method: "POST",
            body: JSON.stringify({ email, code })
        });

        const json = await response.json();

        switch (response.status) {
            case 200:
            case 201:
                if (!json.verified) {
                    setError("Unable to verify account");
                    break;
                }

                window.location.href = "/signup";
                break;
            default:
                setError("Something went wrong");
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

    return (
        <form className="w-full" onSubmit={verify} onInput={() => { setError(""); setWarning(""); setSuccess(""); }}>
            {error.length > 0 && <Notice color="red">{error}</Notice>}
            {warning.length > 0 && <Notice color="amber">{warning}</Notice>}
            {success.length > 0 && <Notice color="green">{success}</Notice>}

            <Label classes="block mt-5">Email Address</Label>
            <Field classes="block w-full mt-2.5 pointer-events-none select-none" defaultValue={email} readOnly={true} />

            <Label classes="block mt-2.5" error={error.length > 0}>Verification Code</Label>
            <div className="w-full mt-2.5 grid grid-cols-6 gap-2">
                <Field error={error.length > 0} classes="text-center" defaultValue={firstDigit} onInput={(e: any) => handleDigitInput(e, 0)} onPaste={handlePaste} />
                <Field error={error.length > 0} classes="text-center" defaultValue={secondDigit} onInput={(e: any) => handleDigitInput(e, 1)} onPaste={handlePaste} />
                <Field error={error.length > 0} classes="text-center" defaultValue={thirdDigit} onInput={(e: any) => handleDigitInput(e, 2)} onPaste={handlePaste} />
                <Field error={error.length > 0} classes="text-center" defaultValue={fourthDigit} onInput={(e: any) => handleDigitInput(e, 3)} onPaste={handlePaste} />
                <Field error={error.length > 0} classes="text-center" defaultValue={fifthDigit} onInput={(e: any) => handleDigitInput(e, 4)} onPaste={handlePaste} />
                <Field error={error.length > 0} classes="text-center" defaultValue={sixthDigit} onInput={(e: any) => handleDigitInput(e, 5)} onPaste={handlePaste} />
            </div>

            <Button classes="block w-full mt-5" loading={loading} disabled={error.length > 0 || warning.length > 0}>Verify</Button>
        </form>
    )
}