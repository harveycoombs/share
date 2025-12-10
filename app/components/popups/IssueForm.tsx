"use client";
import { useEffect, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

import Popup from "@/app/components/common/Popup";
import Label from "@/app/components/common/Label";
import Field from "@/app/components/common/Field";
import TextBox from "@/app/components/common/TextBox";
import Button from "@/app/components/common/Button";
import Notice from "@/app/components/common/Notice";

interface Properties {
    onClose: () => void;
}

export default function IssueForm({ onClose }: Properties) {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [captchaToken, setCaptchaToken] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean|null>(null);
    const [countdown, setCountdown] = useState<number>(5);

    async function submit() {
        if (!name.length || !email.length || !description.length || !captchaToken.length) {
            setSuccess(false);
            return;
        }

        setSuccess(false);
        setLoading(true);

        const response = await fetch("/api/issue", {
            method: "POST",
            body: JSON.stringify({ name, email, description, captchaToken })
        });

        const json = await response.json();

        setLoading(false);

        if (!response.ok || !json.success) {
            setSuccess(false);
            return;
        }

        setSuccess(true);
    }

    useEffect(() => {
        if (success) {
            const interval = setInterval(() => {
                const newCountdown = countdown - 1;
                setCountdown(newCountdown);

                if (newCountdown <= 0) {
                    clearInterval(interval);
                    onClose();
                }
            }, 1000);
        }
    }, [success, countdown]);

    return (
        <Popup title="Report An Issue" onClose={onClose}>
            <div className="w-75.5">
                {success === false && <Notice color="red" classes="mt-2.75"><FontAwesomeIcon icon={faExclamationCircle} className="mr-1.5" />Something went wrong</Notice>}

                <Label classes="block w-full mt-2.75">Your Name</Label>
                <Field classes="block w-full" warning={success === false && !name.length} onInput={(e: any) => setName(e.target.value)} />

                <Label classes="block w-full mt-2.75">Your Email Address</Label>
                <Field type="email" classes="block w-full" warning={success === false && !email.length} onInput={(e: any) => setEmail(e.target.value)} />

                <Label classes="block w-full mt-2.75">Describe the issue</Label>
                <TextBox classes="block w-full max-h-50 min-h-10" warning={success === false && !description.length} onInput={(e: any) => setDescription(e.target.value)} rows={8} />

                <div className="mt-5 mb-4.5 w-fit relative left-1/2 -translate-x-1/2">
                    <HCaptcha
                        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""}
                        onVerify={(token: string, _: any) => setCaptchaToken(token)}
                    />
                </div>

                {success ? <Button classes="block w-full mt-2.75" color="bg-green-500 hover:bg-green-600 active:bg-green-700" onClick={onClose}>Submitted. Closing in {countdown}s</Button>: <Button classes="block w-full mt-2.75" onClick={submit} loading={loading}>Submit</Button>}
            </div>
        </Popup>
    );
}