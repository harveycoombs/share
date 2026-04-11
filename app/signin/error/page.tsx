import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import Button from "@/app/components/common/Button";

export default function ErrorPage() {
    return (
        <main className="min-h-[calc(100vh-202px)] grid place-items-center">
            <section className="text-center">
                <FontAwesomeIcon icon={faCircleExclamation} className="block text-6xl text-red-500" />

                <h1 className="block font-semibold text-2xl mt-4">Invalid Link</h1>
                <p className="block font-medium mt-3 text-slate-400 dark:text-zinc-500">Check the link and try again or contact support if this issue persists.</p>

                <Button classes="block w-fit mx-auto mt-5.5" url="/">Take Me Home</Button>
            </section>
        </main>
    );
}