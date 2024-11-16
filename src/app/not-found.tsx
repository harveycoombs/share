import Button from "./components/ui/button";

export default function NotFoundPage() {
    return (
        <main className="h-full grid place-items-center">
            <div>

             <h1 className="text-6xl font-semibold duration-150 pointer-events-none select-none">404 &middot; Not Found</h1>
                <Button url="/" classes="block w-fit mx-auto mt-6">Take Me Home</Button>
            </div>
        </main>
    );
}