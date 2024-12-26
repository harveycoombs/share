import Logo from "@/app/components/common/logo";

export default function Home() {
    return (
        <section>
            <div>
                <Logo width={288} height={56} />
                <strong className="block font-medium text-slate-400 text-center mt-4">The no-frills file sharing service</strong>
            </div>
            <div>
                <h1>Drop files onto this page to upload</h1>
            </div>
        </section>
    );
}