import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import Button from "./components/common/Button";

export default function NotFound() {
    return (
        <main className="min-h-[calc(100vh-119px)] grid place-items-center">
            <section className="text-center">
                <FontAwesomeIcon icon={faCircleQuestion} className="block text-6xl text-red-500" />

                <h1 className="block font-semibold text-2xl mt-4">Page Not Found</h1>
                <p className="block font-medium mt-3 text-slate-400">The page you are looking for was does not exist or no longer exists.</p>

                <Button classes="block w-fit mx-auto mt-5.5" url="/">Take Me Home</Button>
            </section>
        </main>
    );
}