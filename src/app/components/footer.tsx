import Link from "next/link";

export default function Footer() {
    return (
        <footer className="absolute bottom-0 left-0 right-0 select-none text-center p-5 max-[460px]:p-4">
            <strong className="text-sm text-slate-400/60 font-semibold max-lg:text-xs">2021-{new Date().getFullYear()} &middot; Share.surf {process.env.APP_VERSION} &middot; <Link href="https://harveycoombs.com/" target="_blank" rel="noopener" draggable={false} className="decoration-2 hover:underline">Harvey Coombs</Link></strong>
        </footer>
    );
}