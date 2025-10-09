import Link from "next/link";

import Logo from "@/app/components/common/Logo";
import RecoveryForm from "@/app/recover/form";

export default function Recover() {
    return (
        <main className="min-h-[calc(100vh-119px)] grid place-items-center">
            <section className="w-75.5 py-3.5">
                <Link href="/" className="block w-fit mx-auto mb-5 select-none cursor-pointer duration-150 hover:opacity-80 active:opacity-60"><Logo width={220} height={43} /></Link>

                <strong className="block font-semibold text-lg text-center mt-2 select-none">Recover Account</strong>
                <div className="text-sm font-medium text-center text-slate-400 select-none mb-7">Reset your password by completing the form below</div>

                <RecoveryForm />
            </section>
        </main>
    );
}   