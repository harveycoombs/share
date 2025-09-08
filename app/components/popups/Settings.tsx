"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

import Popup from "@/app/components/common/Popup";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import Button from "@/app/components/common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck, faExclamationCircle, faWarning } from "@fortawesome/free-solid-svg-icons";
import Notice from "@/app/components/common/Notice";
import QRCodeViewer from "@/app/components/popups/QRCodeViewer";

interface Properties {
    onClose: () => void;
}

export default function Settings({ onClose }: Properties) {
    const [details, setDetails] = useState<any>(null);
    const [section, setSection] = useState<string>("details");

    const [name, setName] = useState<string>("");
    const [emailAddress, setEmailAddress] = useState<string>("");

    const [QRCode, setQRCode] = useState<string>("");
    const [QRCodePopupIsVisible, setQRCodePopupVisibility] = useState<boolean>(false);

    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");

    const [error, setError] = useState<string>("");
    const [warning, setWarning] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const [deletionIntent, setDeletionIntent] = useState<boolean>(false);

    const [updating, setUpdating] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [updatingTOTP, setUpdatingTOTP] = useState<boolean>(false);

    const avatarUploader = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (updating || deleting || updatingTOTP) return;

        (async () => {
            const response = await fetch("/api/user");
            const json = await response.json();

            setDetails(json);
        })();
    }, [updating, deleting, updatingTOTP]);

    const updateDetails = useCallback(async () => {
        setUpdating(true);
        setError("");
        setWarning("");
        setSuccess("");

        const response = await fetch("/api/user", {
            method: "PATCH",
            body: JSON.stringify({ name, emailAddress, oldPassword, newPassword })
        });

        const json = await response.json();

        setUpdating(false);

        if (json.updated) {
            setSuccess("Details updated successfully");
        } else {
            setError("Something went wrong");
        }
    }, [name, emailAddress, oldPassword, newPassword, setUpdating, setError, setWarning, setSuccess]);

    const deleteAccount = useCallback(async () => {
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
    }, [setDeleting, setError]);

    const handleAvatarUpload = useCallback(async (e: any) => {
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

        setDetails(details);
    }, [setError, setDetails, details]);

    const enableTOTP = useCallback(async () => {
        setUpdatingTOTP(true);

        const response = await fetch("/api/totp", { method: "POST" });
        const json = await response.json();

        setUpdatingTOTP(false);

        setQRCode(json.qr);
    }, [setQRCode]);

    const disableTOTP = useCallback(async () => {
        setUpdatingTOTP(true);
        await fetch("/api/totp", { method: "POST" });
        setUpdatingTOTP(false);
    }, [setQRCode, setDetails, details]);

    return (
        <Popup title="Account Settings" classes="w-120" onClose={onClose}>
            {(error.length + warning.length + success.length) > 0 && <Notice color={error.length ? "red" : warning.length ? "amber" : "green"}>
                <FontAwesomeIcon icon={error.length ? faExclamationCircle : warning.length ? faWarning : faCheck} className="mr-1.5" />
                {error.length ? error : warning.length ? warning : success}
            </Notice>}

            <div className="flex gap-3.5 items-center w-fit mx-auto my-4 select-none">
                <div className="relative rounded-md overflow-hidden cursor-pointer group" onClick={() => avatarUploader.current?.click()}>
                    <Image src={details?.avatar || "/images/default.jpg"} alt={`${details?.name}'s avatar`} width={58} height={58} className="object-cover aspect-square" draggable={false} />
                    <div className="absolute inset-0 bg-black/60 place-items-center hidden pointer-events-none group-hover:grid">
                        <FontAwesomeIcon icon={faCamera} className="text-white" />
                    </div>

                    <input type="file" ref={avatarUploader} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </div>

                <div>
                    <strong className="block font-bold">{details?.name}</strong>
                    <div className="text-xs text-slate-400/75 font-medium">Joined {new Date(details?.creation_date).toLocaleDateString()}</div>
                </div>
            </div>

            <div className="w-full my-3.5 border-b border-slate-300 flex gap-1.5 justify-center">
                <SettingsSectionTab name="Details" onClick={() => setSection("details")} selected={section == "details"} />
                <SettingsSectionTab name="Security" onClick={() => setSection("security")} selected={section == "security"} />
                <SettingsSectionTab name="Platform" onClick={() => setSection("platform")} selected={section == "platform"} />
            </div>

            {section == "details" && (
                <div className="flex gap-3.5">
                    <div className="w-1/2">
                        <Label classes="block w-full">Name</Label>
                        <Field classes="block w-full" defaultValue={details?.name ?? ""} onChange={(e: any) => setName(e.target.value)} />
                    </div>

                    <div className="w-1/2">
                        <Label classes="block w-full">Email Address</Label>
                        <Field classes="block w-full" defaultValue={details?.email_address ?? ""} onChange={(e: any) => setEmailAddress(e.target.value)} />
                    </div>
                </div>
            )}

            {section == "security" && (
                <>
                    <div>
                        <Label classes="block w-full">2-Factor Authentication</Label>

                        {QRCode.length ? (
                            <div className="flex gap-2 items-center">
                                <Image src={QRCode} alt="QR Code" width={120} height={120} className="block select-none cursor-pointer" draggable={false} onClick={() => setQRCodePopupVisibility(true)} />

                                <div>
                                    <strong className="font-semibold">TOTP Authentication</strong>
                                    <div className="text-sm font-medium text-slate-400 mt-1">Scan the QR code with your authenticator app (Google Authenticator, Authy, Duo,etc.)</div>
                                </div>
                            </div>
                        ) : details?.totp_enabled ? <Button classes="block w-fit" color="red" onClick={disableTOTP}>Remove TOTP</Button> : <Button classes="block w-fit" onClick={enableTOTP}>Add TOTP</Button>}
                    </div>

                    <div className="flex gap-3.5 mt-3.5">
                        <div className="w-1/2">
                            <Label classes="block w-full">Old Password</Label>
                            <Field classes="block w-full" type="password" defaultValue={oldPassword} onChange={(e: any) => setOldPassword(e.target.value)} />
                        </div>

                        <div className="w-1/2">
                            <Label classes="block w-full">New Password</Label>
                            <Field classes="block w-full" type="password" defaultValue={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
                        </div>
                    </div>
                </>
            )}

            <div className="flex mt-3.5 gap-3.5">
                <Button classes="w-1/2" onClick={updateDetails}>Save</Button>
                <Button classes="w-1/2" color="gray" onClick={onClose}>Cancel</Button>
                {section == "security" && <Button classes="w-1/2" color="red" onClick={deleteAccount}>Delete Account</Button>}
            </div>

            {QRCodePopupIsVisible && <QRCodeViewer code={QRCode} onClose={() => setQRCodePopupVisibility(false)} />}
        </Popup>
    );
}

function SettingsSectionTab({ name, selected = false, ...rest }: any) {
    return <div className={`py-1.5 px-2.5 border-b-3 translate-y-px text-[0.8rem] ${selected ? "border-indigo-500 text-indigo-500" : "border-transparent text-slate-400/75"} font-medium cursor-pointer duration-150 hover:border-indigo-500 hover:text-indigo-500`} {...rest}>{name}</div>;
}