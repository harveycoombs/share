"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChain, faCheck, faCircleNotch, faCode, faFile, faFilePdf, faFileZipper, faImage, faListCheck, faMusic, faPenToSquare, faTrashAlt, faVideo, faXmark } from "@fortawesome/free-solid-svg-icons";

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
            const response = await fetch(`/api/uploads?search=${search}`);
            const json = await response.json();

            setUploads(json.uploads ?? []);
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

        const response = await fetch("/api/uploads", {
            method: "DELETE",
            body: JSON.stringify({ uploads: JSON.stringify(selectedUploads) })
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
            setFeedback("Something went wrong");
            return;
        }

        setSelectedUploads([]);
    }

    return (
        <Popup title="Upload History" onClose={onClose} classes="w-125 max-sm:w-15/16">
            <div className="sticky top-0 z-10 bg-white pt-1 pb-2.5">
                <div className="w-full flex items-center justify-between">
                    <Field type="text" placeholder="Search" onInput={(e: any) => setSearch(e.target.value)} />

                    {selecting ? (
                        <div className="flex items-center gap-1">
                            <div className="text-xs font-medium text-slate-400/75 mr-1.5 select-none">{selectedUploads.length} Selected</div>
                            <div className="leading-none text-slate-400/75 p-1.5 rounded-md aspect-square cursor-pointer duration-150 hover:bg-slate-100 active:bg-slate-200" title="Delete Selected" onClick={deleteUploads}><FontAwesomeIcon icon={faTrashAlt} /></div>
                            <div className="leading-none text-slate-400/75 p-1.5 rounded-md aspect-square cursor-pointer duration-150 hover:bg-slate-100 active:bg-slate-200" title="Cancel" onClick={resetSelection}><FontAwesomeIcon icon={faXmark} /></div>
                        </div>
                    ) : <div className="leading-none cursor-pointer text-slate-400/75 text-lg hover:text-slate-500 active:text-slate-600 duration-150" title="Bulk Select" onClick={() => setSelecting(!selecting)}><FontAwesomeIcon icon={faListCheck} /></div>}
                </div>

                {feedback.length > 0 && <div className="p-1.5 leading-none text-xs font-medium text-center bg-red-400 text-white rounded-md mt-2">{feedback}</div>}
            </div>

            <div className="h-150">{
                error.length ? <div className="w-full h-full pb-16 grid place-items-center select-none text-red-500 leading-none">{error}</div> 
                : loading ? <div className="w-full h-full pb-16 grid place-items-center select-none text-slate-400/60 leading-none text-2xl"><FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /></div> 
                : uploads.length ? <div className="w-full h-full">{uploads.map((upload: any, index: number) => <Upload key={upload.upload_id} index={index} data={upload} bulkSelect={selecting} onSelect={updateSelection} />)}</div>
                : <div className="w-full h-full pb-16 grid place-items-center select-none text-slate-400">You haven't uploaded anything yet</div>
            }</div>
        </Popup>
    );
}

function getTypeIcon(contentType: string) {
    if (contentType == "application/zip") return faFileZipper;

    switch (contentType.split("/")[0]) {
        case "image":
            return faImage;
        case "video":
            return faVideo;
        case "audio":
            return faMusic;
        case "text":
            return faCode;
        case "application":
            return faFilePdf;
        default:
            return faFile;
    }
}

function getTypeColors(contentType: string) {
    if (contentType == "application/zip") return { icon: "text-pink-400", background: "from-pink-50/70 to-pink-100/70", border: "border-pink-300/75" };

    switch (contentType.split("/")[0]) {
        case "image":
            return { icon: "text-emerald-400", background: "from-emerald-50/70 to-emerald-100/70", border: "border-emerald-300/65" };
        case "video":
            return { icon: "text-rose-400", background: "from-rose-50/70 to-rose-100/70", border: "border-rose-300/65" };
        case "audio":
            return { icon: "text-purple-400", background: "from-purple-50/70 to-purple-100/70", border: "border-purple-300/65" };
        case "text":
            return { icon: "text-orange-400", background: "from-orange-50/70 to-orange-100/70", border: "border-orange-300/65" };
        case "application":
            return { icon: "text-amber-400", background: "from-amber-50/70 to-amber-100/70", border: "border-amber-300/65" };
        default:
            return { icon: "text-indigo-400", background: "from-indigo-50/70 to-indigo-100/70", border: "border-indigo-300/65" };
    }
}

