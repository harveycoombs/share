"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import Button from "@/app/components/common/Button";
import AccountSettings from "@/app/components/common/popups/AccountSettings";

export default function Header() {
    const path = usePathname();
    if (path == "/login" || path == "/register") return null;

    const [user, setUser] = useState<any>(null);
    const [menuIsVisible, setMenuVisibility] = useState<boolean>(false);
    const [accountSettingsAreVisible, setAccountSettingsVisibility] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const response = await fetch("/api/user/session");
            
            if (!response.ok) {
                setUser(null);
                return;
            }

            const json = await response.json();
            setUser(json.user);
        })();
    }, []);

    async function logout() {
        await fetch("/api/user/session", { method: "DELETE" });
        window.location.reload();
    }

    return (
        <>
            <header className="p-3.5 flex justify-between select-none">
                <div className={`cursor-pointer duration-150 hover:opacity-80 active:opacity-60 ${(path == "/" && !user) ? "max-sm:hidden" : ""}`} onClick={() => window.location.href = "/"}><Image src="/images/icon.png" alt="Share" width={28} height={28} /></div>

                {user ? <nav className="relative">
                    <Image 
                        src={`/api/user/avatar?t=${new Date().getTime()}`}
                        alt={`${user?.first_name} ${user?.last_name} (You)`} 
                        width={32} 
                        height={32}
                        className="inline-block align-middle rounded-full object-cover aspect-square cursor-pointer duration-150 hover:opacity-80 active:opacity-70"
                        title="View Account Settings"
                        draggable={false} onClick={() => setAccountSettingsVisibility(true)}
                    />

                    <div className="inline-block align-middle text-xl text-slate-400/60 leading-none translate-y-px ml-5 cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85 dark:text-zinc-400" onClick={() => setMenuVisibility(!menuIsVisible)}>
                        <FontAwesomeIcon icon={faEllipsis} />
                    </div>

                    <div className={`${menuIsVisible ? "block" : "hidden"} absolute top-[120%] right-0 overflow-hidden bg-white rounded-lg shadow-lg w-38 dark:bg-zinc-800`}>
                        <Link href="https://github.com/harveycoombs/share/issues/new" target="_blank" rel="noopener noreferrer" className="block px-2.5 py-1.75 text-[0.8rem] font-medium border-t border-slate-200/50 text-slate-700 hover:bg-slate-100/50 duration-150 cursor-pointer">Report Issue</Link>
                        <div className="px-2.5 py-1.75 text-[0.8rem] font-medium text-red-500 border-t border-slate-200/50 hover:bg-red-50 duration-150 cursor-pointer" onClick={logout}>Log out</div>
                    </div>
                </nav> : <nav className="max-sm:flex max-sm:w-full max-sm:gap-1">
                    <Button url="/login" classes="inline-block align-middle max-sm:px-4 max-sm:py-2.75 max-sm:text-xs max-sm:w-1/2">Sign In</Button>
                    <Button url="/register" classes="inline-block align-middle ml-2 max-sm:px-4 max-sm:py-2.75 max-sm:text-xs max-sm:w-1/2" transparent={true}>Sign Up</Button>
                </nav>}
            </header>

            {accountSettingsAreVisible && user && <AccountSettings onClose={() => setAccountSettingsVisibility(false)} />}
        </>
    );
}