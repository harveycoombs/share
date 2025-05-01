"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import Settings from "@/app/components/common/popups/Settings";
import Button from "@/app/components/common/Button";

export default function Header() {
    const path = usePathname();
    if (path == "/login" || path == "/register") return null;

    const [user, setUser] = useState<any>(null);
    const [menuIsVisible, setMenuVisibility] = useState<boolean>(false);
    const [settingsAreVisible, setSettingsVisibility] = useState<boolean>(false);

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
                <div className="cursor-pointer duration-150 hover:opacity-80 active:opacity-60" onClick={() => window.location.href = "/"}><Image src="/images/icon.png" alt="Share" width={28} height={28} /></div>

                {user ? <nav className="relative">
                    <Image src={`/api/user/avatar?t=${new Date().getTime()}`} alt={`${user?.first_name} ${user?.last_name}`} width={32} height={32} className="inline-block align-middle rounded-full object-cover" title={`Signed in as ${user.first_name} ${user.last_name}`} draggable={false} />

                    <div className="inline-block align-middle text-xl text-slate-400/60 leading-none translate-y-px ml-5 cursor-pointer duration-150 hover:text-slate-400 active:text-slate-500/85 dark:text-zinc-400" onClick={() => setMenuVisibility(!menuIsVisible)}>
                        <FontAwesomeIcon icon={faEllipsis} />
                    </div>

                    <div className={`${menuIsVisible ? "block" : "hidden"} absolute top-[105%] right-0 overflow-hidden bg-white rounded-lg shadow-lg w-38 dark:bg-zinc-800`}>
                        <div className="px-2.5 py-1.75 text-[0.8rem] font-medium text-slate-700 hover:bg-slate-100/50 duration-150 cursor-pointer" onClick={() => setSettingsVisibility(true)}>Settings</div>
                        <div className="px-2.5 py-1.75 text-[0.8rem] font-medium text-red-500 border-t border-slate-200/50 hover:bg-red-50 duration-150 cursor-pointer" onClick={logout}>Log out</div>
                    </div>
                </nav> : <nav>
                    <Button url="/login" classes="inline-block align-middle">Sign In</Button>
                    <Button url="/register" classes="inline-block align-middle ml-2" transparent={true}>Sign Up</Button>
                </nav>}
            </header>

            {settingsAreVisible && user && <Settings onClose={() => setSettingsVisibility(false)} />}
        </>
    );
}