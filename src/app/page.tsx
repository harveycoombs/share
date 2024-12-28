import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faExternalLinkAlt, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import Logo from "@/app/components/common/logo";
import Button from "@/app/components/common/button";
import Link from "next/link";

export default function Home() {
    return (
        <section className="text-center w-600 mx-auto select-none">
            <div>
                <div className="w-fit mx-auto"><Logo width={288} height={56} /></div>
                <strong className="block font-medium text-slate-400 mt-4">The no-frills file sharing service</strong>
            </div>
            <div className="mt-16">
                <h1 className="text-3xl font-medium">Drop files onto this page to upload</h1>
                <div className="mt-5">
                    <Button classes="inline-block align-middle">Browse Files</Button>
                    <Button classes="inline-block align-middle ml-2" transparent={true}><FontAwesomeIcon icon={faClockRotateLeft} /> View Upload History</Button>
                </div>
                <div className="my-6 text-blue-500 text-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="inline-block align-middle text-lg leading-none" />
                    <span className="inline-block align-middle text-xs leading-none font-semibold ml-2">2GB Upload Limit</span>
                </div>
            </div>
            <div className="flex gap-2.5 w-full p-2.5 rounded-lg bg-slate-100 text-slate-400">
                <Image src="/images/collate-icon.png" alt="Collate AI" width={75} height={75} className="block rounded shrink-0 aspect-square pointer-events-none" />
                <div className="text-left">
                    <Link href="https://collate.run/" target="_blank" rel="noopener" className="block text-sm font-semibold text-slate-500 mb-1.5 hover:underline"><FontAwesomeIcon icon={faExternalLinkAlt} /> Collate: Find &amp; summarise anything on the web with AI</Link>
                    <p className="text-[0.8rem] font-medium pointer-events-none">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Optio tempore maxime facere est recusandae ullam necessitatibus doloremque minima laborum magni!</p>
                </div>
            </div>
        </section>
    );
}