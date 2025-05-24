"use client";
import { useEffect, useState } from "react";

import Popup from "@/app/components/common/Popup";
import Label from "@/app/components/common/Label";
import Field from "@/app/components/common/Field";
import TextBox from "@/app/components/common/TextBox";
import Button from "@/app/components/common/Button";

interface Properties {
    onClose: () => void;
}

export default function IssueForm({ onClose }: Properties) {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(5);

    async function submit() {
        if (!name.length || !email.length || !description.length) {
            setSuccess(false);
            return;
        }

        setSuccess(false);
        setLoading(true);

        const response = await fetch("/api/issue", {
            method: "POST",
            body: new URLSearchParams({ name, email, description })
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
        <Popup title="Report An Issue" classes="w-100" onClose={onClose}>
            <Label classes="block w-full mt-2.75">Your Name</Label>
            <Field classes="block w-full" warning={!success && !name.length} onInput={(e: any) => setName(e.target.value)} />

            <Label classes="block w-full mt-2.75">Your Email Address</Label>
            <Field classes="block w-full" warning={!success && !email.length} onInput={(e: any) => setEmail(e.target.value)} />

            <Label classes="block w-full mt-2.75">Describe the issue</Label>
            <TextBox classes="block w-full max-h-50 min-h-10" warning={!success && !description.length} onInput={(e: any) => setDescription(e.target.value)} rows={8} />

            {success ? <Button classes="block w-full mt-2.75" color="bg-green-500 hover:bg-green-600 active:bg-green-700" onClick={onClose}>Submitted. Closing in {countdown}s</Button> : <Button classes="block w-full mt-2.75" onClick={submit} loading={loading}>Submit</Button>}
        </Popup>
    );
}