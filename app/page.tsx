"use client";
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import Logo from "@/app/components/common/Logo";
import Button from "@/app/components/common/Button";
import UploadHistory from "@/app/components/common/popups/UploadHistory";

export default function Home() {
    const [file, setFile] = useState<File|null>(null);
    const [id, setID] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [dragging, setDragging] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [progress, setProgress] = useState<number>(0);
    const [historyIsVisible, setHistoryVisibility] = useState<boolean>(false);

    const uploader = useRef<HTMLInputElement>(null);

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
                    break;
                case 413:
                    setError("File is too large");
                    break;
                default:
                    setError("Something went wrong");
                    break;
            }
        });

        request.send(data);
    }, [file]);

    function resetUploader() {
        setID(0);
        setError("");
        setProgress(0);
        setFile(null);
        setLoading(false);
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

    return (
        <>
            <main className="min-h-[calc(100vh-117px)] grid place-items-center" onDragOver={handleDragOverEvent} onDragEnter={handleDragEnterEvent} onDragLeave={handleDragLeaveEvent} onDrop={handleDropEvent}>
                <section className="text-center w-fit select-none">
                    <div className="w-fit mx-auto">
                        <div className="w-fit mx-auto max-sm:scale-90"><Logo width={288} height={56} className="dark:fill-white" /></div>
                        <strong className="block font-medium text-slate-400 mt-4 max-sm:text-sm dark:text-zinc-400">The no-frills file sharing service</strong>
                    </div>

                    <div className="w-fit mx-auto text-center mt-16">
                        {loading ? <>
                            <strong className="block text-center text-xl font-semibold mb-3">{Math.round(progress)}&#37;</strong>
                            <progress className="appearance-none w-125 h-3 border-none rounded-full duration-150" max={100} value={Math.round(progress)}></progress>
                        </> : <h1 className={`text-3xl font-medium${error.length ? " text-red-500" : id ? " text-emerald-500 cursor-pointer" : dragging ? " text-slate-500" : ""} max-sm:text-2xl`} onClick={copyUploadURL}>{
                            error.length ? error : 
                            id ? `${document.location.href}uploads/${id}` :
                            `${dragging ? "Drop" : "Drag or paste"} files ${dragging ? "onto" : "over"} this page to upload`
                        }</h1>}

                        {!loading && <div className="w-fit mx-auto mt-5">
                            <Button classes="inline-block align-middle" onClick={() => id || error.length ? resetUploader() : uploader?.current?.click()}>{id || error.length ? "Upload More" : "Browse Files"}</Button>
                            <Button classes="inline-block align-middle ml-2" transparent={true} onClick={() => setHistoryVisibility(true)}><FontAwesomeIcon icon={faClockRotateLeft} /> View Upload History</Button>
                        </div>}

                        {!loading && !id && <div className="w-fit mx-auto mt-5 text-blue-500 text-center">
                            <FontAwesomeIcon icon={faInfoCircle} className="inline-block align-middle text-lg leading-none" />
                            <span className="inline-block align-middle text-xs leading-none font-semibold ml-2">2GB Upload Limit</span>
                        </div>}
                    </div>
                </section>

                <input type="file" className="hidden" ref={uploader} onInput={(e: any) => setFile(e.target.files[0])} />
            </main>
            {historyIsVisible && <UploadHistory onClose={() => setHistoryVisibility(false)} />}
        </>
    );
}