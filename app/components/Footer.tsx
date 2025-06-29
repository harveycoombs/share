"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";

import packageJson from "@/package.json";

export default function Footer() {
    return (
        <footer className="p-4 flex justify-between items-center select-none bg-white text-slate-400/60 text-sm font-medium max-md:text-xs max-sm:flex-col max-sm:items-center max-sm:gap-2 dark:bg-zinc-950 dark:text-zinc-600">
            <div>2021 &ndash; {new Date().getFullYear()} &middot; Share {packageJson.version} (formerly cynohost.com) &middot; <Link href="https://harveycoombs.com/" target="_blank" rel="noopener" className="hover:underline">Harvey Coombs</Link></div>

            <div className="flex items-center gap-4 max-sm:gap-3">
                <Link href="/stats" className="hover:underline max-sm:hidden">Stats</Link>
                <Link href="https://www.paypal.com/donate/?hosted_button_id=228EPXK88WT9W" target="_blank" rel="noopener" className="hover:underline">Donate</Link>
                <Link href="/documents/privacy-policy.pdf" className="hover:underline">Privacy Policy</Link>
                <Link href="/documents/terms-of-service.pdf" className="hover:underline">Terms of Service</Link>
                <FooterIcon icon={faGithub} title="GitHub" url="https://github.com/harveycoombs/share" />
                <FooterIcon icon={faLinkedin} title="LinkedIn" url="https://www.linkedin.com/in/harveycoombs" classes="max-sm:hidden" />
            </div>
        </footer>
    );
}

function FooterIcon({ icon, title, url, classes }: any) {
    return <Link href={url} target="_blank" rel="noopener" title={title} className={`text-lg text-slate-400/60 leading-none translate-y-px cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85 max-sm:text-base dark:text-zinc-400${classes?.length ? " " + classes : ""}`}><FontAwesomeIcon icon={icon} /></Link>
}