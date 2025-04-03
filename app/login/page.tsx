import Link from "next/link";

import Logo from "@/app/components/common/Logo";
import LoginForm from "@/app/login/form";

export default function Login() {
    return (
        <main className="h-screen grid place-items-center">
            <section className="w-68">
                <Link href="/" className="block w-fit mx-auto mb-5 select-none cursor-pointer duration-150 hover:opacity-80 active:opacity-60"><Logo width={220} height={43} /></Link>

                <strong className="block font-semibold text-lg text-center mt-2 select-none">Welcome Back</strong>
                <div className="text-sm font-medium text-center text-slate-400 select-none mb-7">Sign in using the form below</div>

                <LoginForm />

                <Link href="https://github.com/harveycoombs/share/issues/new" className="block text-sm text-slate-400/60 text-center select-none mt-2.5 hover:underline">Report Issue</Link>
            </section>
        </main> 
    );
}