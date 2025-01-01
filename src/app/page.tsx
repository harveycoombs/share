"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faExternalLinkAlt, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import Logo from "@/app/components/common/logo";
import Button from "@/app/components/common/button";
import Link from "next/link";

export default function Home() {
    let [file, setFile] = useState<File|null>(null);
    let [id, setID] = useState<number>(0);
    let [loading, setLoading] = useState<boolean>(false);
    let [error, setError] = useState<string>("");
    let [progress, setProgress] = useState<number>(0);

    let uploader = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!file) return;

        setLoading(true);

        let data = new FormData();
        data.append("files", file);

        let request = new XMLHttpRequest();

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

    return (
        <main className="min-h-[calc(100vh-116px)] grid place-items-center">
            <section className="text-center w-fit select-none">
                <div className="w-fit mx-auto">
                    <div className="w-fit mx-auto"><Logo width={288} height={56} /></div>
                    <strong className="block font-medium text-slate-400 mt-4">The no-frills file sharing service</strong>
                </div>

                <div className="w-fit mx-auto text-center mt-16">
                    {loading ? <>
                        <strong>{progress}&#37;</strong>
                        <progress className="appearance-none w-500 h-3 border-none rounded duration-150" max={100} value={progress}></progress>
                    </> : <h1 className="text-3xl font-medium">{
                        error.length ? error : 
                        id ? `${document.location.href}uploads/${id}` :
                        "Drop files onto this page to upload"
                    }</h1>}

                    {!loading && <div className="w-fit mx-auto mt-5">
                        <Button classes="inline-block align-middle" onClick={() => uploader?.current?.click()}>Browse Files</Button>
                        <Button classes="inline-block align-middle ml-2" transparent={true}><FontAwesomeIcon icon={faClockRotateLeft} /> View Upload History</Button>
                    </div>}

                    {!loading && <div className="w-fit mx-auto mt-5 text-blue-500 text-center">
                        <FontAwesomeIcon icon={faInfoCircle} className="inline-block align-middle text-lg leading-none" />
                        <span className="inline-block align-middle text-xs leading-none font-semibold ml-2">2GB Upload Limit</span>
                    </div>}
                </div>

                <div className="w-500 mx-auto mt-16 flex gap-2.5 p-2.5 rounded-lg bg-slate-100 text-slate-400">
                    <Image src="/images/collate-icon.png" alt="Collate AI" width={75} height={75} className="block rounded shrink-0 aspect-square pointer-events-none" />

                    <div className="text-left">
                        <Link href="https://collate.run/" target="_blank" rel="noopener" className="block text-sm font-semibold text-slate-500 mb-1.5 hover:underline"><FontAwesomeIcon icon={faExternalLinkAlt} /> Collate: Find &amp; summarise anything on the web with AI</Link>
                        <p className="text-[0.8rem] font-medium pointer-events-none">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Optio tempore maxime facere est recusandae.</p>
                    </div>
                </div>
            </section>

            <input type="file" className="hidden" ref={uploader} onInput={(e: any) => setFile(e.target.files[0])} />
        </main>
    );
}