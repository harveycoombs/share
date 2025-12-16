"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { AnimatePresence } from "motion/react";

import packageJson from "@/package.json";
import IssueForm from "@/app/components/popups/IssueForm";

export default function Footer() {
    const [issueFormVisibility, setIssueFormVisibility] = useState<boolean>(false);

    return (
        <footer className="p-5 select-none overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.3, type: "spring", damping: 10, stiffness: 100, delay: 0.15 }}
                className="p-2.5 border border-slate-300 rounded-2xl flex justify-between items-center text-slate-400 text-sm font-medium dark:text-zinc-500 dark:border-zinc-700"
            >
                <div>2021 &ndash; {new Date().getFullYear()} &middot; <span title="Formerly cynohost.com">Share</span> {packageJson.version} &middot; <Link href="https://harveycoombs.com/" target="_blank" rel="noopener" className="hover:underline" draggable={false}>Harvey Coombs</Link></div>

                <div className="h-9.75"></div>

                <div className="flex items-center gap-4 max-sm:gap-3">
                    <Link href="https://www.paypal.com/donate/?hosted_button_id=228EPXK88WT9W" target="_blank" rel="noopener" draggable={false} className="text-amber-500 text-shadow-md text-shadow-amber-200 hover:underline">Donate</Link>
                    <Link href="/documents/privacy-policy.pdf" className="hover:underline" draggable={false}>Privacy Policy</Link>
                    <Link href="/documents/terms-of-service.pdf" className="hover:underline" draggable={false}>Terms of Service</Link>
                    <div className="hover:underline cursor-pointer" onClick={() => setIssueFormVisibility(true)} draggable={false}>Report an Issue</div>
                    <FooterIcon icon={faGithub} title="GitHub" url="https://github.com/harveycoombs/share" />
                </div>
            </motion.div>

            <AnimatePresence>
                {issueFormVisibility && <IssueForm onClose={() => setIssueFormVisibility(false)} />}
            </AnimatePresence>
        </footer>
    );
}

function FooterIcon({ icon, title, url, classes }: any) {
    return <Link href={url} target="_blank" rel="noopener" title={title} draggable={false} className={`text-lg text-slate-400/60 leading-none translate-y-px cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85 max-sm:text-base dark:text-zinc-500 dark:hover:text-zinc-300 dark:active:text-zinc-400 ${classes?.length ? " " + classes : ""}`}><FontAwesomeIcon icon={icon} /></Link>
}