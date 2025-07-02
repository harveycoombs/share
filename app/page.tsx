"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faInfoCircle, faStopwatch, faKey, faXmark, faFolderPlus, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { motion } from "motion/react";

import Logo from "@/app/components/common/Logo";
import Button from "@/app/components/common/Button";
import UploadHistory from "@/app/components/common/popups/UploadHistory";
import Field from "@/app/components/common/Field";
import Notice from "@/app/components/common/Notice";
import { formatTime } from "@/lib/utils";

export default function Home() {
    const [files, setFiles] = useState<FileList|null>(null);
    const [id, setID] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [dragging, setDragging] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [progress, setProgress] = useState<number>(0);
    const [password, setPassword] = useState<string>("");
    const [passwordFieldIsVisible, setPasswordFieldVisibility] = useState<boolean>(false);
    const [uploadTime, setUploadTime] = useState<string>("");
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
        if (!files?.length) return;

        if (Array.from(files).reduce((total: number, file: File) => total + file.size, 0) > 2147483648) {
            setError("File is too large");
            setLoading(false);
            return;
        }

        setLoading(true);

        const start = new Date().getTime();

        const data = new FormData();

        data.append("password", password);
        for (let file of files) data.append("files", file);

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

            const end = new Date().getTime();

            switch (e.target.status) {
                case 200:
                    setID(e.target.response.id);
                    setUploadTime(formatTime(end - start));
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
    }, [files]);

    const resetUploader = useCallback(() => {
        setID("");
        setError("");
        setProgress(0);
        setFiles(null);
        setUploadTime("");
        setLoading(false);
        setPassword("");

        if (uploader.current) {
            uploader.current.value = "";
        }
    }, []);

    const copyUploadURL = useCallback(async (e: any) => {
        if (!id) return;

        const url = e.target.innerText;

        await navigator.clipboard.writeText(url.toLowerCase());
        e.target.innerText = "Copied to Clipboard";

        setTimeout(() => e.target.innerText = url, 1200);
    }, [id]);

    const handleDragOverEvent = useCallback((e: any) => {
        e.preventDefault();

        if (!dragging && !files?.length) handleDragEnterEvent();
    }, [dragging, files]);
    
    const handleDragEnterEvent = useCallback(() => {
        if (files?.length) return;

        setDragging(true);
    }, [files]);
    
    const handleDragLeaveEvent = useCallback(() => {
        if (files?.length) return;
        setDragging(false);
    }, [files]);

    const handleDropEvent = useCallback((e: any) => {
        e.preventDefault();

        if (files?.length) return;

        if (uploader?.current) {
            uploader.current.files = e.dataTransfer.files;
            uploader.current.dispatchEvent(new Event("input", { bubbles: true }));

            handleDragLeaveEvent();
        }
    }, [files, uploader, handleDragLeaveEvent]);

    const handlePaste = useCallback((e: ClipboardEvent) => {
        if (!e.clipboardData?.files?.length) return;

        const transfer = new DataTransfer();

        for (let pastedFile of e.clipboardData.files) {
            transfer.items.add(pastedFile);
        }

        setFiles(transfer.files);
        uploader.current?.dispatchEvent(new Event("change"));
    }, [setFiles, uploader]);

    useEffect(() => {
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, []);

    useEffect(() => setPassword(""), [passwordFieldIsVisible]);

    const browseFiles = useCallback(() => {
        uploader.current?.removeAttribute("webkitdirectory");
        uploader.current?.removeAttribute("directory");

        uploader.current?.click();
    }, [uploader]);

    const browseFolders = useCallback(() => {
        uploader.current?.setAttribute("webkitdirectory", "true");
        uploader.current?.setAttribute("directory", "true");

        uploader.current?.click();
    }, [uploader]);

    return (
        <main className={`${sessionExists ? "min-h-[calc(100vh-112px)]" : "min-h-[calc(100vh-117px)]"} grid place-items-center`} onDragOver={handleDragOverEvent} onDragEnter={handleDragEnterEvent} onDragLeave={handleDragLeaveEvent} onDrop={handleDropEvent}>
            <motion.section
                className="w-fit select-none max-sm:w-full max-sm:px-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="w-115 mx-auto mb-16 max-sm:w-full">
                    <div className="w-fit mx-auto flex items-center gap-4">
                        <Logo width={56} height={56} className="" />
                        <h1 className="text-5xl font-bold leading-none">share.surf</h1>
                    </div>

                    <h2 className="block font-medium text-slate-400 mt-4 text-center dark:text-zinc-600">The no-frills file sharing service</h2>
                </div>
                
                {id.length > 0 && (
                    <div>
                        <strong className={`block w-fit mx-auto text-2xl font-semibold${id ? " text-emerald-500 cursor-pointer break-all" : ""} max-sm:text-2xl max-sm:leading-relaxed`} onClick={copyUploadURL}>{id ? `${document.location.href}uploads/${id}` : ""}</strong>

                        <div className="flex items-center gap-5 w-fit mx-auto mt-4">
                            <Button onClick={resetUploader}>Upload More</Button>
                            <div className="text-sm font-semibold text-slate-400 leading-none"><FontAwesomeIcon icon={faStopwatch} className="mr-1.5" />Upload took {uploadTime}</div>
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
                        {error.length ? <Notice color="red"><FontAwesomeIcon icon={faExclamationCircle} className="mr-1.5" />{error}</Notice> : (
                            <div className="w-full px-2.5 py-2 text-sm font-medium text-indigo-500 bg-indigo-100 rounded-lg dark:bg-indigo-200">
                                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-base translate-y-0.25" />
                                Drag or paste files onto this page to upload
                            </div>
                        )}

                        <div className={`flex justify-between items-center p-2.5 rounded-lg mt-5 mb-4.5 border border-slate-300${passwordFieldIsVisible ? " max-sm:flex-col max-sm:gap-2" : ""} dark:border-zinc-700`}>
                            <div>
                                <Button onClick={browseFiles} classes={`inline-block align-middle${passwordFieldIsVisible ? " max-sm:w-full" : ""}`}>Browse Files</Button>
                                
                                <button 
                                    className="p-3 rounded-md ml-2 text-[0.8rem] leading-none font-semibold hover:bg-slate-50 hover:text-slate-500 active:bg-slate-100 active:text-slate-600 dark:hover:bg-zinc-800/60 dark:active:bg-zinc-800/90 dark:hover:text-zinc-400 dark:active:text-zinc-400 duration-150 cursor-pointer text-center select-none"
                                    title="Upload Folder"
                                    onClick={browseFolders}
                                >
                                    <FontAwesomeIcon icon={faFolderPlus} />
                                </button>
                            </div>

                            <div className={`flex items-center gap-3.5 ${passwordFieldIsVisible ? " max-sm:w-full" : ""}`}>
                                <UploadOption icon={faClockRotateLeft} title={sessionExists ? "View Upload History" : "Sign In To View Upload History"} disabled={!sessionExists} onClick={() => setHistoryVisibility(sessionExists)} />
                                {passwordFieldIsVisible ? (
                                    <div className={`relative${passwordFieldIsVisible ? " max-sm:w-full max-sm:grow-1" : ""}`}>
                                        <Field 
                                            type="password"
                                            placeholder="Password"
                                            classes={passwordFieldIsVisible ? "max-sm:w-full max-sm:grow-1" : ""}
                                            readOnly={!sessionExists}
                                            onChange={(e: any) => setPassword(e.target.value)}
                                        />

                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 leading-none cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500 dark:text-zinc-600 dark:hover:text-zinc-500 dark:active:text-zinc-400" onClick={() => setPasswordFieldVisibility(false)}><FontAwesomeIcon icon={faXmark} /></div> 
                                    </div>
                                ) : <UploadOption icon={faKey} title={sessionExists ? "Set Upload Password" : "Sign In To Set Upload Password"} disabled={!sessionExists} onClick={() => setPasswordFieldVisibility(sessionExists)} />}
                            </div>
                        </div>

                        <div className="text-sm font-medium leading-none text-slate-400 flex justify-between max-sm:justify-center dark:text-zinc-600">
                            <div>Expires after 24 hours</div>
                            <div className="hidden mx-2 max-sm:block">&middot;</div>
                            <div>2GB upload limit</div>
                        </div>
                    </div>
                )}
            </motion.section>

            <input 
                type="file"
                className="hidden"
                multiple={true}
                ref={uploader}
                onInput={(e: any) => setFiles(e.target.files)}
            />

            {historyIsVisible && sessionExists && <UploadHistory onClose={() => setHistoryVisibility(false)} />}
        </main>
    );
}

function UploadOption({ icon, disabled, ...rest }: any) {
    return (
        <div 
            className={`text-lg leading-none text-slate-300 dark:text-zinc-600 duration-150 ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:text-slate-400 active:text-slate-500 dark:hover:text-zinc-500 dark:active:text-zinc-400"}`} 
            {...rest}
        >
            <FontAwesomeIcon icon={icon} />
        </div>
    );
}