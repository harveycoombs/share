"use client";
import { useState, useEffect } from "react";

import Popup from "@/app/components/common/popup";
import Field from "@/app/components/common/field";

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

    let [currentSection, setCurrentSection] = useState<string>("general");
    let [sectionTitle, setSectionTitle] = useState<string>();
    let [sectionContent, setSectionContent] = useState<React.JSX.Element>();

    useEffect(() => {
        switch (currentSection) {
            case "general":
                setSectionTitle("General Settings");
                setSectionContent(<>
                    <Field />
                </>);
                break;
            case "account":
                setSectionTitle("Account Details");
                setSectionContent(<div>Dolor sit</div>);
                break;
            case "advanced":
                setSectionTitle("Advanced Settings");
                setSectionContent(<div>Amet consectetur</div>);
                break;
        }
    }, [currentSection]);

    function logout() {
        fetch("/api/user/session", { method: "DELETE" });

        onClose();
        window.location.reload();
    }

    return (
        <Popup title="Settings" onClose={onClose}>
            <div className="flex gap-3 w-500">
                <div className="w-28">
                    <SidebarItem title="General" selected={currentSection == "general"} onClick={() => setCurrentSection("general")} />
                    <SidebarItem title="Account" selected={currentSection == "account"} onClick={() => setCurrentSection("account")} />
                    <SidebarItem title="Advanced" selected={currentSection == "advanced"} onClick={() => setCurrentSection("advanced")} />
                    <div className="p-1.5 mb-1 rounded text-[0.8rem] leading-none text-red-500 font-medium duration-150 cursor-pointer select-none hover:bg-red-50 active:bg-red-100" onClick={logout}>Log Out</div>
                </div>
                <div>
                    <strong className="block text-sm font-semibold select-none">{sectionTitle}</strong>
                    <div>{sectionContent}</div>
                </div>
            </div>
        </Popup>
    );
}

function SidebarItem({ title, selected, classes, ...rest }: any) {
    return <div className={`p-1.5 mb-1 rounded text-[0.8rem] leading-none text-slate-400 font-medium ${selected ? "bg-slate-50" : ""} duration-150 cursor-pointer select-none hover:bg-slate-50 active:bg-slate-100`} {...rest}>{title}</div>;
}