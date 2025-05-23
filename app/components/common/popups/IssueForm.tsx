"use client";
import { useState } from "react";

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
    const [error, setError] = useState<boolean>(false);

    async function submit() {
        if (!name || !email || !description) {
            setError(true);
            return;
        }

        setError(false);

        const response = await fetch("/api/issue");
        const json = await response.json();

        if (!response.ok || !json.success) {
            setError(true);
            return;
        }

        onClose();
    }

    return (
        <Popup title="Report An Issue" classes="w-100" onClose={onClose}>
            <Label classes="block w-full mt-2.75">Your Name</Label>
            <Field classes="block w-full" warning={error && !name.length} onInput={(e: any) => setName(e.target.value)} />

            <Label classes="block w-full mt-2.75">Your Email Address</Label>
            <Field classes="block w-full" warning={error && !email.length} onInput={(e: any) => setEmail(e.target.value)} />

            <Label classes="block w-full mt-2.75">Describe the issue</Label>
            <TextBox classes="block w-full max-h-50 min-h-10" warning={error && !description.length} onInput={(e: any) => setDescription(e.target.value)} rows={8} />

            <Button classes="block w-full mt-2.75" onClick={submit}>Submit</Button>
        </Popup>
    );
}