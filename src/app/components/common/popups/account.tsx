"use client";
import { useState, useEffect } from "react";

import Popup from "@/app/components/common/popup";
import Field from "@/app/components/common/field";
import Label from "@/app/components/common/label";
import Button from "@/app/components/common/button";

interface Properties {
    onClose: () => void;
}

export default function AccountSettings({ onClose }: Properties) {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const response = await fetch("/api/user");
            const json = await response.json();

            setUser(json.user);
        })();
    }, []);

    const [currentSection, setCurrentSection] = useState<string>("general");
    const [sectionTitle, setSectionTitle] = useState<string>();
    const [sectionContent, setSectionContent] = useState<React.JSX.Element>();

    useEffect(() => {
        switch (currentSection) {
            case "general":
                setSectionTitle("General Settings");
                setSectionContent(<div>Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>);
                break;
            case "account":
                setSectionTitle("Account Details");
                setSectionContent(<>
                    <div className="mt-2 w-full flex gap-2">
                        <div className="w-1/2">
                            <Label classes="block w-full">First Name</Label>
                            <Field small={true} classes="block w-full" defaultValue={user?.first_name ?? ""} />
                        </div>
            
                        <div className="w-1/2">
                            <Label classes="block w-full">Last Name</Label>
                            <Field small={true} classes="block w-full" defaultValue={user?.last_name ?? ""} />
                        </div>
                    </div>
            
                    <div className="mt-2 w-full flex gap-2">
                        <div className="w-1/2">
                            <Label classes="block w-full">Email Address</Label>
                            <Field type="email" small={true} classes="block w-full" defaultValue={user?.email_address ?? ""} />
                        </div>
                        <div className="w-1/2">
                            <Label classes="block invisible">Save Changes</Label>
                            <Button small={true} classes="block w-full">Save Changes</Button>
                        </div>
                    </div>
                </>);
                break;
            case "advanced":
                setSectionTitle("Advanced Settings");
                setSectionContent(<div>Lorem ipsum dolor sit amet.</div>);
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
                <div className="w-28 shrink-0">
                    <SidebarItem title="General" selected={currentSection == "general"} onClick={() => setCurrentSection("general")} />
                    <SidebarItem title="Account" selected={currentSection == "account"} onClick={() => setCurrentSection("account")} />
                    <SidebarItem title="Advanced" selected={currentSection == "advanced"} onClick={() => setCurrentSection("advanced")} />
                    <div className="p-1.5 mb-1 rounded text-[0.8rem] leading-none text-red-500 font-medium duration-150 cursor-pointer select-none hover:bg-red-50 active:bg-red-100" onClick={logout}>Log Out</div>
                </div>
                <div className="w-full">
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