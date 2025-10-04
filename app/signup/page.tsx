"use client";
import Link from "next/link";

import Logo from "@/app/components/common/Logo";
import RegistrationForm from "@/app/signup/form";

export default function Register() {
    return (
        <main className="min-h-[calc(100vh-52px)] grid place-items-center">
            <section className="w-75.5 py-3.5">
                <Link href="/" className="block w-fit mx-auto mb-5 select-none cursor-pointer duration-150 hover:opacity-80 active:opacity-60"><Logo width={220} height={43} /></Link>

                <strong className="block font-semibold text-lg text-center mt-2 select-none">Get More out of Share</strong>
                <div className="text-sm font-medium text-center text-slate-400 select-none mb-7">Register using the form below</div>

                <RegistrationForm />
            </section>
        </main>
    );
}