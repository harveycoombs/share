"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import Popup from "@/app/components/common/Popup";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import Button from "@/app/components/common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck, faExclamationCircle, faWarning } from "@fortawesome/free-solid-svg-icons";
import Notice from "../common/Notice";

interface Properties {
    onClose: () => void;
}

export default function Settings({ onClose }: Properties) {
    const [user, setUser] = useState<any>(null);

    const [name, setName] = useState<string>("");
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
            body: new URLSearchParams({ name, emailAddress, oldPassword, newPassword })
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
        <Popup title="Account Settings" classes="w-120" onClose={onClose}>
            {(error.length + warning.length + success.length) > 0 && <Notice color={error.length ? "red" : warning.length ? "amber" : "green"}>
                <FontAwesomeIcon icon={error.length ? faExclamationCircle : warning.length ? faWarning : faCheck} className="mr-1.5" />
                {error.length ? error : warning.length ? warning : success}
            </Notice>}

            <div className="flex gap-3.5 items-center w-fit mx-auto my-4 select-none">
                <div className="relative rounded-md overflow-hidden cursor-pointer group" onClick={() => avatarUploader.current?.click()}>
                    <Image src={`/api/user/avatar?t=${new Date().getTime()}`} alt="Share" width={58} height={58} className="object-cover aspect-square" draggable={false} />
                    <div className="absolute inset-0 bg-black/60 place-items-center hidden pointer-events-none group-hover:grid">
                        <FontAwesomeIcon icon={faCamera} className="text-white" />
                    </div>

                    <input type="file" ref={avatarUploader} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </div>

                <div>
                    <strong className="block font-bold">{user?.name}</strong>
                    <div className="text-xs text-slate-400/75 font-medium">Joined {new Date(user?.creation_date).toLocaleDateString()}</div>
                </div>
            </div>

            <div className="w-full my-3.5 border-b border-slate-300 flex gap-1.5 justify-center">
                <SettingsSectionTab name="Details" onClick={() => {}} />
                <SettingsSectionTab name="Security" onClick={() => {}} />
                <SettingsSectionTab name="Platform" onClick={() => {}} />
            </div>
        </Popup>
    );
}

function SettingsSectionTab({ name, ...rest }: any) {
    return <div className="py-1.5 px-2.5 border-b-3 border-transparent translate-y-px text-[0.8rem] text-slate-400/75 font-medium cursor-pointer duration-150 hover:border-indigo-500 hover:text-indigo-500" {...rest}>{name}</div>;
}