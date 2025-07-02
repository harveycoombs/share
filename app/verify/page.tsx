"use client";
import { useState } from "react";

export default function Verify() {
    const [verifying, setVerifying] = useState<boolean>(false);

    const [firstDigit, setFirstDigit] = useState<string>("");
    const [secondDigit, setSecondDigit] = useState<string>("");
    const [thirdDigit, setThirdDigit] = useState<string>("");
    const [fourthDigit, setFourthDigit] = useState<string>("");
    const [fifthDigit, setFifthDigit] = useState<string>("");
    const [sixthDigit, setSixthDigit] = useState<string>("");

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

    return (
        <div>
            <h1>Verify</h1>
        </div>
    );
}