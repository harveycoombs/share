"use client";
import { useState } from "react";
import Link from "next/link";

import Logo from "@/app/components/common/Logo";
import RegistrationForm from "@/app/register/form";
import IssueForm from "@/app/components/common/popups/IssueForm";

export default function Register() {
    const [issueFormVisibility, setIssueFormVisibility] = useState<boolean>(false);

    return (
        <main className="min-h-[calc(100vh-52px)] grid place-items-center">
            <section className="w-68 py-3.5">
                <Link href="/" className="block w-fit mx-auto mb-5 select-none cursor-pointer duration-150 hover:opacity-80 active:opacity-60"><Logo width={220} height={43} /></Link>

                <strong className="block font-semibold text-lg text-center mt-2 select-none">Get More out of Share</strong>
                <div className="text-sm font-medium text-center text-slate-400 select-none mb-7 dark:text-zinc-400">Register using the form below</div>

                <RegistrationForm />

                <div className="block text-sm text-slate-400/60 text-center select-none mt-2.5 hover:underline dark:text-zinc-400/60" onClick={() => setIssueFormVisibility(true)}>Report Issue</div>
            </section>

            {issueFormVisibility && <IssueForm onClose={() => setIssueFormVisibility(false)} />}
        </main>
    );
}