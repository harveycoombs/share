"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faDownload, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import Popup from "@/app/components/common/popup";
import { formatBytes } from "@/data/utils";

interface Properties {
    onClose: () => void;
}

export default function UploadHistory({ onClose }: Properties) {
    const [uploads, setUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");

        (async () => {
            const response = await fetch("/api/history");
            const json = await response.json();

            setUploads(json.history ?? []);
            setLoading(false);

            if (response.ok) return;

            setError((response.status == 401) ? "Sign in to view your upload history" : json.error);
        })();
    }, []);

    return (
        <Popup title="Upload History" onClose={onClose}>{
            error.length ? <div className="w-500 min-h-72 grid place-items-center select-none text-red-500 leading-none">{error}</div> 
            : loading ? <div className="w-500 min-h-72 grid place-items-center select-none text-slate-400/60 leading-none text-2xl"><FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /></div> 
            : uploads.length ? <div className="w-500 min-h-72">{uploads.map(upload => <Upload key={upload.upload_id} data={upload} />)}</div>
            : <div className="w-500 min-h-72 grid place-items-center select-none text-slate-400">You haven't uploaded anything yet</div>
        }</Popup>
    );
}

export function Upload({ data }: any) {
    function deleteUpload() {
        // to-do
        
    }

    return (
        <AnimatePresence>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: "easeOut" }} className={`flex justify-between items-center p-2 rounded-md bg-slate-50 relative overflow-hidden ${data.available ? "pointer-events-none select-none" : ""}`}>
                <div>
                    <strong className="block text-sm font-bold text-slate-500">{data.name}</strong>
                    <div className="text-slate-400 text-xs font-semibold mt-0.5 select-none">{data.files} File{data.files > 1 ? "s" : ""} &middot; {formatBytes(data.size)}</div>
                </div>

                <div>
                    <UploadOption icon={faDownload} title="Download" url={`/uploads/${data.name}`} download={true} target="_blank" />
                    <UploadOption icon={faTrashAlt} title="Delete" onClick={deleteUpload} />
                </div>

                {data.available && <div className="absolute inset-0 bg-red-200/50 grid place-items-center text-red-500 text-base font-medium">No longer available</div>}
            </motion.div>
        </AnimatePresence>
    ); 
}

function UploadOption({ icon, url, ...rest }: any) {
    const classList = "inline-block align-middle leading-none ml-1 text-slate-400/75 p-1.5 rounded-md aspect-square cursor-pointer duration-150 hover:bg-slate-200/60 active:bg-slate-200";
    return url?.length ? <Link href={url} className={classList} {...rest}><FontAwesomeIcon icon={icon} /></Link> : <div className={classList} {...rest}><FontAwesomeIcon icon={icon} /></div>;
}