function Upload({ index, data, bulkSelect, onSelect }: any) {
    const [feedback, setFeedback] = useState<string>("");

    const [uploadTitle, setUploadTitle] = useState<string>(data.title);
    const [editing, setEditing] = useState<boolean|null>(null);

    const [editLoading, setEditLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    const [deletionIntent, setDeletionIntent] = useState<boolean>(false);

    const uploadRef = useRef<HTMLDivElement>(null);
    
    async function deleteUpload() {
        if (!deletionIntent) {
            setDeletionIntent(true);
            return;
        }

        setFeedback("");
        setDeleteLoading(true);

        const response = await fetch("/api/uploads", {
            method: "DELETE", 
            body: JSON.stringify({ uploadid: data.upload_id })
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
            const response = await fetch("/api/uploads", {
                method: "PATCH",
                body: JSON.stringify({
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

    const type = useMemo(() => data.content_type ?? "application/octet-stream", [data.content_type]);
    const colors = useMemo(() => getTypeColors(type), [type]);

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.05 }}
                className={`flex justify-between items-center p-2 rounded-lg border border-slate-300/70 bg-linear-to-t from-slate-100 to-slate-50/50 text-slate-600 relative overflow-hidden ${index ? "mt-2.5" : ""}`}
                ref={uploadRef}
            >
                {(feedback.length > 0) && <div className="absolute bottom-0 left-0 right-0 text-center text-xs font-medium p-1 bg-red-300/25 text-red-500">{feedback}</div>}
                <div>
                    <div className={`inline-grid place-items-center align-middle w-9.5 h-9.5 aspect-square mr-2.5 rounded-md border ${colors.border} bg-linear-to-b ${colors.background} ${colors.icon} max-sm:hidden`}><FontAwesomeIcon icon={getTypeIcon(type)} /></div>

                    <div className="inline-block align-middle">
                        <strong className="flex items-center gap-1 text-sm" title={uploadTitle}>
                            {editing ? <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} onBlur={() => setEditing(false)} className="font-semibold bg-transparent outline-hidden" autoFocus /> : <div className="font-semibold">{uploadTitle.length > 22 ? uploadTitle.slice(0, 22) + "..." : uploadTitle}</div>}

                            <div className={`ml-1 cursor-pointer duration-150`} title="Edit Name" onClick={() => setEditing(!editing)}>
                                {editLoading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin opacity-65" /> : editing ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faPenToSquare} />}
                            </div>
                        </strong>

                        <div className={`text-xs font-medium text-slate-500 opacity-65 mt-0.5 select-none`}>{data.files} File{data.files > 1 ? "s" : ""} &middot; {formatBytes(data.size)} &middot; {new Date(data.upload_date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} &middot; {data.views} View{data.views != 1 ? "s" : ""}</div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <UploadOption icon={faChain} title="Copy URL" target="_blank" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/uploads/${data.upload_id}`)} />

                    <UploadOption icon={deletionIntent ? faCheck : faTrashAlt} title={deletionIntent ? "Confirm Deletion" : "Delete"} onClick={deleteUpload} loading={deleteLoading} />
                    {deletionIntent && !deleteLoading && <UploadOption icon={faXmark} title="Cancel Deletion" onClick={() => setDeletionIntent(false)} />}

                    {bulkSelect && <input type="checkbox" className="w-4 h-4 ml-1 accent-indigo-500" onInput={(e: any) => onSelect(e, data.upload_id)} />}
                </div>
            </motion.div>
        </AnimatePresence>
    ); 
}

function UploadOption({ icon, url = "", loading = false, ...rest }: any) {
    const classList = `leading-none p-1.25 rounded-md border border-transparent bg-transparent text-slate-400 aspect-square cursor-pointer inline-grid place-items-center duration-150 hover:bg-slate-200/70 hover:text-slate-500 active:scale-95 ${loading ? "pointer-events-none" : ""}`;

    return url.length ? (
        <Link href={url} className={classList} {...rest}>
            <FontAwesomeIcon icon={loading ? faCircleNotch : icon} className={loading ? "animate-spin" : ""} />
        </Link>
    ) : (
        <div className={classList} {...rest}>
            <FontAwesomeIcon icon={loading ? faCircleNotch : icon} className={loading ? "animate-spin" : ""} />
        </div>
    );
}