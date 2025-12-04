"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

import Logo from "@/app/components/common/Logo";
import Button from "@/app/components/common/Button";
import Notice from "@/app/components/common/Notice";

export default function ProtectedError({ params }: any) {
    const [id, setID] = useState<string>("");
    const [url, setURL] = useState<string>("");

    useEffect(() => {
        (async () => {
            const { id } = await params;
            setID(id);
        })();
    }, []);

    return (
        <main className="min-h-[calc(100vh-117px)] grid place-items-center max-sm:min-h-[calc(100vh-135px)]">
            <section className="w-fit select-none">
                <div className="w-fit mx-auto">
                    <div className="w-fit mx-auto max-sm:scale-90"><Logo width={288} height={56} className="dark:fill-white" /></div>
                    <h2 className="text-center block font-medium text-slate-400 mt-4 max-sm:text-sm">The no-frills file sharing service</h2>
                </div>

                <Notice color="red" classes="mt-4"><FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />Incorrect password</Notice>
                <Button url={`/uploads/${id}`} classes="block w-full mt-4">Try Again</Button>
            </section>  
        </main>
    );
}