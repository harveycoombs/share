"use client";
import { useState, useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";

import Button from "@/app/components/ui/button";

export default function Home() {
    let uploader = useRef<HTMLInputElement>(null);

    let progressBar = useRef<HTMLProgressElement>(null);
    let percentageLabel = useRef<HTMLHeadingElement>(null);
    let headingRef = useRef<HTMLHeadingElement>(null);
    
    let [heading, setHeading] = useState<React.JSX.Element|null>(<h1 className="text-6xl font-semibold duration-150 pointer-events-none select-none" ref={headingRef}>Drop Files onto this Page</h1>);
    let [subheading, setSubheading] = useState<React.JSX.Element|null>(<h2 className="text-xl font-semibold my-8 pointer-events-none select-none">Share is a no-frills file sharing service designed to be as convenient as possible</h2>);

    let [buttonsAreVisible, setButtonsVisibility] = useState<boolean>(true);
    let [resetButtonIsVisible, setResetButtonVisibility] = useState<boolean>(false);

    async function copyUploadURL() {
        if (!headingRef?.current) return;

        let url = headingRef.current.innerText;

        await navigator.clipboard.writeText(url.toLowerCase());
        headingRef.current.innerText = "COPIED!";

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
            percentageLabel.current.innerHTML = `${Math.round(progress)}&percnt; COMPLETE`;
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
            setHeading(<h1 className="text-6xl font-semibold duration-150 text-amber-400 pointer-events-none select-none">Please upload at least 1 file to continue</h1>);
            setSubheading(null);
            return;
        }

        setHeading(<h1 className="text-6xl font-semibold pointer-events-none select-none" ref={percentageLabel}>0&#37; Uploaded</h1>);
        setSubheading(<progress className="appearance-none w-96 h-3 mt-8 bg-slate-200 border-none rounded duration-150" max="100" value="0" ref={progressBar}></progress>);

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
                    setHeading(<h1 className="text-6xl font-semibold text-emerald-400 duration-150 cursor-pointer select-none" onClick={copyUploadURL} ref={headingRef}>{document.location.href}uploads/{e.target.response.id.toString()}</h1>);
                    setSubheading(<h2 className="block text-center text-xl font-semibold text-emerald-200 pointer-events-none select-none my-8">Click the URL above to copy to clipboard</h2>);
                    break;
                case 400:
                    setHeading(<h1 className="text-6xl font-semibold text-amber-400 duration-150 pointer-events-none select-none mb-8">Please upload at least 1 file to continue</h1>);
                    break;
                case 413:
                    let multiple = (files.length > 1);
                    setHeading(<h1 className="text-6xl font-semibold text-red-500 duration-150 pointer-events-none">Uploaded{multiple ? "s" : ""} {multiple ? "were" : "was"} too large</h1>);
                    setSubheading(<h2 className="block text-center text-xl font-semibold text-red-300 pointer-events-none select-none my-8">The maximum upload size is 5 GB</h2>);
                    break;
                default:
                    setHeading(<h1 className="text-6xl font-semibold text-red-500 duration-150 pointer-events-none select-none">An unexpected server error occured</h1>);
                    setSubheading(<h2 className="block text-center text-xl font-semibold text-red-300 pointer-events-none select-none my-8">Please try again later</h2>);
                    break;
            }
        });

        request.send(data);
    }

    function reset() {
        setHeading(<h1 className="text-6xl font-semibold duration-150 pointer-events-none select-none" ref={headingRef}>Drop Files onto this Page</h1>);
        setSubheading(<h2 className="text-xl font-semibold my-8 pointer-events-none select-none">Share is a no-frills file sharing service designed to be as convenient as possible</h2>);

        setButtonsVisibility(true);
        setResetButtonVisibility(false);
    }

    return (
        <main className="grid place-items-center h-screen" onDragOver={handleDragOverEvent} onDragEnter={handleDragEnterEvent} onDragLeave={handleDragLeaveEvent} onDrop={handleDropEvent}>
            <section className="text-center">
                {heading}
                {subheading}
                {buttonsAreVisible ? <div className="w-fit mx-auto">
                    <Button large={true} classes="mr-2" onClick={() => uploader?.current?.click()}>Browse Files</Button>
                    <Button large={true} transparent={true}><FontAwesomeIcon icon={faHistory} /> View Upload History</Button>
                </div> : null}
                {resetButtonIsVisible ? <Button large={true} onClick={reset}>Upload More</Button> : null}
            </section>
            <input type="file" ref={uploader} onChange={handleUpload} className="hidden" multiple />
        </main>
    );
}