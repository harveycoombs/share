"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faInfoCircle, faStopwatch, faKey, faXmark, faFolderPlus, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { motion } from "motion/react";

import Logo from "@/app/components/common/Logo";
import Button from "@/app/components/common/Button";
import UploadHistory from "@/app/components/popups/UploadHistory";
import Field from "@/app/components/common/Field";
import Notice from "@/app/components/common/Notice";
import AccountPrompt from "@/app/components/popups/AccountPrompt";
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
    const [accountPromptIsVisible, setAccountPromptVisibility] = useState<boolean>(false);

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
        <main className={`${sessionExists ? "min-h-[calc(100vh-112px)]" : "min-h-[calc(100vh-119px)]"} grid place-items-center`} onDragOver={handleDragOverEvent} onDragEnter={handleDragEnterEvent} onDragLeave={handleDragLeaveEvent} onDrop={handleDropEvent}>
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

                    <h2 className="block font-medium text-slate-400 mt-4 text-center">The no-frills file sharing service</h2>
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
                        <Notice color={error.length ? "red" : "indigo"}>
                            <FontAwesomeIcon icon={error.length ? faExclamationCircle : faInfoCircle} className={error.length ? "mr-1.5" : "mr-1.5 text-base translate-y-0.25"} />
                            {error.length ? error : "Drag or paste files onto this page to upload"}
                        </Notice>

                        <div className={`flex justify-between items-center p-2.5 rounded-xl mt-5 mb-4.5 border border-slate-300${passwordFieldIsVisible ? " max-sm:flex-col max-sm:gap-2" : ""}`}>
                            <div>
                                <Button onClick={browseFiles} classes={`inline-block align-middle${passwordFieldIsVisible ? " max-sm:w-full" : ""}`}>Browse Files</Button>
                                
                                <Button
                                    color="gray"
                                    classes="ml-2.5"
                                    square={true}
                                    title="Upload Folder"
                                    onClick={browseFolders}
                                >
                                    <FontAwesomeIcon icon={faFolderPlus} />
                                </Button>
                            </div>

                            <div className={`flex items-center gap-2.5 ${passwordFieldIsVisible ? " max-sm:w-full" : ""}`}>
                                <Button color="gray" square={true} title={sessionExists ? "View Upload History" : "Sign In To View Upload History"} onClick={() => sessionExists ? setHistoryVisibility(true) : setAccountPromptVisibility(true)}>
                                    <FontAwesomeIcon icon={faClockRotateLeft} />
                                </Button>

                                {passwordFieldIsVisible ? (
                                    <div className={`relative${passwordFieldIsVisible ? " max-sm:w-full max-sm:grow-1" : ""}`}>
                                        <Field 
                                            type="password"
                                            placeholder="Password"
                                            classes={passwordFieldIsVisible ? "max-sm:w-full max-sm:grow-1" : ""}
                                            readOnly={!sessionExists}
                                            onChange={(e: any) => setPassword(e.target.value)}
                                        />

                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 leading-none cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500" onClick={() => setPasswordFieldVisibility(false)}><FontAwesomeIcon icon={faXmark} /></div> 
                                    </div>
                                ) : (
                                    <Button color="gray" square={true} title={sessionExists ? "Set Upload Password" : "Sign In To Set Upload Password"} onClick={() => sessionExists ? setPasswordFieldVisibility(sessionExists) : setAccountPromptVisibility(true)}>
                                        <FontAwesomeIcon icon={faKey} />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="text-sm font-medium leading-none text-slate-400 flex justify-between max-sm:justify-center">
                            <div>Expires after 48 hours</div>
                            <div className="hidden mx-2 max-sm:block">&middot;</div>
                            <div>750MB upload limit</div>
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
            {accountPromptIsVisible && <AccountPrompt onClose={() => setAccountPromptVisibility(false)} />}
        </main>
    );
}