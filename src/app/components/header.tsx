import React from "react";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons";

import Logo from "@/app/components/common/logo";

export default function Header() {
    return (
        <header className="sticky top-0 select-none">
            <div className="flex justify-between items-center p-5 max-[460px]:p-3">
                <Link href="/" className="font-bold select-none leading-none duration-150 hover:opacity-70" draggable={false}>
                    <Logo width={126} height={24} />
                </Link>
                <nav className="flex items-center gap-8 flex-nowrap">
                    <HeaderLink url="/about" text="About" />
                    <HeaderLink url="/support" text="Support" />
                    <HeaderLink url="/premium" text="Premium" />
                    <Link href="/login" className="text-xl leading-none text-slate-400/60 duration-150 hover:text-slate-400 active:text-slate-500" title="Log In" draggable={false}><FontAwesomeIcon icon={faRightToBracket} /></Link>
                </nav>
            </div>
        </header>
    );
}

function HeaderLink({ url, text }: any) {
    return <Link href={url} className="text-sm font-medium leading-none duration-150 hover:text-slate-500 active:text-slate-400" draggable={false}>{text}</Link>
}