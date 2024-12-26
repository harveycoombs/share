import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";

import Logo from "@/app/components/common/logo";
import Button from "@/app/components/common/button";

export default function Home() {
    return (
        <section className="text-center">
            <div>
                <div className="w-fit mx-auto"><Logo width={288} height={56} /></div>
                <strong className="block font-medium text-slate-400 mt-4">The no-frills file sharing service</strong>
            </div>
            <div className="mt-20">
                <h1 className="text-3xl font-medium">Drop files onto this page to upload</h1>
                <div>
                    <Button className="inline-block align-middle">Browse Files</Button>
                    <Button className="inline-block align-middle ml-3" transparent={true}><FontAwesomeIcon icon={faClockRotateLeft} /> View Upload History</Button>
                </div>
            </div>
        </section>
    );
}