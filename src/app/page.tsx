import Button from "./ui/button";

export default function Home() {
  return (
    <main className="grid place-items-center h-screen">
      <section className="text-center">
          <h1 className="text-5xl font-black text-slate-800 pointer-events-none duration-150">DROP FILES ONTO THIS PAGE</h1>
          <div className="w-fit mt-8 mb-0 ml-auto mr-auto">
              <strong className="inline-block align-middle text-xl font-extrabold mr-4 pointer-events-none">OR</strong>
              <Button text="Browse Files" classes={["inline-block", "align-middle"]} />
          </div>
      </section>
    </main>
  );
}
