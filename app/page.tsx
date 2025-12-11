"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faInfoCircle, faStopwatch, faKey, faXmark, faFolderPlus, faExclamationCircle, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "motion/react";
import JSZip from "jszip";

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

        const title = (files.length > 1) ? "files.zip" : files[0].name;

        (async () => {
            const uploadid = await insertUpload(title);

            if (!uploadid.length) return;

            const url = await getUploadURL(`uploads/${uploadid}/${title}`);

            if (!url.length) return;
    
            const request = new XMLHttpRequest();
            request.open("PUT", url, true);

            const data = new FormData();

            if (files.length > 1) {
                const zip = new JSZip();

                for (const file of files) zip.file(file.name, await file.arrayBuffer());
                const content = await zip.generateAsync({ type: "blob" });

                data.append("file", content, title);
            } else {
                data.append("files", files[0]);
            }

            request.upload.addEventListener("progress", (e: ProgressEvent) => {
                if (!e.lengthComputable) return;
                setProgress((e.loaded / e.total) * 100);
            });
    
            request.addEventListener("readystatechange", (e: any) => {
                if (e.target.readyState != 4) return;
    
                setLoading(false);
    
                const end = new Date().getTime();
                setUploadTime(formatTime(end - start));
    
                switch (e.target.status) {
                    case 200:
                    case 201:
                        setID(uploadid);
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
        })();
    }, [files]);

    useEffect(() => {
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, []);

    useEffect(() => setPassword(""), [passwordFieldIsVisible]);
    
    async function insertUpload(title: string): Promise<string> {
        if (!files?.length) return "";

        const size = Array.from(files).reduce((total: number, file: File) => total + file.size, 0);
        const contentType = (files.length > 1) ? "application/zip" : files[0]?.type || "application/octet-stream";

        const response = await fetch("/api/uploads", {
            method: "POST",
            body: JSON.stringify({ title, size, contentType, password, total: files.length })
        });

        const data = await response.json();

        switch (response.status) {
            case 413:
                setError("File is too large");
                break;
            case 408:
                setError("Server timed out");
                break;
            case 500:
                setError("Something went wrong");
                break;
        }

        return data.uploadid ?? "";
    }

    async function getUploadURL(path: string) {
        const response = await fetch(`/api/uploads/url?filename=${path}`);
        const data = await response.json();

        if (!response.ok) {
            setError("An internal server error occurred");
            setLoading(false);
            return "";
        }

        return data.url ?? "";
    }

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

    function handlePaste(e: ClipboardEvent) {
        const transfer = new DataTransfer();

        if (e.clipboardData?.files?.length) {
            for (let pastedFile of e.clipboardData.files) {
                transfer.items.add(pastedFile);
            }
        } else if (e.clipboardData?.getData("text")?.length) {
            const textFile = new File([e.clipboardData.getData("text")], "pasted.txt", { type: "text/plain" });
            transfer.items.add(textFile);
        }

        if (!transfer.files.length) return;

        setFiles(transfer.files);
        uploader.current?.dispatchEvent(new Event("change"));
    }

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
                className="select-none max-sm:w-full max-sm:px-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-16">
                    <div className="w-fit mx-auto flex items-center gap-4">
                        <Logo width={56} height={56} className="" />
                        <h1 className="text-5xl font-bold leading-none">share.surf</h1>
                    </div>

                    <h2 className="block font-medium text-slate-400 mt-4 text-center">The no-frills file sharing service</h2>
                </div>
                
                {id.length > 0 && (
                    <div>
                        <strong className={`block w-fit mx-auto text-2xl font-semibold text-center ${id ? " text-emerald-500 cursor-pointer break-all" : ""} max-sm:text-2xl max-sm:leading-relaxed`} onClick={copyUploadURL}>{id ? `${document.location.href}uploads/${id}` : ""}</strong>

                        <div className="flex items-center gap-5 w-fit mx-auto mt-4">
                            <Button onClick={resetUploader}>Upload More</Button>
                            <div className="text-sm font-medium text-slate-400 leading-none"><FontAwesomeIcon icon={faStopwatch} className="mr-1.5" />Upload took {uploadTime}</div>
                        </div>
                    </div>
                )}

                {loading && progress < 100 && (
                    <div className="w-115 mx-auto max-sm:w-full">
                        <strong className="block text-center text-2xl font-bold mb-4">{Math.round(progress)}&#37;</strong>
                        <motion.progress 
                            className="block appearance-none w-full h-3 border-none origin-center"
                            max={100}
                            value={Math.round(progress)}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        ></motion.progress>
                    </div>
                )}

                {loading && progress >= 100 && (
                    <div className="w-115 mx-auto text-center max-sm:w-full">
                        <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-400/60"><FontAwesomeIcon icon={faCircleNotch} className="text-xl animate-spin" /><span className="text-lg">Finalising</span></div>
                    </div>
                )}

                {!loading && !id.length && (
                    <div className="w-115 mx-auto max-sm:w-full">
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
                                    <div className={`relative${passwordFieldIsVisible ? " max-sm:w-full max-sm:grow" : ""}`}>
                                        <Field 
                                            type="password"
                                            placeholder="Password"
                                            classes={passwordFieldIsVisible ? "max-sm:w-full max-sm:grow-1" : ""}
                                            readOnly={!sessionExists}
                                            onChange={(e: any) => setPassword(e.target.value)}
                                        />

                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-300 leading-none cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500" onClick={() => setPasswordFieldVisibility(false)}>
                                            <FontAwesomeIcon icon={faXmark} />
                                        </div> 
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
            <AnimatePresence>
                {historyIsVisible && sessionExists && <UploadHistory onClose={() => setHistoryVisibility(false)} />}
            </AnimatePresence>

            <AnimatePresence>
                {accountPromptIsVisible && <AccountPrompt onClose={() => setAccountPromptVisibility(false)} />}
            </AnimatePresence>
        </main>
    );
}