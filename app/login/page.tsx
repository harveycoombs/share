"use client";
import { useState } from "react";
import Link from "next/link";

import Logo from "@/app/components/common/Logo";
import LoginForm from "@/app/login/form";
import IssueForm from "@/app/components/common/popups/IssueForm";

export default function Login() {
    const [issueFormVisibility, setIssueFormVisibility] = useState<boolean>(false);

    return (
        <main className="h-[calc(100vh-52px)] grid place-items-center">
            <section className="w-68">
                <Link href="/" className="block w-fit mx-auto mb-5 select-none cursor-pointer duration-150 hover:opacity-80 active:opacity-60"><Logo width={220} height={43} /></Link>

                <strong className="block font-semibold text-lg text-center mt-2 select-none">Welcome Back</strong>
                <div className="text-sm font-medium text-center text-slate-400 select-none mb-7 dark:text-zinc-400">Sign in using the form below</div>

                <LoginForm />

                <div className="block text-sm text-slate-400/60 dark:text-zinc-400/60 cursor-pointer text-center select-none mt-2.5 hover:underline" onClick={() => setIssueFormVisibility(true)}>Report Issue</div>
            </section>

            {issueFormVisibility && <IssueForm onClose={() => setIssueFormVisibility(false)} />}
        </main> 
    );
}