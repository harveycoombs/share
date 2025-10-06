"use client";
import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import packageJson from "@/package.json";
import IssueForm from "@/app/components/popups/IssueForm";

export default function Footer() {
    const [issueFormVisibility, setIssueFormVisibility] = useState<boolean>(false);

    return (
        <footer className="p-4 flex justify-between items-center select-none bg-white text-slate-400/60 text-sm font-medium max-md:text-xs max-sm:flex-col max-sm:items-center max-sm:gap-2">
            <div>2021 &ndash; {new Date().getFullYear()} &middot; <span title="Formerly cynohost.com">Share</span> {packageJson.version} &middot; <Link href="https://harveycoombs.com/" target="_blank" rel="noopener" className="hover:underline">Harvey Coombs</Link></div>

            <div className="flex items-center gap-4 max-sm:gap-3">
                <Link href="https://www.paypal.com/donate/?hosted_button_id=228EPXK88WT9W" target="_blank" rel="noopener" className="text-amber-500 text-shadow-md text-shadow-amber-200 hover:underline">Donate</Link>
                <Link href="/documents/privacy-policy.pdf" className="hover:underline">Privacy Policy</Link>
                <Link href="/documents/terms-of-service.pdf" className="hover:underline">Terms of Service</Link>
                <div className="hover:underline cursor-pointer" onClick={() => setIssueFormVisibility(true)}>Report an Issue</div>
                <FooterIcon icon={faGithub} title="GitHub" url="https://github.com/harveycoombs/share" />
            </div>

            {issueFormVisibility && <IssueForm onClose={() => setIssueFormVisibility(false)} />}
        </footer>
    );
}

function FooterIcon({ icon, title, url, classes }: any) {
    return <Link href={url} target="_blank" rel="noopener" title={title} className={`text-lg text-slate-400/60 leading-none translate-y-px cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85 max-sm:text-base ${classes?.length ? " " + classes : ""}`}><FontAwesomeIcon icon={icon} /></Link>
}