"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faBug } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import Popup from "./ui/popup";
import Banner from "./ui/banner";

export default function Header() {
    let [historyIsVisible, setHistoryVisibility] = useState(false);
    let [history, setHistory] = useState<React.JSX.Element[]>([]);

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
                list.push(<div className="px-1.5 py-1 mt-1 rounded-md bg-slate-200 bg-opacity-50 dark:bg-zinc-700">
                    <Link href={`/uploads/${record.id}`} target="_blank" className="text-slate-500 font-bold decoration-2 hover:underline dark:text-zinc-400">{record.id}</Link>
                    <div className="text-sm font-medium text-slate-400 dark:text-zinc-500">{new Date(record.id).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })} &middot; {record.files} Files &middot; {formatBytes(record.size)}</div>
                </div>);
            }
        } catch (ex: any) {
            console.error(ex);
            list.push(<div className="py-4 text-center font-medium text-sm text-red-500 select-none">Unable to retrieve upload history.</div>);
        }

        setHistory(list);
    }

    return (
        <>
            <header className="absolute top-0 left-0 right-0">
                <Banner><span>&#127881; Share 3.2.0 is here. Check out whats changed by clicking <Link href="https://github.com/harveycoombs/share/releases/tag/3.2.0" target="_blank" className="hover:underline">here</Link>.</span></Banner>
                <div className="flex justify-between items-center p-4 max-[460px]:p-3">
                    <div className="text-sm font-bold pointer-events-none select-none max-lg:hidden">UPLOADS OLDER THAN 30 DAYS ARE DELETED &middot; 5GB MAXIMUM UPLOAD SIZE</div>
                    <nav>
                        <HeaderNavigationItem title="View Upload History" icon={faClockRotateLeft} click={openHistory} />
                        <HeaderNavigationItem url="https://github.com/harveycoombs/share/issues/new" title="Report an Issue" icon={faBug} />
                        <HeaderNavigationItem url="https://github.com/harveycoombs/share" title="View on GitHub" icon={faGithub} />
                    </nav>
                </div>
            </header>
            {historyIsVisible ? <Popup title="Upload History" close={() => setHistoryVisibility(false)}>{history}</Popup> : ""}
        </>
    );
}

function HeaderNavigationItem(props: any) {
    let classes = "inline-block align-middle text-xl ml-5 duration-150 cursor-pointer select-none hover:text-slate-400 active:text-slate-500 max-[460px]:ml-4 max-[460px]:text-lg";

    return (
        props.url?.length ? <Link href={props.url} target="_blank" className={classes} title={props.title} draggable="false"><FontAwesomeIcon icon={props.icon} /></Link> : <div className={classes} title={props.title} draggable="false" onClick={props.click}><FontAwesomeIcon icon={props.icon} /></div>
    );
}