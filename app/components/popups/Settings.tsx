"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheck, faCircleNotch, faExclamationCircle, faWarning } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { AnimatePresence } from "motion/react";

import Popup from "@/app/components/common/Popup";
import Field from "@/app/components/common/Field";
import Button from "@/app/components/common/Button";
import Notice from "@/app/components/common/Notice";
import Switch from "@/app/components/common/Switch";
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
               const json = await response.json();
     
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
     
          const json = await response.json();
     
          setUpdating(false);
     
          if (json.updated) {
               setSuccess("Details updated successfully");
          } else {
               setError("Something went wrong");
          }
     }, [name, emailAddress, oldPassword, newPassword, setUpdating, setError, setWarning, setSuccess]);
     
     const deleteAccount = useCallback(async () => {
          if (!deletionIntent) {
               setDeletionIntent(true);
               return;
          }
     
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
               method: "PUT",
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
     
          const response = await fetch("/api/totp", {
               method: "POST",
               body: JSON.stringify({ email: details.email_address })
          });
          const json = await response.json();
     
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
          const json = await response.json();
          
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

     const logout = useCallback(async () => {
          await fetch("/api/user/session", { method: "DELETE" });
          window.location.reload();
     }, []);
     
     return (
          <Popup title="Account Settings" classes="w-146 max-sm:w-full" onClose={onClose}>
               {loading ? (<div className="w-full h-89 grid place-items-center">
                    <div className="text-center">
                         <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-2xl text-slate-400/60" />
                         <div className="font-medium text-slate-400/70 mt-1.5">Loading...</div>
                    </div>
               </div>) : (
                    <>
                         {(error.length + warning.length + success.length) > 0 && (
                              <Notice color={error.length ? "red" : warning.length ? "amber" : "green"}>
                                   {error.length ? error : warning.length ? warning : success}
                              </Notice>
                         )}
          
                         <div className="flex gap-3.5 items-center w-fit mx-auto my-4 select-none">
                              <div className="relative rounded overflow-hidden cursor-pointer group" onClick={() => avatarUploader.current?.click()}>
                                   <Image src={details?.avatar || "/images/default.jpg"} alt={`${details?.name}'s avatar`} width={54} height={54} className="object-cover aspect-square" draggable={false} />
                                             
                                   <div className="absolute inset-0 bg-black/70 place-items-center hidden pointer-events-none group-hover:grid">
                                        <FontAwesomeIcon icon={faCamera} className="text-white text-xl" />
                                   </div>
          
                                   <input type="file" ref={avatarUploader} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                              </div>
          
                              <div>
                                   <strong className="block font-bold">{details?.name}</strong>
                                   <div className="text-xs text-white/65 font-medium">Joined {new Date(details?.creation_date).toLocaleDateString()}</div>
                              </div>
                         </div>
          
                         <div className="w-full my-3.5 border-b border-white/25 flex gap-1.5 justify-center">
                              <SettingsSectionTab name="Details" onClick={() => setSection("details")} selected={section == "details"} />
                              <SettingsSectionTab name="Privacy & Security" onClick={() => setSection("security")} selected={section == "security"} />
                         </div>
          
                         {section == "details" && (
                              <SettingsSection>
                                   <FieldContainer title="Name">
                                        <Field classes="block w-full" defaultValue={details?.name ?? ""} onChange={(e: any) => setName(e.target.value)} />
                                   </FieldContainer>
                                   
                                   <FieldContainer title="Email Address" classes="mt-3.5">
                                        <Field classes="block w-full" defaultValue={details?.email_address ?? ""} onChange={(e: any) => setEmailAddress(e.target.value)} />
                                   </FieldContainer>
                              </SettingsSection>
                         )}
          
                         {section == "security" && (
                              <SettingsSection>
                                   <FieldContainer title="Use Password">
                                        <Switch on={false} onChange={(on: boolean) => console.log(on)} />
                                   </FieldContainer>
                                   
                                   <FieldContainer title="2-Factor Authentication" classes="mt-3.5">
                                        {QRCode.length ? (
                                             <div className="flex flex-col">
                                                  <Image src={QRCode} alt="QR Code" width={160} height={160} className="block mx-auto select-none cursor-pointer" draggable={false} onClick={() => setQRCodePopupVisibility(true)} />
          
                                                  <div className="text-xs font-medium text-center text-slate-500">Scan the QR code with your TOTP authenticator app (Google Authenticator, Authy, Duo, etc.)</div>
                                             </div>
                                        ) : details?.totp_secret?.length ? <Button classes="block w-fit" color="red" loading={updatingTOTP} onClick={disableTOTP}>Remove TOTP</Button> : <Button classes="block w-full" loading={updatingTOTP} onClick={enableTOTP}>Add TOTP</Button>}
                                   </FieldContainer>
                                        
                                   <FieldContainer title="Data &amp; GDPR" classes="mt-3.5">
                                        <div className="flex gap-3.5">
                                             <Button classes="w-1/2 shrink-1" type="secondary" loading={dataRequestLoading} onClick={requestData}>Request Data</Button>
                                             <Button classes="w-1/2 shrink-1" type="dangerous" onClick={deleteAccount}>{deletionIntent ? "Are You Sure?" : "Delete Account"}</Button>
                                        </div>
                                   </FieldContainer>
                              </SettingsSection>
                         )}
          
                         <div className="flex mt-3.5 gap-3.5">
                              <Button classes="w-1/3" onClick={updateDetails}>Save</Button>
                              <Button classes="w-1/3" type="secondary" onClick={onClose}>Cancel</Button>
                              <Button type="dangerous" classes="w-1/3">Log Out</Button>
                         </div>
          
                         <AnimatePresence>
                              {QRCodePopupIsVisible && <QRCodeViewer code={QRCode} onClose={() => setQRCodePopupVisibility(false)} />}
                         </AnimatePresence>
                    </>
               )}
          </Popup>
     );
}

function FieldContainer({ title = "", children, classes = "" }: any) {
     return (
          <div className={`flex gap-3.5 justify-between items-center ${classes}`}>
               <label className="text-sm font-medium text-white/65">{title}</label>
               <div className="w-3/5">{children}</div>
          </div>
     );
}

function SettingsSection({ children }: any) {
    return (
        <div className="min-h-36.75">
            {children}
        </div>
    );
}

function SettingsSectionTab({ name, selected = false, ...rest }: any) {
    return <div className={`py-1.5 px-2.5 border-b-3 translate-y-px text-sm font-semibold select-none ${selected ? "border-green-500 text-green-500" : "border-transparent text-white/65"} font-medium cursor-pointer duration-150 hover:border-green-500 hover:text-green-500`} {...rest}>{name}</div>;
}