"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChain, faCheck, faCircleNotch, faCode, faDownload, faFile, faFilePdf, faFileZipper, faImage, faListCheck, faMusic, faPenToSquare, faTrashAlt, faVideo, faXmark } from "@fortawesome/free-solid-svg-icons";

import Popup from "@/app/components/common/Popup";
import Field from "@/app/components/common/Field";
import { formatBytes } from "@/lib/utils";

interface Properties {
    onClose: () => void;
}

export default function UploadHistory({ onClose }: Properties) {
    const [uploads, setUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selecting, setSelecting] = useState(false);
    const [selectedUploads, setSelectedUploads] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<string>("");

    const [search, setSearch] = useState<string>("");

    useEffect(() => {
        setLoading(true);
        setError("");

        (async () => {
            const response = await fetch(`/api/history?search=${search}`);
            const json = await response.json();

            setUploads(json.history ?? []);
            setLoading(false);

            if (response.ok) return;

            setError((response.status == 401) ? "Sign in to view your upload history" : json.error);
        })();
    }, [search]);

    function resetSelection() {
        setSelecting(false);
        setSelectedUploads([]);
    }

    function updateSelection(e: any, id: string) {
        setSelectedUploads(e.target.checked ? [...selectedUploads, id] : selectedUploads.filter(existing => existing != id));
    }

    async function deleteUploads() {
        setFeedback("");

        const response = await fetch("/api/history", {
            method: "DELETE",
            body: new URLSearchParams({ uploads: JSON.stringify(selectedUploads) })
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
            setFeedback("Something went wrong");
            return;
        }

        setSelectedUploads([]);
    }

    return (
        <Popup title="Upload History" onClose={onClose} classes="w-125 max-[532px]:w-15/16">
            <div className="sticky top-0 z-10 bg-white dark:bg-zinc-800 pt-1 pb-2">
                <div className="w-full flex items-center justify-between">
                    <Field type="text" placeholder="Search" onInput={(e: any) => setSearch(e.target.value)} />

                    {
                        selecting ? <div className="flex items-center gap-1">
                            <div className="text-xs font-medium text-slate-400/75 mr-1.5 select-none dark:text-zinc-400">{selectedUploads.length} Selected</div>
                            <div className="leading-none text-slate-400/75 p-1.5 rounded-md aspect-square cursor-pointer duration-150 hover:bg-slate-100 active:bg-slate-200 dark:text-zinc-500 dark:hover:text-zinc-400 dark:active:text-zinc-500 dark:hover:bg-zinc-700 dark:active:bg-zinc-700/80" title="Delete Selected" onClick={deleteUploads}><FontAwesomeIcon icon={faTrashAlt} /></div>
                            <div className="leading-none text-slate-400/75 p-1.5 rounded-md aspect-square cursor-pointer duration-150 hover:bg-slate-100 active:bg-slate-200 dark:text-zinc-500 dark:hover:text-zinc-400 dark:active:text-zinc-500 dark:hover:bg-zinc-700 dark:active:bg-zinc-700/80" title="Cancel" onClick={resetSelection}><FontAwesomeIcon icon={faXmark} /></div>
                        </div> : <div className="leading-none cursor-pointer text-slate-400/75 text-lg hover:text-slate-500 active:text-slate-600 duration-150 dark:text-zinc-500 dark:hover:text-zinc-400 dark:active:text-zinc-500" title="Bulk Select" onClick={() => setSelecting(!selecting)}><FontAwesomeIcon icon={faListCheck} /></div>
                    }
                </div>

                {(feedback.length > 0) && <div className="p-1.5 leading-none text-xs font-medium text-center bg-red-400 text-white rounded-md mt-2">{feedback}</div>}
            </div>

            <div className="h-150">{
                error.length ? <div className="w-full min-h-72 grid place-items-center select-none text-red-500 leading-none">{error}</div> 
                : loading ? <div className="w-full min-h-72 grid place-items-center select-none text-slate-400/60 leading-none text-2xl"><FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /></div> 
                : uploads.length ? <div className="w-full min-h-72">{uploads.map(upload => <Upload key={upload.upload_id} data={upload} bulkSelect={selecting} onSelect={updateSelection} />)}</div>
                : <div className="w-full min-h-72 grid place-items-center select-none text-slate-400 dark:text-zinc-500">You haven't uploaded anything yet</div>
            }</div>
        </Popup>
    );
}

function Upload({ data, bulkSelect, onSelect }: any) {
    const [feedback, setFeedback] = useState<string>("");

    const [uploadTitle, setUploadTitle] = useState<string>(data.title);
    const [editing, setEditing] = useState<boolean|null>(null);

    const [editLoading, setEditLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    const [hovering, setHovering] = useState<boolean>(false);

    const uploadRef = useRef<HTMLDivElement>(null);
    
    async function deleteUpload() {
        setFeedback("");
        setDeleteLoading(true);

        const response = await fetch("/api/history", {
            method: "DELETE",
            body: new URLSearchParams({ uploadid: data.upload_id })
        });

        const json = await response.json();

        setDeleteLoading(false);

        if (!response.ok || !json.success) {
            setFeedback("Something went wrong");
            return;
        }

        uploadRef?.current?.remove();
    }

    useEffect(() => {
        if (editing || editing == null) return;

        setFeedback("");
        setEditLoading(true);

        (async () => {
            const response = await fetch("/api/history", {
                method: "PATCH",
                body: new URLSearchParams({
                    uploadid: data.upload_id,
                    name: uploadTitle
                })
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                switch (response.status) {
                    case 401:
                        setFeedback("Sign in to change upload names");
                        break;
                    case 404:
                        setFeedback("Upload not found");
                        break;
                    default:
                        setFeedback("Something went wrong");
                        break;
                }
            }

            setEditLoading(false);
        })();
    }, [editing]);

    function getTypeIcon(type: string) {
        switch (true) {
            case type.includes("image"):
                return faImage;
            case type.includes("video"):
                return faVideo;
            case type.includes("audio"):
                return faMusic;
            case type.includes("text"):
                return faCode;
            case type == "application/zip":
                return faFileZipper;
            case type == "application/pdf":
                return faFilePdf;
            default:
                return faFile;
        }
    }

    function getTypeColor(type: string) {
        switch (type.split("/")[0]) {
            case "image":
                return "bg-emerald-100 text-emerald-400";
            case "video":
                return "bg-rose-100 text-rose-400";
            case "audio":
                return "bg-purple-100 text-purple-400";
            case "text":
                return "bg-orange-100 text-orange-400";
            case "application":
                return "bg-amber-100 text-amber-400";
            default:
                return "bg-indigo-100 text-indigo-400";
        }
    }

    return (
        <div className="group mb-1.5" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            <AnimatePresence>
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex justify-between items-center p-2 rounded-md bg-slate-50 relative overflow-hidden dark:bg-zinc-700/60"
                    ref={uploadRef}
                >
                    {feedback.length ? <div className="absolute bottom-0 left-0 right-0 text-center text-xs font-medium p-1 bg-red-300/25 text-red-500">{feedback}</div> : null}
                    <div>
                        <div className={`inline-grid place-items-center align-middle w-9.5 h-9.5 aspect-square mr-2.5 rounded ${data.types.length == 1 ? getTypeColor(data.types[0]) : "bg-pink-100 text-pink-400"} max-sm:hidden`}><FontAwesomeIcon icon={data.types.length == 1 ? getTypeIcon(data.types[0]) : faFileZipper} /></div>

                        <div className="inline-block align-middle">
                            <strong className="flex items-center gap-1 text-sm" title={uploadTitle}>
                                {editing ? <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} onBlur={() => setEditing(false)} className="font-bold text-slate-500 bg-transparent outline-hidden" autoFocus /> : <div className="font-bold text-slate-500 dark:text-white dark:font-semibold">{uploadTitle.length > 22 ? uploadTitle.slice(0, 22) + "..." : uploadTitle}</div>}

                                <div className={`ml-1 ${editing ? "text-emerald-400" : "text-slate-400/75 dark:text-zinc-500"} cursor-pointer duration-150 ${editing ? "hover:text-emerald-500 active:text-emerald-600" : "hover:text-slate-400 active:text-slate-500"}`} title="Edit Name" onClick={() => setEditing(!editing)}>
                                    {editLoading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin opacity-65" /> : editing ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faPenToSquare} />}
                                </div>
                            </strong>
                            <div className="text-slate-400 text-xs font-semibold mt-0.5 select-none dark:text-zinc-400">{data.files} File{data.files > 1 ? "s" : ""} &middot; {formatBytes(data.size)}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <UploadOption icon={faChain} title="Copy URL" target="_blank" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/uploads/${data.upload_id}`)} />
                        <UploadOption icon={faDownload} title="Download" url={`/uploads/${data.upload_id}`} download={true} target="_blank" />
                        <UploadOption icon={faTrashAlt} title="Delete" onClick={deleteUpload} />
                        {bulkSelect && <input type="checkbox" className="w-4 h-4 ml-1 accent-indigo-500" onInput={(e: any) => onSelect(e, data.upload_id)} />}
                    </div>

                    {!data.available && <div className="absolute inset-0 bg-red-200/50 grid place-items-center text-red-500 text-base font-medium">No longer available</div>}
                </motion.div>
            </AnimatePresence>

            <motion.div 
                initial={{ height: 0 }}
                animate={{ height: hovering ? "auto" : 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-xs leading-none font-medium text-slate-400/75 mt-1 overflow-hidden dark:text-zinc-400"
            >
                {new Date(data.upload_date).toLocaleDateString()} {new Date(data.upload_date).toLocaleTimeString()}
            </motion.div>
        </div>
    ); 
}

function UploadOption({ icon, url, ...rest }: any) {
    const classList = "leading-none text-slate-400/75 p-1.5 rounded-md aspect-square cursor-pointer inline-grid place-items-center duration-150 hover:bg-slate-200/60 active:bg-slate-200 dark:text-zinc-500 dark:hover:text-zinc-400 dark:active:text-zinc-500 dark:hover:bg-zinc-700 dark:active:bg-zinc-700/80";
    return url?.length ? <Link href={url} className={classList} {...rest}><FontAwesomeIcon icon={icon} /></Link> : <div className={classList} {...rest}><FontAwesomeIcon icon={icon} /></div>;
}