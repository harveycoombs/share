"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faDownload, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import Popup from "@/app/components/common/popup";
import { formatBytes } from "@/data/utils";

interface Properties {
    onClose: () => void;
}

export default function UploadHistory({ onClose }: Properties) {
    let [uploads, setUploads] = useState<any[]>([]);
    let [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        (async () => {
            let response = await fetch("/api/history");
            let json = await response.json();

            setUploads(json.history ?? []);
            setLoading(false);
        })();
    }, []);

    return (
        <Popup title="Upload History" onClose={onClose}>{
            loading ? <div className="w-500 min-h-72 grid place-items-center select-none text-slate-400/60 leading-none text-2xl"><FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /></div> 
            : uploads.length ? <div className="w-500 min-h-72">{uploads.map(upload => <Upload key={upload.upload_id} data={upload} onClose={onClose} />)}</div> 
            : <div className="w-500 min-h-72 grid place-items-center select-none text-slate-400">You haven't uploaded anything yet</div>
        }</Popup>
    );
}

export function Upload({ data, onClose }: any) {
    function downloadUpload() {
        // to-do
        onClose();
    }

    function deleteUpload() {
        // to-do
        onClose();
    }

    return (
        <div className={`flex justify-between items-center p-2 rounded-md bg-slate-50 relative overflow-hidden ${data.available ? "pointer-events-none select-none" : ""}`}>
            <div>
                <strong className="block text-sm font-bold text-slate-500">{data.name}</strong>
                <div className="text-slate-400 text-xs font-semibold mt-0.5 select-none">{data.files} File{data.files > 1 ? "s" : ""} &middot; {formatBytes(data.size)}</div>
            </div>

            <div>
                <UploadOption icon={faDownload} title="Download" onClick={downloadUpload} />
                <UploadOption icon={faTrashAlt} title="Delete" onClick={deleteUpload} />
            </div>

            {data.available && <div className="absolute inset-0 bg-red-200/50 grid place-items-center text-red-500 text-base font-medium">No longer available</div>}
        </div>
    ); 
}

function UploadOption({ icon, ...rest }: any) {
    return <div className="inline-block align-middle leading-none ml-1 text-slate-400/75 p-1.5 rounded-md aspect-square cursor-pointer duration-150 hover:bg-slate-200/60 active:bg-slate-200" {...rest}><FontAwesomeIcon icon={icon} /></div>
}