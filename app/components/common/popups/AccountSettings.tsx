"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import Popup from "@/app/components/common/Popup";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import Button from "@/app/components/common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck, faExclamationCircle, faWarning } from "@fortawesome/free-solid-svg-icons";
import Notice from "../Notice";

interface Properties {
    onClose: () => void;
}

export default function AccountSettings({ onClose }: Properties) {
    const [user, setUser] = useState<any>(null);

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [emailAddress, setEmailAddress] = useState<string>("");

    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

    const [error, setError] = useState<string>("");
    const [warning, setWarning] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const [deletionIntent, setDeletionIntent] = useState<boolean>(false);

    const [updating, setUpdating] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    const avatarUploader = useRef<HTMLInputElement>(null);

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
        setError("");
        setWarning("");
        setSuccess("");

        if (newPassword?.length && newPassword != confirmNewPassword) {
            setWarning("New passwords do not match");
            setUpdating(false);
            return;
        }

        const response = await fetch("/api/user", {
            method: "PATCH",
            body: new URLSearchParams({ firstName, lastName, emailAddress, oldPassword, newPassword })
        });

        const json = await response.json();

        setUpdating(false);

        if (json.updated) {
            setSuccess("Details updated successfully");
        } else {
            setError("Something went wrong");
        }
    }

    async function deleteAccount() {
        const response = await fetch("/api/user", {
            method: "DELETE"
        });

        const json = await response.json();

        setDeleting(false);

        if (!json.deleted) {
            setError("Something went wrong");
            return;
        }
        
        window.location.href = "/";
    }

    async function handleAvatarUpload(e: any) {
        const file = e.target.files[0];

        if (!file) return;

        const data = new FormData();
        data.append("files", file);

        const response = await fetch("/api/user/avatar", {
            method: "POST",
            body: data
        });

        const json = await response.json();

        if (!json.uploaded) {
            setError("Something went wrong");
            return;
        }

        setUser(user);
    }

    return (
        <Popup title="Account Settings" onClose={onClose} classes="max-sm:w-15/16">
            {(error.length + warning.length + success.length) > 0 && <Notice color={error.length ? "red" : warning.length ? "amber" : "green"}>
                <FontAwesomeIcon icon={error.length ? faExclamationCircle : warning.length ? faWarning : faCheck} className="mr-1.5" />
                {error.length ? error : warning.length ? warning : success}
            </Notice>}

            <div className="w-full">
                <div>
                    <div className="flex gap-3 items-center w-fit mx-auto my-4 select-none">
                        <div className="relative rounded-md overflow-hidden cursor-pointer group" onClick={() => avatarUploader.current?.click()}>
                            <Image src={`/api/user/avatar?t=${new Date().getTime()}`} alt="Share" width={56} height={56} className="object-cover aspect-square" draggable={false} />
                            <div className="absolute inset-0 bg-black/60 place-items-center hidden pointer-events-none group-hover:grid">
                                <FontAwesomeIcon icon={faCamera} className="text-white" />
                            </div>

                            <input type="file" ref={avatarUploader} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </div>

                        <div>
                            <strong className="block font-bold">{user?.first_name} {user?.last_name}</strong>
                            <div className="text-xs text-slate-400/75 font-semibold">Joined {new Date(user?.creation_date).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="mt-2 w-full flex gap-6 max-sm:flex-col max-sm:gap-0">
                        <div className="w-60 max-sm:w-full">
                            <Label classes="block w-full mt-2.75 mb-0.5">First Name</Label>
                            <Field classes="block w-full" defaultValue={user?.first_name ?? ""} onInput={(e: any) => setFirstName(e.target.value)} />

                            <Label classes="block w-full mt-2.75 mb-0.5">Last Name</Label>
                            <Field classes="block w-full" defaultValue={user?.last_name ?? ""} onInput={(e: any) => setLastName(e.target.value)} />

                            <Label classes="block w-full mt-2.75 mb-0.5">Email Address</Label>
                            <Field type="email" classes="block w-full" defaultValue={user?.email_address ?? ""} onInput={(e: any) => setEmailAddress(e.target.value)} />
                        </div>

                        <div className="w-60 max-sm:w-full">
                            <Label classes="block w-full mt-2.75 mb-0.5">Old Password</Label>
                            <Field type="password" classes="block w-full" onInput={(e: any) => setOldPassword(e.target.value)} />

                            <Label classes="block w-full mt-2.75 mb-0.5">New Password</Label>
                            <Field type="password" classes="block w-full" onInput={(e: any) => setNewPassword(e.target.value)} />

                            <Label classes="block w-full mt-2.75 mb-0.5">Confirm New Password</Label>
                            <Field type="password" classes="block w-full" onInput={(e: any) => setConfirmNewPassword(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="mt-3 w-full flex gap-6 max-sm:flex-col max-sm:gap-2.75">
                    <Button classes="w-60 max-sm:w-full" onClick={updateDetails} loading={updating}>Save Changes</Button>
                    <Button classes="w-60 max-sm:w-full" color="bg-red-500 hover:bg-red-600 active:bg-red-700" loading={deleting} onClick={deletionIntent ? deleteAccount : () => setDeletionIntent(true)}>{deletionIntent ? "Are You Sure?" : "Delete Account"}</Button>
                </div>
            </div>
        </Popup>
    );
}