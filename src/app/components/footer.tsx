import Link from "next/link";

export default function Footer() {
    return (
            <footer className="absolute bottom-0 left-0 right-0">
                <div className="flex justify-between items-center p-4 max-[460px]:p-3">
                    <strong className="text-sm font-bold max-lg:text-xs">MADE <span className="max-[460px]:hidden">WITH <span className="text-slate-800 dark:text-zinc-400">REACT</span></span> BY <Link href="https://harveycoombs.com/" target="_blank" className="text-slate-800 decoration-2 hover:underline dark:text-zinc-400">HARVEY COOMBS</Link></strong>
                    <Link href="/takedowns" className="decoration-2 text-sm font-bold max-lg:text-xs hover:underline">TAKEDOWN REQUESTS</Link>
                </div>
            </footer>
    );
}