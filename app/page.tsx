"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faExternalLinkAlt, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

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
            <main className="min-h-[calc(100vh-122px)] grid place-items-center" onDragOver={handleDragOverEvent} onDragEnter={handleDragEnterEvent} onDragLeave={handleDragLeaveEvent} onDrop={handleDropEvent}>
                <section className="text-center w-fit select-none">
                    <div className="w-fit mx-auto">
                        <div className="w-fit mx-auto max-sm:scale-90"><Logo width={288} height={56} /></div>
                        <strong className="block font-medium text-slate-400 mt-4 max-sm:text-sm">The no-frills file sharing service</strong>
                    </div>

                    <div className="w-fit mx-auto text-center mt-16">
                        {loading ? <>
                            <strong className="block text-center text-xl font-semibold mb-3">{Math.round(progress)}&#37;</strong>
                            <progress className="appearance-none w-500 h-3 border-none rounded-full duration-150" max={100} value={Math.round(progress)}></progress>
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

                    <div className="invisible w-500 mx-auto mt-16 flex gap-2.5 p-2.5 rounded-lg bg-slate-100 text-slate-400 max-[532px]:w-full max-[532px]:mx-4">
                        <Image src="/images/collate-icon.png" alt="Collate AI" width={75} height={75} className="block rounded-sm shrink-0 aspect-square pointer-events-none" />

                        <div className="text-left">
                            <Link href="https://collate.run/" target="_blank" rel="noopener" className="block text-sm font-semibold text-slate-500 mb-1.5 hover:underline"><FontAwesomeIcon icon={faExternalLinkAlt} /> Collate: Find &amp; summarise anything on the web with AI</Link>
                            <p className="text-[0.8rem] font-medium pointer-events-none">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Optio tempore maxime facere est recusandae.</p>
                        </div>
                    </div>
                </section>

                <input type="file" className="hidden" ref={uploader} onInput={(e: any) => setFile(e.target.files[0])} />
            </main>
            {historyIsVisible && <UploadHistory onClose={() => setHistoryVisibility(false)} />}
        </>
    );
}