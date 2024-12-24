"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import Button from "@/app/components/common/button";
import Popup from "@/app/components/common/popup";

export default function Home() {
    let [files, setFiles] = useState<FileList|null>(null);

    let uploader = useRef<HTMLInputElement>(null);

    let progressBar = useRef<HTMLProgressElement>(null);
    let percentageLabel = useRef<HTMLHeadingElement>(null);
    let headingRef = useRef<HTMLHeadingElement>(null);
    
    let [heading, setHeading] = useState<React.JSX.Element|null>(<h1 className="text-6xl font-semibold duration-150 pointer-events-none select-none max-[800px]:text-5xl max-[800px]:px-4" ref={headingRef}>Drop Files onto this Page</h1>);
    let [subheading, setSubheading] = useState<React.JSX.Element|null>(<h2 className="text-xl font-semibold my-8 pointer-events-none select-none max-[800px]:text-base max-[800px]:px-4">Share is a no-frills file sharing service designed to be as convenient as possible</h2>);

    let [buttonsAreVisible, setButtonsVisibility] = useState<boolean>(true);
    let [resetButtonIsVisible, setResetButtonVisibility] = useState<boolean>(false);

    let [historyIsVisible, setHistoryVisibility] = useState(false);
    let [history, setHistory] = useState<React.JSX.Element[]>([]);

    async function copyUploadURL() {
        if (!headingRef?.current) return;

        let url = headingRef.current.innerText;

        await navigator.clipboard.writeText(url.toLowerCase());
        headingRef.current.innerText = "Copied to Clipboard";

        setTimeout(() => {
            if (headingRef?.current) {
                headingRef.current.innerText = url;
            }
        }, 1200);
    }

    function updateProgressBar(e: any) {
        if (!e.lengthComputable) return;
    
        let progress = (e.loaded / e.total) * 100;
    
        if (progressBar.current && percentageLabel.current) {
            progressBar.current.value = progress;
            progressBar.current.innerHTML = `${Math.round(progress)}&percnt;`;
            percentageLabel.current.innerHTML = `${Math.round(progress)}&percnt; Complete`;
        }
    }

    function handleDragOverEvent(e: any) {
        e.preventDefault();

        if (!headingRef?.current || uploader?.current?.files?.length) return;
        if (!headingRef.current.classList.contains("text-slate-500")) handleDragEnterEvent();
    }
    
    function handleDragEnterEvent() {
        if (!headingRef?.current || uploader?.current?.files?.length) return;

        headingRef.current.classList.add("text-slate-500");
        headingRef.current.classList.remove("text-slate-800");
    }
    
    function handleDragLeaveEvent() {
        if (!headingRef?.current || uploader?.current?.files?.length) return;

        headingRef.current.classList.add("text-slate-800");
        headingRef.current.classList.remove("text-slate-500");
    }

    function handleDropEvent(e: any) {
        e.preventDefault();

        if (uploader?.current?.files?.length) return;

        if (uploader?.current) {
            uploader.current.files = e.dataTransfer.files;
            uploader.current.dispatchEvent(new Event("change", { bubbles: true }));

            handleDragLeaveEvent();
        }
    }

    function handleUpload(e: any) {
        e.preventDefault();

        let uploads = e.target.files;

        if (!uploads?.length) {
            setHeading(<h1 className="text-6xl font-semibold duration-150 text-amber-400 pointer-events-none select-none max-[800px]:text-5xl max-[800px]:px-4">Please upload at least 1 file to continue</h1>);
            setSubheading(null);
            return;
        }

        setHeading(<h1 className="text-6xl font-semibold pointer-events-none select-none max-[800px]:text-5xl max-[800px]:px-4" ref={percentageLabel}>0&#37; Uploaded</h1>);
        setSubheading(<progress className="appearance-none w-96 h-3 mt-8 bg-slate-200 border-none rounded duration-150 max-[800px]:text-base max-[800px]:px-4" max="100" value="0" ref={progressBar}></progress>);

        setButtonsVisibility(false);

        upload(uploads);
    }

    function upload(files: any) {
        let data = new FormData();
        for (let file of files) data.append("files", file);

        let request = new XMLHttpRequest();

        request.open("POST", "/api/upload", true);
        request.responseType = "json";

        request.upload.addEventListener("progress", updateProgressBar);

        request.addEventListener("readystatechange", (e: any) => {
            if (e.target.readyState != 4) return;

            setResetButtonVisibility(true);

            switch (e.target.status) {
                case 200:
                    setHeading(<h1 className="text-6xl font-semibold text-emerald-400 duration-150 cursor-pointer select-none max-[800px]:text-5xl max-[800px]:px-4" onClick={copyUploadURL} ref={headingRef}>{document.location.href}uploads/{e.target.response.id.toString()}</h1>);
                    setSubheading(<h2 className="block text-center text-xl font-semibold text-emerald-200 pointer-events-none select-none my-8 max-[800px]:text-base max-[800px]:px-4">Click the URL above to copy to clipboard</h2>);
                    break;
                case 400:
                    setHeading(<h1 className="text-6xl font-semibold text-amber-400 duration-150 pointer-events-none select-none mb-8 max-[800px]:text-5xl max-[800px]:px-4">Please upload at least 1 file to continue</h1>);
                    break;
                case 413:
                    let multiple = (files.length > 1);
                    setHeading(<h1 className="text-6xl font-semibold text-red-500 duration-150 pointer-events-none max-[800px]:text-5xl max-[800px]:px-4">Uploaded{multiple ? "s" : ""} {multiple ? "were" : "was"} too large</h1>);
                    setSubheading(<h2 className="block text-center text-xl font-semibold text-red-300 pointer-events-none select-none my-8 max-[800px]:text-base max-[800px]:px-4">The maximum upload size is 5 GB</h2>);
                    break;
                default:
                    setHeading(<h1 className="text-6xl font-semibold text-red-500 duration-150 pointer-events-none select-none max-[800px]:text-5xl max-[800px]:px-4">An unexpected server error occured</h1>);
                    setSubheading(<h2 className="block text-center text-xl font-semibold text-red-300 pointer-events-none select-none my-8 max-[800px]:text-base max-[800px]:px-4">Please try again later</h2>);
                    break;
            }
        });

        request.send(data);
    }

    function reset() {
        setHeading(<h1 className="text-6xl font-semibold duration-150 pointer-events-none select-none max-[800px]:text-5xl max-[800px]:px-4" ref={headingRef}>Drop Files onto this Page</h1>);
        setSubheading(<h2 className="text-xl font-semibold my-8 pointer-events-none select-none max-[800px]:text-base max-[800px]:px-4">Share is a no-frills file sharing service designed to be as convenient as possible</h2>);

        setButtonsVisibility(true);
        setResetButtonVisibility(false);
    }

    function openHistory() {
        setHistoryVisibility(true);
        getHistory();
    }

    function formatBytes(bytes: number): string {
        switch (true) {
            case (bytes < 1024):
                return `${bytes} B`;
            case (bytes < 1024 * 1024):
                return `${(bytes / 1024).toFixed(2)} kB`;
            case (bytes < 1024 * 1024 * 1024):
                return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
            default:
                return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        }
    }

    async function getHistory() {
        let list: React.JSX.Element[] = [];
        
        try {
            let response = await fetch("/api/history");
            let records: any[] = await response.json();

            if (!records.length) {
                list.push(<div className="py-4 text-center font-medium text-sm text-slate-400 text-opacity-60 select-none dark:text-zinc-400">You don't have any upload history.</div>);
            }

            for (let record of records) {
                list.push(<div className="w-[600px] px-1.5 py-1 mt-1 rounded-md flex justify-between items-center bg-slate-200 bg-opacity-50 dark:bg-zinc-700">
                    <div>
                        <Link href={`/uploads/${record.id}`} target="_blank" className="text-slate-500 font-bold decoration-2 hover:underline dark:text-zinc-400">{record.id}</Link>
                        <div className="text-sm font-medium text-slate-400 dark:text-zinc-500">{new Date(record.id).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })} &middot; {record.files} Files &middot; {formatBytes(record.size)}</div>
                    </div><button className="w-7 h-7 rounded grid place-items-center mr-1 bg-slate-300/50 text-slate-400/70 duration-150 hover:bg-red-100 hover:text-red-400" onClick={() => deleteHistory(record.id)}><FontAwesomeIcon icon={faTrashAlt} /></button>
                </div>);
            }
        } catch (ex: any) {
            console.error(ex);
            list.push(<div className="w-[600px] py-4 text-center font-medium text-sm text-red-500 select-none">Unable to retrieve upload history.</div>);
        }

        setHistory(list);
    }

    async function deleteHistory(id: number) {
        try {
            let response = await fetch("/api/history", {
                method: "DELETE",
                body: new URLSearchParams({ id: id.toString() })
            });

            if (!response.ok) {
                alert("Unable to delete history. Please try again later.");
                return;
            }

            getHistory();
        } catch (ex: any) {
            console.error(ex);
        }
    }

    return (
        <>
            <main className="min-h-[calc(100vh-128px)] grid place-items-center" onDragOver={handleDragOverEvent} onDragEnter={handleDragEnterEvent} onDragLeave={handleDragLeaveEvent} onDrop={handleDropEvent}>
                <motion.div className="text-center" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
                    {heading}
                    {subheading}
                    {buttonsAreVisible ? <div className="w-fit mx-auto max-[310px]:w-full max-[310px]:px-4">
                        <Button large={true} classes="mr-2 max-[310px]:w-full max-[310px]:mr-0" onClick={() => uploader?.current?.click()}>Browse Files</Button>
                        <Button large={true} classes="max-[310px]:w-full" transparent={true} onClick={openHistory}><FontAwesomeIcon icon={faHistory} /> View Upload History</Button>
                    </div> : null}
                    {resetButtonIsVisible ? <Button large={true} onClick={reset}>Upload More</Button> : null}
                    <div className="text-sm text-slate-400/60 select-none font-medium mt-5">2GB Upload Limit</div>
                </motion.div>
                <input type="file" ref={uploader} onInput={(e: any) => setFiles(e.target.files)} onChange={handleUpload} className="hidden" multiple />
            </main>
            {historyIsVisible ? <Popup title="Upload History" onClose={() => setHistoryVisibility(false)}>{history}</Popup> : ""}
        </>
    );
}