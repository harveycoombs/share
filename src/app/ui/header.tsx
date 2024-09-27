"use client";
import { useRef, useState } from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faBug } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import Popup from "./popup";
import Field from "./field";
import TextBox from "./textbox";
import Button from "./button";
import Banner from "./banner";

export default function Header() {
    let [historyIsVisible, setHistoryVisibility] = useState(false);
    let [history, setHistory] = useState<React.JSX.Element[]>([]);

    let [bugReportingFormIsVisible, setBugReportingFormVisibility] = useState(false);
    let [reportBugButton, setReportBugButton] = useState<React.JSX.Element>(<Button classes="w-full mt-3" click={submitBugReport}>SUBMIT REPORT</Button>);

    let bugTitleField = useRef<HTMLInputElement>(null);
    let bugDescriptionField = useRef<HTMLTextAreaElement>(null);

    function openHistory() {
        setBugReportingFormVisibility(false);
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

    function openBugReportingForm() {
        setHistoryVisibility(false);
        setBugReportingFormVisibility(true);
    }


    async function submitBugReport() {
        console.log(bugTitleField?.current, bugDescriptionField?.current);

        if (!bugTitleField?.current || !bugDescriptionField?.current) return;

        setReportBugButton(<Button classes="w-full mt-3 pointer-events-none opacity-50">SUBMITTING...</Button>);

        try {
            let response = await fetch("/api/report", {
                method: "POST",
                body: new URLSearchParams({ title: bugTitleField.current.value ?? "", description: bugDescriptionField.current.textContent ?? "" })
            });

            let result = await response.json();

            if (result.success) {
                setReportBugButton(<strong className="mt-2 text-emerald-400 font-medium">Report submitted. You can now close this window.</strong>);
            }
        } catch {
            setReportBugButton(<strong className="mt-2 text-red-500 font-medium">Unable to submit report. Please try again later.</strong>);
        }
    }

    return (
        <>
            <header className="absolute top-0 left-0 right-0">
                <Banner><span>&#127881; Share 3.0.0 is here. Check out whats changed by clicking <a href="https://github.com/harveycoombs/share/releases" target="_blank" className="hover:underline">here</a>.</span></Banner>
                <div className="flex justify-between items-center p-4 max-[460px]:p-3">
                    <strong className="text-sm font-bold max-lg:text-xs">MADE <span className="max-[460px]:hidden">WITH <span className="text-slate-800 dark:text-zinc-400">REACT</span></span> BY <a href="https://harveycoombs.com/" target="_blank" className="text-slate-800 decoration-2 hover:underline dark:text-zinc-400">HARVEY COOMBS</a></strong>
                    <div className="text-sm font-bold pointer-events-none select-none max-lg:hidden">UPLOADS OLDER THAN 30 DAYS ARE DELETED &middot; 5GB MAXIMUM UPLOAD SIZE</div>
                    <nav>
                        <HeaderNavigationItem title="View Upload History" icon={faClockRotateLeft} click={openHistory} />
                        <HeaderNavigationItem title="Report an Issue" icon={faBug}  click={openBugReportingForm} />
                        <HeaderNavigationItem url="https://github.com/harveycoombs/share" title="View on GitHub" icon={faGithub} />
                    </nav>
                </div>
            </header>
            {historyIsVisible ? <Popup title="Upload History" close={() => setHistoryVisibility(false)}>{history}</Popup> : ""}
            
            {bugReportingFormIsVisible ? <Popup title="Report An Issue" close={() => setBugReportingFormVisibility(false)}>
                <div className="mt-2">
                    <label className="block mt-3 mb-1.5 text-xs font-bold select-none">TITLE</label>
                    <Field type="text" classes="w-full" innerref={bugTitleField} />
                    <label className="block mt-3 mb-1.5 text-xs font-bold select-none">DESCRIPTION</label>
                    <TextBox classes="w-full resize-none" rows="5" innerref={bugDescriptionField} />
                    {reportBugButton}
                </div>
            </Popup> : ""}
        </>
    );
}

function HeaderNavigationItem(props: any) {
    let classes = "inline-block align-middle text-xl ml-5 duration-150 cursor-pointer select-none hover:text-slate-400 active:text-slate-500 max-[460px]:ml-4 max-[460px]:text-lg";

    return (
        props.url?.length ? <Link href={props.url} target="_blank" className={classes} title={props.title} draggable="false"><FontAwesomeIcon icon={props.icon} /></Link> : <div className={classes} title={props.title} draggable="false" onClick={props.click}><FontAwesomeIcon icon={props.icon} /></div>
    );
}