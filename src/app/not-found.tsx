import Button from "./components/ui/button";

export default function NotFoundPage() {
    return (
        <main className="h-full grid place-items-center">
            <div>
                <h1 className="text-5xl font-black text-amber-400 px-5 pointer-events-none select-none max-lg:text-4xl max-[460px]:hidden dark:text-zinc-500">404 &middot; NOT FOUND</h1>
                <Button url="/" classes="block w-fit mx-auto mt-6">TAKE ME HOME</Button>
            </div>
        </main>
    );
}