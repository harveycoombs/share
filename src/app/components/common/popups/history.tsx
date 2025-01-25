"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleNotch, faDownload, faPenToSquare, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

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

function Upload({ data }: any) {
    const [uploadTitle, setUploadTitle] = useState<string>(data.title?.length ? data.title : data.name);
    const [editing, setEditing] = useState<boolean|null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    
    function deleteUpload() {
        // to-do
    }

    useEffect(() => {
        if (editing || editing == null) return;

        setError("");
        setLoading(true);

        (async () => {
            const response = await fetch("/api/history", {
                method: "PATCH",
                body: new URLSearchParams({
                    uploadid: data.upload_id,
                    name: uploadTitle
                })
            });

            if (!response.ok) {
                switch (response.status) {
                    case 401:
                        setError("Sign in to change upload names");
                        break;
                    case 404:
                        setError("Upload not found");
                        break;
                    default:
                        setError("Something went wrong");
                        break;
                }
            }

            setLoading(false);
        })();
    }, [editing]);

    return (
        <AnimatePresence>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: "easeOut" }} className={`flex justify-between items-center p-2 rounded-md bg-slate-50 relative overflow-hidden ${data.available ? "pointer-events-none select-none" : ""}`}>
                <div>
                    <strong className="flex items-center gap-1 text-sm">
                        {editing ? <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} onBlur={() => setEditing(false)} className="font-bold text-slate-500 bg-transparent outline-none" autoFocus /> : <div className="font-bold text-slate-500">{uploadTitle}</div>}
                        <div className={`ml-1 ${editing ? "text-emerald-400" : "text-slate-400/75"} cursor-pointer duration-150 ${editing ? "hover:text-emerald-500 active:text-emerald-600" : "hover:text-slate-400 active:text-slate-500"}`} title="Edit Name" onClick={() => setEditing(!editing)}>
                            {editing ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faPenToSquare} />}
                        </div>
                    </strong>
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