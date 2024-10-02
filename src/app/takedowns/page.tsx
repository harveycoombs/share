"use client";
import { useState, useRef } from "react";

import Button from "../components/ui/button";
import Field from "../components/ui/field";
import TextBox from "../components/ui/textbox";

export default function Takedowns() {
    let takedownForm = useRef<HTMLDivElement>(null);
    let uploadIdField = useRef<HTMLInputElement>(null);
    let reasonField = useRef<HTMLTextAreaElement>(null);
    let emailField = useRef<HTMLInputElement>(null);

    let [heading, setHeading] = useState<React.JSX.Element>(<h1 className="text-5xl text-center font-black text-slate-800 px-5 pointer-events-none select-none max-lg:text-4xl max-[460px]:hidden dark:text-zinc-500">UPLOAD TAKEDOWN REQUESTS</h1>);
    let [subheading, setSubheading] = useState<React.JSX.Element|null>(<strong className="block text-xl text-center font-extrabold mt-3 pointer-events-none select-none max-lg:text-base max-[460px]:hidden">PLEASE USE THE FORM BELOW TO SUBMIT A TAKEDOWN REQUEST</strong>);

    async function submitTakedownRequest() {
	if (!uploadIdField?.current || !reasonField?.current || !emailField?.current) return;

        if (uploadIdField.current.value?.length) {
            uploadIdField.current.classList.remove("bg-slate-200", "dark:text-zinc-50");
            uploadIdField.current.classList.add("bg-amber-200");
        }

        if (reasonField.current.textContent?.length) {
            reasonField.current.classList.remove("bg-slate-200", "dark:text-zinc-50");
            reasonField.current.classList.add("bg-amber-200");
        }
        
        if (emailField.current.value?.length) {
            emailField.current.classList.remove("bg-slate-200", "dark:text-zinc-50");
            emailField.current.classList.add("bg-amber-200");
        }

        if (!uploadIdField.current.value?.length || !reasonField.current.textContent?.length || !emailField.current.value?.length) return;

        let details = new URLSearchParams({
            id: uploadIdField.current.value,
            reason: reasonField.current.textContent,
            email: emailField.current.value
        });

        let response = await fetch("/api/takedown", {
            method: "POST",
            body: details
        });

        takedownForm?.current?.remove();

        if (!response.ok) {
            setHeading(<h1 className="text-5xl text-center font-black text-red-500 pointer-events-none select-none">AN UNEXPECTED SERVER ERROR OCCURED</h1>);
            setSubheading(<strong className="block text-xl text-center font-extrabold text-red-300 mt-3 pointer-events-none select-none">PLEASE TRY AGAIN LATER</strong>);
            return;
        }

        let json = await response.json();

        if (!json.success) {
            setHeading(<h1 className="text-5xl text-center font-black text-red-500 pointer-events-none select-none">UNABLE TO SUBMIT TAKEDOWN REQUEST</h1>);
            setSubheading(<strong className="block text-xl text-center font-extrabold text-red-300 mt-3 pointer-events-none select-none">PLEASE CHECK YOUR DETAILS AND TRY AGAIN</strong>);
            return;
        }

        setHeading(<h1 className="text-5xl text-center font-black text-emerald-400 cursor-pointer select-none">TAKEDOWN REQUEST SUCCESSFULLY SUBMITTED</h1>);
        setSubheading(<strong className="block text-xl text-center font-extrabold text-emerald-200 mt-3 pointer-events-none select-none">YOU MAY NOW CLOSE THIS WINDOW</strong>);
    }

    return (
        <main className="grid place-items-center h-screen">
            <section>
                {heading}
                {subheading}
                <div className="w-96 mx-auto mt-8" ref={takedownForm}>
                    <label className="block mt-3 mb-1.5 text-xs font-bold select-none">UPLOAD ID</label>
                    <Field type="text" classes="w-full" innerref={uploadIdField} />
                    <label className="block mt-3 mb-1.5 text-xs font-bold select-none">REASON</label>
                    <TextBox classes="w-full resize-none" rows="5" innerref={reasonField} />
                    <label className="block mt-3 mb-1.5 text-xs font-bold select-none">YOUR EMAIL ADDRESS</label>
                    <Field type="text" classes="w-full" innerref={emailField} />
                    <Button classes="w-full mt-3" click={submitTakedownRequest}>SUBMIT REQUEST</Button>
                </div>
            </section>
        </main>
    );
}