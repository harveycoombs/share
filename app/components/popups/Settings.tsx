"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck, faCircleNotch, faExclamationCircle, faWarning } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { AnimatePresence } from "motion/react";

import Popup from "@/app/components/common/Popup";
import Field from "@/app/components/common/Field";
import Label from "@/app/components/common/Label";
import Button from "@/app/components/common/Button";
import Notice from "@/app/components/common/Notice";
import QRCodeViewer from "@/app/components/popups/QRCodeViewer";

interface Properties {
    onClose: () => void;
}

export default function Settings({ onClose }: Properties) {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
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

    const [dataRequestLoading, setDataRequestLoading] = useState<boolean>(false);

    const avatarUploader = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (updating || deleting || updatingTOTP) return;

        setLoading(true);

        (async () => {
            const response = await fetch("/api/user");
            const json: any = await response.json();

            setDetails(json);
            setLoading(false);
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

        const json: any = await response.json();

        setUpdating(false);

        if (!response.ok) {
            (response.status === 400 || response.status === 401 || response.status === 409 ? setWarning : setError)(json.error ?? "Something went wrong");
            return;
        }

        if (json.updated) {
            setSuccess(newPassword.length ? (details?.has_password ? "Password changed successfully" : "Password set successfully") : "Details updated successfully");
            setOldPassword("");
            setNewPassword("");
        } else {
            setError("Something went wrong");
        }
    }, [name, emailAddress, oldPassword, newPassword, details, setUpdating, setError, setWarning, setSuccess]);

    const deleteAccount = useCallback(async () => {
        if (!deletionIntent) {
            setDeletionIntent(true);
            return;
        }

        const response = await fetch("/api/user", {
            method: "DELETE"
        });

        const json: any = await response.json();

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
            method: "PUT",
            body: data
        });

        const json: any = await response.json();

        if (!json.uploaded) {
            setError("Something went wrong");
            return;
        }

        setDetails(details);
    }, [setError, setDetails, details]);

    const enableTOTP = useCallback(async () => {
        setUpdatingTOTP(true);

        const response = await fetch("/api/totp", {
            method: "POST",
            body: JSON.stringify({ email: details.email_address })
        });
        const json: any = await response.json();

        setUpdatingTOTP(false);

        setQRCode(json.qr);
    }, [setQRCode, details]);

    const disableTOTP = useCallback(async () => {
        setUpdatingTOTP(true);
        await fetch("/api/totp", { method: "DELETE" });
        setUpdatingTOTP(false);
        setQRCode("");
    }, [setQRCode, setDetails, details]);

    const requestData = useCallback(async () => {
        setDataRequestLoading(true);

        const response = await fetch("/api/user/data");
        const json: any = await response.json();
        
        setDataRequestLoading(false);

        if (!response.ok) {
            setError(json.error);
            return;
        }

        setSuccess("Personal data request sent. Please check your email.");
        
        setTimeout(() => {
            setSuccess("");
        }, 4000);
    }, []);

    return (
        <Popup title="Account Settings" classes="w-125 max-sm:w-full" onClose={onClose}>
            {loading ? (<div className="w-full h-89 grid place-items-center">
                <div className="text-center">
                    <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-2xl text-gray-400/60" />
                    <div className="font-medium text-gray-400/70 mt-1.5">Loading...</div>
                </div>
            </div>) : (
                <>
                    {(error.length + warning.length + success.length) > 0 && (
                        <Notice color={error.length ? "red" : warning.length ? "amber" : "green"}>
                            <FontAwesomeIcon icon={error.length ? faExclamationCircle : warning.length ? faWarning : faCheck} className="mr-1.5" />
                            {error.length ? error : warning.length ? warning : success}
                        </Notice>
                    )}

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
                            <div className="text-xs text-gray-400 font-medium">Joined {new Date(details?.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="w-full my-3.5 border-b border-gray-300 flex gap-1.5 justify-center">
                        <SettingsSectionTab name="Details" onClick={() => setSection("details")} selected={section == "details"} />
                        <SettingsSectionTab name="Privacy & Security" onClick={() => setSection("security")} selected={section == "security"} />
                    </div>

                    {section === "details" && (
                        <div className="space-y-5">
                            <SettingsFieldContainer label="Name">
                                <Field classes="block w-full" defaultValue={details?.name ?? ""} onChange={(e: any) => setName(e.target.value)} />
                            </SettingsFieldContainer>

                            <SettingsFieldContainer label="Email Address">
                                <Field classes="block w-full" defaultValue={details?.email_address ?? ""} onChange={(e: any) => setEmailAddress(e.target.value)} />
                            </SettingsFieldContainer>
                        </div>
                    )}

                    {section === "security" && (
                        <div className="space-y-5">
                            <SettingsFieldContainer label={details?.has_password ? "Change Password" : "Set Password"}>
                                <div className="space-y-2">
                                    {details?.has_password && <Field type="password" classes="block w-full" placeholder="Current password" autoComplete="current-password" value={oldPassword} onChange={(e: any) => setOldPassword(e.target.value)} />}
                                    <Field type="password" classes="block w-full" placeholder="New password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
                                </div>
                            </SettingsFieldContainer>

                            <SettingsFieldContainer label="Multi-Factor Authentication">
                                {QRCode.length ? (
                                    <div className="flex flex-col">
                                        <Image src={QRCode} alt="QR Code" width={160} height={160} className="block mx-auto select-none cursor-pointer" draggable={false} onClick={() => setQRCodePopupVisibility(true)} />

                                        <div className="text-xs font-medium text-center text-gray-500">Scan the QR code with your TOTP authenticator app (Google Authenticator, Authy, Duo, etc.)</div>
                                    </div>
                                ) : details?.has_totp ? <Button classes="block w-fit" color="red" loading={updatingTOTP} onClick={disableTOTP}>Remove TOTP</Button> : <Button classes="block w-full" loading={updatingTOTP} onClick={enableTOTP}>Add TOTP</Button>}
                            </SettingsFieldContainer>

                            <SettingsFieldContainer label="Data & GDPR">
                                <Button color="gray" classes="block w-full min-w-44.5" loading={dataRequestLoading} onClick={requestData}>Request Data</Button>
                            </SettingsFieldContainer>
                        </div>
                    )}

                    <div className="flex mt-3.5 gap-3.5">
                        <Button classes="w-1/2" onClick={updateDetails}>Save</Button>
                        <Button classes="w-1/2" color="gray" onClick={onClose}>Cancel</Button>
                        {section === "security" && <Button classes="w-1/2" color="red" onClick={deleteAccount}>{deletionIntent ? "Are You Sure?" : "Delete Account"}</Button>}
                    </div>

                    <AnimatePresence>
                        {QRCodePopupIsVisible && <QRCodeViewer code={QRCode} onClose={() => setQRCodePopupVisibility(false)} />}
                    </AnimatePresence>
                </>
            )}
        </Popup>
    );
}

function SettingsFieldContainer({ label, children }: any) {
     return (
          <div className="w-full flex justify-between items-center gap-5">
               <Label classes="w-1/2">{label}</Label>
               <div className="w-1/2">{children}</div>
          </div>
     );
}

function SettingsSectionTab({ name, selected = false, ...rest }: any) {
    return <div className={`py-1.5 px-2.5 border-b-3 translate-y-px text-sm select-none ${selected ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400/75"} font-medium cursor-pointer duration-150 hover:border-blue-500 hover:text-blue-500`} {...rest}>{name}</div>;
}