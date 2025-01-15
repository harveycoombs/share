"use client";
import { useState, useEffect } from "react";

import Popup from "@/app/components/common/popup";

interface Properties {
    onClose: () => void;
}

export default function AccountSettings({ onClose }: Properties) {
    let [user, setUser] = useState<any>(null);

    useEffect(() => {
        (async () => {
            let response = await fetch("/api/user");
            let json = await response.json();

            setUser(json.user);
        })();
    }, []);

    function logout() {
        fetch("/api/user/session", { method: "DELETE" });
        onClose();
        window.location.reload();
    }

    return (
        <Popup title="Account Settings" onClose={onClose}>
            <div className="flex gap-3 w-500">
                <div className="w-28">
                    <SidebarItem title="General" />
                    <SidebarItem title="Account" />
                    <SidebarItem title="Advanced" />
                    <div className="p-1.5 mb-1 rounded text-[0.8rem] leading-none text-red-500 font-medium duration-150 cursor-pointer select-none hover:bg-red-50 active:bg-red-100" onClick={logout}>Log Out</div>
                </div>
                <div>b</div>
            </div>
        </Popup>
    );
}

function SidebarItem({ title, classes, ...rest }: any) {
    return <div className="p-1.5 mb-1 rounded text-[0.8rem] leading-none text-slate-400 font-medium duration-150 cursor-pointer select-none hover:bg-slate-50 active:bg-slate-100" {...rest}>{title}</div>;
}