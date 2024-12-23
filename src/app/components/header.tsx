import React from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import Logo from "@/app/components/common/logo";

export default function Header() {
    return (
        <header className="absolute top-0 left-0 right-0 select-none">
            <div className="flex justify-between items-center p-5 max-[460px]:p-3">
                <Link href="/" className="font-bold select-none leading-none duration-150 hover:opacity-70">
                    <Logo width={126} height={24} />
                </Link>
                <nav className="flex items-center gap-8 flex-nowrap">
                    <HeaderLink url="https://github.com/harveycoombs/share-surf/issues/new" text="Report Issue" />
                    <HeaderLink url="/limits" text="Increase Limit" />
                    <Link href="https://github.com/harveycoombs/share-surf" className="text-xl leading-none text-slate-400/60 duration-150 hover:text-slate-400"><FontAwesomeIcon icon={faGithub} /></Link>
                </nav>
            </div>
        </header>
    );
}

function HeaderLink({ url, text }: any) {
    return <Link href={url} className="text-sm font-semibold leading-none duration-150 hover:text-slate-500 hover:dark:text-slate-300/80 max-[515px]:hidden">{text}</Link>
}