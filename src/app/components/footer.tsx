import Link from "next/link";

export default function Footer() {
    return (
        <footer className="absolute bottom-0 left-0 right-0">
            <div className="text-center p-4 max-[460px]:p-3">
                <strong className="text-sm text-slate-400/60 font-bold max-lg:text-xs">{new Date().getFullYear()} &middot; Share {process.env.APP_VERSION} &middot; <Link href="https://harveycoombs.com/" target="_blank" className="decoration-2 hover:underline">Harvey Coombs</Link></strong>
            </div>
        </footer>
    );
}