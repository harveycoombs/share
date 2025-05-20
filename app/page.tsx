"use client";
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faInfoCircle, faStopwatch, faKey, faXmark } from "@fortawesome/free-solid-svg-icons";

import Logo from "@/app/components/common/Logo";
import Button from "@/app/components/common/Button";
import UploadHistory from "@/app/components/common/popups/UploadHistory";
import Field from "@/app/components/common/Field";

export default function Home() {
    const [file, setFile] = useState<File|null>(null);
    const [id, setID] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [dragging, setDragging] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [progress, setProgress] = useState<number>(0);
    const [password, setPassword] = useState<string>("");
    const [passwordFieldIsVisible, setPasswordFieldVisibility] = useState<boolean>(false);
    const [uploadTime, setUploadTime] = useState<number>(0);
    const [historyIsVisible, setHistoryVisibility] = useState<boolean>(false);
    const [sessionExists, setSessionExistence] = useState<boolean>(false);

    const uploader = useRef<HTMLInputElement>(null);

    useEffect(() => {
        (async () => {
            const response = await fetch("/api/user/session");
            setSessionExistence(response.ok);
        })();
    }, []);

    useEffect(() => {
        if (!file) return;

        if (file.size > 2147483648) {
            setError("File is too large");
            setLoading(false);
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append("files", file);
        data.append("password", password);

        const request = new XMLHttpRequest();

        request.open("POST", "/api/upload", true);
        request.responseType = "json";

        request.upload.addEventListener("progress", (e: ProgressEvent) => {
            if (!e.lengthComputable) return;
            setProgress((e.loaded / e.total) * 100);
        });

        request.addEventListener("readystatechange", (e: any) => {
            if (e.target.readyState != 4) return;

            setLoading(false);

            switch (e.target.status) {
                case 200:
                    setID(e.target.response.id);
                    setUploadTime(e.target.response.duration);
                    break;
                case 413:
                    setError("File is too large");
                    break;
                case 408:
                    setError("Server timed out");
                    break;
                default:
                    setError("Something went wrong");
                    break;
            }
        });

        request.send(data);
    }, [file]);

    function resetUploader() {
        setID("");
        setError("");
        setProgress(0);
        setFile(null);
        setUploadTime(0);
        setLoading(false);
        setPassword("");

        if (uploader.current) {
            uploader.current.value = "";
        }
    }

    async function copyUploadURL(e: any) {
        if (!id) return;

        const url = e.target.innerText;

        await navigator.clipboard.writeText(url.toLowerCase());
        e.target.innerText = "Copied to Clipboard";

        setTimeout(() => e.target.innerText = url, 1200);
    }

    function handleDragOverEvent(e: any) {
        e.preventDefault();

        if (!dragging && !file) handleDragEnterEvent();
    }
    
    function handleDragEnterEvent() {
        if (file) return;

        setDragging(true);
    }
    
    function handleDragLeaveEvent() {
        if (file) return;
        setDragging(false);
    }

    function handleDropEvent(e: any) {
        e.preventDefault();

        if (file) return;

        if (uploader?.current) {
            uploader.current.files = e.dataTransfer.files;
            uploader.current.dispatchEvent(new Event("input", { bubbles: true }));

            handleDragLeaveEvent();
        }
    }

    function handlePaste(e: ClipboardEvent) {
        if (!e.clipboardData?.files?.length) return;

        const transfer = new DataTransfer();

        for (let pastedFile of e.clipboardData.files) {
            transfer.items.add(pastedFile);
        }

        setFile(transfer.files[0]);
        uploader.current?.dispatchEvent(new Event("change"));
    }

    useEffect(() => {
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, []);

    useEffect(() => setPassword(""), [passwordFieldIsVisible]);

    return (
        <>
            <main className="min-h-[calc(100vh-117px)] grid place-items-center" onDragOver={handleDragOverEvent} onDragEnter={handleDragEnterEvent} onDragLeave={handleDragLeaveEvent} onDrop={handleDropEvent}>
                <section className="w-fit select-none max-sm:w-full max-sm:px-4">
                    <div className="w-115 mx-auto mb-16 max-sm:w-full">
                        <div className="w-fit mx-auto flex items-center gap-4">
                            <Logo width={56} height={56} className="" />
                            <h1 className="text-5xl font-bold leading-none">share.surf</h1>
                        </div>

                        <h2 className="block font-semibold text-slate-400 mt-4 text-center">The no-frills file sharing service</h2>
                    </div>
                    
                    {(id.length > 0 || error.length > 0) && (
                        <div>
                            <strong className={`block w-fit mx-auto text-2xl font-semibold${error.length ? " text-red-500" : id ? " text-emerald-500 cursor-pointer break-all" : dragging ? " text-slate-500" : ""} max-sm:text-2xl max-sm:leading-relaxed`} onClick={copyUploadURL}>{
                                error.length ? error : 
                                id ? `${document.location.href}uploads/${id}` : ""
                            }</strong>

                            <div className="flex items-center gap-5 w-fit mx-auto mt-4">
                                <Button onClick={resetUploader}>Upload More</Button>
                                <div className="text-sm font-semibold text-slate-400 leading-none"><FontAwesomeIcon icon={faStopwatch} className="mr-1.5" />Upload took {uploadTime}ms</div>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div>
                            <strong className="block text-center text-2xl font-bold mb-4">{Math.round(progress)}&#37;</strong>
                            <progress className="block appearance-none w-full h-3 border-none duration-150" max={100} value={Math.round(progress)}></progress>
                        </div>
                    )}

                    {!loading && !id.length && (
                        <div className="w-115 max-sm:w-full">
                            <div className="w-full px-2.5 py-2 text-sm font-bold text-indigo-500 bg-indigo-100 rounded-lg">
                                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-base translate-y-0.25" />
                                Drag or paste files onto this page to upload
                            </div>

                            <div className={`flex justify-between items-center p-2.5 rounded-lg mt-5 mb-4.5 border border-slate-300${passwordFieldIsVisible ? " max-sm:flex-col max-sm:gap-2" : ""}`}>
                                <Button onClick={() => uploader.current?.click()} classes={passwordFieldIsVisible ? "max-sm:w-full" : ""}>Browse Files</Button>

                                <div className={`flex items-center gap-3.5${passwordFieldIsVisible ? " max-sm:w-full" : ""}`}>
                                    <UploadOption icon={faClockRotateLeft} title={sessionExists ? "View Upload History" : "Sign In To View Upload History"} onClick={() => setHistoryVisibility(sessionExists)} />
                                    {passwordFieldIsVisible ? (
                                        <div className={`relative${passwordFieldIsVisible ? " max-sm:w-full max-sm:grow-1" : ""}`}>
                                            <Field 
                                                type="password"
                                                placeholder={sessionExists ? "Password" : "Password (Registered Users Only)"}
                                                classes={passwordFieldIsVisible ? "max-sm:w-full max-sm:grow-1" : ""}
                                                readOnly={!sessionExists}
                                                onChange={(e: any) => setPassword(e.target.value)}
                                            />

                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 leading-none cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500" onClick={() => setPasswordFieldVisibility(false)}><FontAwesomeIcon icon={faXmark} /></div> 
                                        </div>
                                    ) : <UploadOption icon={faKey} title="Set Upload Password" onClick={() => setPasswordFieldVisibility(true)} />}
                                </div>
                            </div>

                            <div className="text-sm font-semibold leading-none text-slate-400 flex justify-between">
                                <div>Uploads expire after 24 hours</div>
                                <div>Uploads must be &lt;= 1GB</div>
                            </div>
                        </div>
                    )}
                </section>

                <input type="file" className="hidden" ref={uploader} onInput={(e: any) => setFile(e.target.files[0])} />
            </main>

            {historyIsVisible && sessionExists && <UploadHistory onClose={() => setHistoryVisibility(false)} />}
        </>
    );
}

function UploadOption({ icon, ...rest }: any) {
    return <div className="text-lg leading-none text-slate-300 cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500" {...rest}><FontAwesomeIcon icon={icon} /></div>;
}