"use client";
import { useRef, useState } from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faBug, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import Popup from "./popup";
import Field from "./field";
import TextBox from "./textbox";
import Button from "./button";

export default function Header() {
    let [historyIsVisible, setHistoryVisibility] = useState(false);
    let [history, setHistory] = useState<React.JSX.Element[]>([]);

    let [bugReportingFormIsVisible, setBugReportingFormVisibility] = useState(false);

    function openHistory() {
        setBugReportingFormVisibility(false);
        setHistoryVisibility(true);
        
        getHistory();
    }
    
    function closeHistory() {
        setHistoryVisibility(false);
    }

    async function getHistory() {
        let list: React.JSX.Element[] = [];
        
        try {
            let response = await fetch("/history");
            let data: number[] = await response.json();

            if (!data.length) {
                list.push(<div className="py-4 text-center font-medium text-sm text-slate-400 text-opacity-60 select-none">You don't have any upload history.</div>);
            }

            for (let id of data) {
                list.push(<div className="px-1.5 py-1 mt-1 rounded-md bg-slate-200 bg-opacity-50">
                    <Link href={`/uploads/${id}`} target="_blank" className="text-slate-500 font-bold decoration-2 hover:underline">{id}</Link>
                    <div className="text-sm font-semibold text-slate-400">{new Date(id).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })}</div>
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

    function closeBugReportingForm() {
        setBugReportingFormVisibility(false);
    }

    let historyPopup = historyIsVisible ? <Popup title="Upload History" close={closeHistory} content={history} /> : "";

    let bugReportingPopup = bugReportingFormIsVisible ? <Popup title="Report An Issue" close={closeBugReportingForm} content={
        <div className="mt-2">
            <label className="block mt-3 mb-1.5 text-xs font-bold">DESCRIPTION</label>
            <TextBox classes={["w-full resize-none"]} rows="5" />
            <label className="block mt-3 mb-1.5 text-xs font-bold">YOUR EMAIL ADDRESS</label>
            <Field classes={["w-full"]} />
            <Button text="Submit Report" classes={["w-full", "mt-3"]} />
        </div>
    } /> : "";

    return (
        <>
            <header className="absolute top-0 left-0 right-0">
                <Banner content={<span>&#127881; Share 3.0.0 is here. Check out whats changed by clicking <a href="https://github.com/harveycoombs/share/releases" target="_blank" className="hover:underline">here</a>.</span>} />
                <div className="flex justify-between items-center p-4">
                    <strong className="text-sm font-bold">MADE WITH <span className="text-slate-800">REACT</span> BY <a href="https://harveycoombs.com/" target="_blank" className="text-slate-800 decoration-2 hover:underline">HARVEY COOMBS</a></strong>
                    <div className="text-sm font-bold pointer-events-none select-none">UPLOADS OLDER THAN 30 DAYS ARE DELETED &middot; 5GB MAXIMUM UPLOAD SIZE</div>
                    <nav>
                        <HeaderNavigationItem title="View Upload History" icon={faClockRotateLeft} click={openHistory} />
                        <HeaderNavigationItem title="Report an Issue" icon={faBug}  click={openBugReportingForm} />
                        <HeaderNavigationItem url="https://github.com/harveycoombs/share" title="View on GitHub" icon={faGithub} />
                    </nav>
                </div>
            </header>
            {historyPopup}
            {bugReportingPopup}
        </>
    );
}

function HeaderNavigationItem(props: any) {
    let classes = "inline-block align-middle text-xl ml-5 duration-150 cursor-pointer hover:text-slate-400 active:text-slate-500";

    return (
        props.url?.length ? <Link href={props.url} target="_blank" className={classes} title={props.title} draggable="false"><FontAwesomeIcon icon={props.icon} /></Link> : <div className={classes} title={props.title} draggable="false" onClick={props.click}><FontAwesomeIcon icon={props.icon} /></div>
    );
}

function Banner(props: any) {
    let banner = useRef<HTMLDivElement>(null);

    function closeBanner() {
        if (!banner?.current) return;
        banner.current.remove();
    }

    return (
        <div className="relative p-1.5 text-sm font-medium text-center bg-blue-100 text-blue-600" ref={banner}>{props.content}<div className="absolute right-3 top-0 translate-y-px text-lg cursor-pointer hover:text-blue-400" onClick={closeBanner}><FontAwesomeIcon icon={faXmark} /></div></div>
    );
}