import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faGithub, faXTwitter } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
    return (
        <footer className="flex justify-between items-center select-none text-center p-5 text-slate-400/60 font-medium max-[460px]:p-4">
            <div className="text-sm max-lg:text-xs">2021-{new Date().getFullYear()} &middot; Share.surf {process.env.APP_VERSION} &middot; <Link href="https://harveycoombs.com/" target="_blank" rel="noopener" draggable={false} className="decoration-2 hover:underline">Harvey Coombs</Link></div>
            <div>
                <FooterIcon icon={faDiscord} url="/" title="Discord" />
                <FooterIcon icon={faXTwitter} url="https://x.com/harveycoombs23" title="X / Twitter" />
                <FooterIcon icon={faGithub} url="https://github.com/harveycoombs" title="GitHub" />
            </div>
        </footer>
    );
}

function FooterIcon({ icon, url, title }: any) {
    return <Link href={url} target="_blank" rel="noopener" title={title} className="inline-block align-middle ml-4 text-lg leading-none duration-150 hover:text-slate-400 active:text-slate-500" draggable={false}><FontAwesomeIcon icon={icon} /></Link>;
}