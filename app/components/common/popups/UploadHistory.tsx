"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChain, faCheck, faCircleNotch, faCode, faDownload, faEye, faFile, faFilePdf, faFileZipper, faImage, faListCheck, faMusic, faPenToSquare, faTrashAlt, faVideo, faXmark } from "@fortawesome/free-solid-svg-icons";

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
            <div className="sticky top-0 z-10 bg-white pt-1 pb-2">
                <div className="w-full flex items-center justify-between">
                    <Field type="text" placeholder="Search" onInput={(e: any) => setSearch(e.target.value)} />

                    {
                        selecting ? <div className="flex items-center gap-1">
                            <div className="text-xs font-medium text-slate-400/75 mr-1.5 select-none">{selectedUploads.length} Selected</div>
                            <div className="leading-none text-slate-400/75 p-1.5 rounded-md aspect-square cursor-pointer duration-150 hover:bg-slate-100 active:bg-slate-200" title="Delete Selected" onClick={deleteUploads}><FontAwesomeIcon icon={faTrashAlt} /></div>
                            <div className="leading-none text-slate-400/75 p-1.5 rounded-md aspect-square cursor-pointer duration-150 hover:bg-slate-100 active:bg-slate-200" title="Cancel" onClick={resetSelection}><FontAwesomeIcon icon={faXmark} /></div>
                        </div> : <div className="leading-none cursor-pointer text-slate-400/75 text-lg hover:text-slate-500 active:text-slate-600 duration-150" title="Bulk Select" onClick={() => setSelecting(!selecting)}><FontAwesomeIcon icon={faListCheck} /></div>
                    }
                </div>

                {(feedback.length > 0) && <div className="p-1.5 leading-none text-xs font-medium text-center bg-red-400 text-white rounded-md mt-2">{feedback}</div>}
            </div>

            <div className="h-150">{
                error.length ? <div className="w-full min-h-72 grid place-items-center select-none text-red-500 leading-none">{error}</div> 
                : loading ? <div className="w-full min-h-72 grid place-items-center select-none text-slate-400/60 leading-none text-2xl"><FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /></div> 
                : uploads.length ? <div className="w-full min-h-72">{uploads.map(upload => <Upload key={upload.upload_id} data={upload} bulkSelect={selecting} onSelect={updateSelection} />)}</div>
                : <div className="w-full min-h-72 grid place-items-center select-none text-slate-400">You haven't uploaded anything yet</div>
            }</div>
        </Popup>
    );
}

function getTypeIcon(type: string) {
    if (type == "application/zip") return faFileZipper;

    switch (type.split("/")[0]) {
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

function getTypeColors(type: string) {
    if (type == "application/zip") return { text: "text-pink-400", background: "from-pink-50/75 to-pink-100/75", border: "border-pink-300/75" };

    switch (type.split("/")[0]) {
        case "image":
            return { text: "text-emerald-600", icon: "text-emerald-500", background: "from-emerald-50/75 to-emerald-100/75", border: "border-emerald-300/75" };
        case "video":
            return { text: "text-rose-600", icon: "text-rose-500", background: "from-rose-50/75 to-rose-100/75", border: "border-rose-300/75" };
        case "audio":
            return { text: "text-purple-600", icon: "text-purple-500", background: "from-purple-50/75 to-purple-100/75", border: "border-purple-300/75" };
        case "text":
            return { text: "text-orange-600", icon: "text-orange-500", background: "from-orange-50/75 to-orange-100/75", border: "border-orange-300/75" };
        case "application":
            return { text: "text-amber-600", icon: "text-amber-500", background: "from-amber-50/75 to-amber-100/75", border: "border-amber-300/75" };
        default:
            return { text: "text-indigo-600", icon: "text-indigo-500", background: "from-indigo-50/75 to-indigo-100/75", border: "border-indigo-300/75" };
    }
}

function Upload({ data, bulkSelect, onSelect }: any) {
    const [feedback, setFeedback] = useState<string>("");

    const [uploadTitle, setUploadTitle] = useState<string>(data.title);
    const [editing, setEditing] = useState<boolean|null>(null);

    const [editLoading, setEditLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

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

        uploadRef?.current?.nextElementSibling?.remove();
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

    const type = data.types.length > 1 ? "application/zip" : data.types[0];

    const colors = getTypeColors(type);

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex justify-between items-center p-2 rounded-lg border ${colors.border} bg-gradient-to-b ${colors.background} ${colors.text} relative overflow-hidden`}
                ref={uploadRef}
            >
                {feedback.length ? <div className="absolute bottom-0 left-0 right-0 text-center text-xs font-medium p-1 bg-red-300/25 text-red-500">{feedback}</div> : null}
                <div>
                    <div className={`inline-grid place-items-center align-middle w-9.5 h-9.5 aspect-square mr-2.5 rounded-xl bg-white ${colors.icon} border ${colors.border} max-sm:hidden`}><FontAwesomeIcon icon={getTypeIcon(type)} /></div>

                    <div className="inline-block align-middle">
                        <strong className="flex items-center gap-1 text-sm" title={uploadTitle}>
                            {editing ? <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} onBlur={() => setEditing(false)} className="font-semibold bg-transparent outline-hidden" autoFocus /> : <div className="font-semibold">{uploadTitle.length > 22 ? uploadTitle.slice(0, 22) + "..." : uploadTitle}</div>}

                            <div className={`ml-1 cursor-pointer duration-150 ${colors.icon}`} title="Edit Name" onClick={() => setEditing(!editing)}>
                                {editLoading ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin opacity-65" /> : editing ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faPenToSquare} />}
                            </div>
                        </strong>

                        <div className={`text-xs font-medium ${colors.text} opacity-65 mt-0.5 select-none`}>{data.files} File{data.files > 1 ? "s" : ""} &middot; {formatBytes(data.size)}</div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <UploadOption icon={faChain} classes={colors.icon} title="Copy URL" target="_blank" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/uploads/${data.upload_id}`)} />
                    <UploadOption icon={faTrashAlt} classes={colors.icon} title="Delete" onClick={deleteUpload} loading={deleteLoading} />
                    {bulkSelect && <input type="checkbox" className="w-4 h-4 ml-1 accent-indigo-500" onInput={(e: any) => onSelect(e, data.upload_id)} />}
                </div>

                {!data.available && <div className="absolute inset-0 bg-red-200/50 grid place-items-center text-red-500 text-base font-medium">No longer available</div>}
            </motion.div>
        </AnimatePresence>
    ); 
}

function UploadOption({ icon, url, loading, classes = "", ...rest }: any) {
    const classList = `leading-none p-1.5 rounded-md aspect-square cursor-pointer inline-grid place-items-center duration-150${loading ? " pointer-events-none" : ""} hover:bg-slate-200/60 active:bg-slate-200 ${classes?.length ? " " + classes : ""}`;
    return url?.length ? <Link href={url} className={classList} {...rest}><FontAwesomeIcon icon={loading ? faCircleNotch : icon} className={loading ? "animate-spin" : ""} /></Link> : <div className={classList} {...rest}><FontAwesomeIcon icon={loading ? faCircleNotch : icon} className={loading ? "animate-spin" : ""} /></div>;
}