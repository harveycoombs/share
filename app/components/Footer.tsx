"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin, faReddit } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
    return (
        <footer className="p-4 flex justify-between items-center select-none text-slate-400/60">
            <div className="text-sm font-medium max-sm:text-xs">2021 &ndash; {new Date().getFullYear()} &middot; Share {process.env.NEXT_PUBLIC_APP_VERSION} &middot; <Link href="https://harveycoombs.com/" target="_blank" rel="noopener" className="hover:underline">Harvey Coombs</Link></div>
            <div>
                <FooterIcon icon={faGithub} title="GitHub" url="https://github.com/harveycoombs/share" />
                <FooterIcon icon={faReddit} title="Reddit" url="https://www.reddit.com/user/Harvey-Coombs" />
                <FooterIcon icon={faLinkedin} title="LinkedIn" url="https://www.linkedin.com/in/harvey-coombs-24573214a" />
            </div>
        </footer>
    );
}

function FooterIcon({ icon, title, url }: any) {
    return <Link href={url} target="_blank" rel="noopener" title={title} className="inline-block align-middle ml-4 text-lg text-slate-400/60 leading-none translate-y-px cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85 max-sm:text-base"><FontAwesomeIcon icon={icon} /></Link>
}