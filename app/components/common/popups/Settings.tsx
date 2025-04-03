"use client";
import { useState, useEffect } from "react";

import Popup from "@/app/components/common/Popup";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import Button from "@/app/components/common/Button";

interface Properties {
    onClose: () => void;
}

export default function Settings({ onClose }: Properties) {
    const [user, setUser] = useState<any>(null);

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [emailAddress, setEmailAddress] = useState<string>("");

    const [feedback, setFeedback] = useState<React.JSX.Element|null>(null);
    const [deletionIntent, setDeletionIntent] = useState<boolean>(false);

    const [updating, setUpdating] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const response = await fetch("/api/user");
            const json = await response.json();

            setUser(json.details);

            setFirstName(json.details.first_name);
            setLastName(json.details.last_name);
            setEmailAddress(json.details.email_address);
        })();
    }, []);

    async function updateDetails() {
        setUpdating(true);

        const response = await fetch("/api/user", {
            method: "PATCH",
            body: new URLSearchParams({ firstName, lastName, emailAddress })
        });

        const json = await response.json();

        setUpdating(false);

        setFeedback(json.updated ? <div className="bg-green-400 w-full text-center p-1 rounded">Details updated successfully</div> : <div className="bg-red-400 w-full text-center p-1 rounded">Something went wrong</div>);
    }

    async function deleteAccount() {
        const response = await fetch("/api/user", {
            method: "DELETE"
        });

        const json = await response.json();

        setDeleting(false);

        if (!json.deleted) {
            setFeedback(<div className="bg-red-400 w-full text-center p-1 rounded">Something went wrong</div>);
            return;
        }
        
        window.location.href = "/";
    }

    return (
        <Popup title="Settings" onClose={onClose}>
            {feedback && <div className="w-full mb-2 text-sm text-white font-medium">{feedback}</div>}
            <div className="w-full">
                <div>
                    <div className="mt-2 w-full flex gap-2">
                        <div className="w-1/2">
                            <Label classes="block w-full">First Name</Label>
                            <Field small={true} classes="block w-full" defaultValue={user?.first_name ?? ""} onInput={(e: any) => setFirstName(e.target.value)} />
                        </div>
            
                        <div className="w-1/2">
                            <Label classes="block w-full">Last Name</Label>
                            <Field small={true} classes="block w-full" defaultValue={user?.last_name ?? ""} onInput={(e: any) => setLastName(e.target.value)} />
                        </div>
                    </div>
            
                    <div className="mt-2 w-full flex gap-2">
                        <div className="w-1/2">
                            <Label classes="block w-full">Email Address</Label>
                            <Field type="email" small={true} classes="block w-full" defaultValue={user?.email_address ?? ""} onInput={(e: any) => setEmailAddress(e.target.value)} />
                        </div>

                        <div className="w-1/2">
                            <Label classes="block w-full">Avatar</Label>
                            <div className="py-2 w-full text-[0.8rem] font-medium text-slate-600 italic -translate-y-px pointer-events-none">Coming Soon</div>
                        </div>
                    </div>
                </div>

                <div className="mt-3 w-full flex gap-2">
                    <Button classes="w-1/2" onClick={updateDetails} loading={updating}>Save Changes</Button>
                    <Button classes="w-1/2 bg-red-500 hover:bg-red-600" loading={deleting} onClick={deletionIntent ? deleteAccount : () => setDeletionIntent(true)}>{deletionIntent ? "Are You Sure?" : "Delete Account"}</Button>
                </div>
            </div>
        </Popup>
    );
}