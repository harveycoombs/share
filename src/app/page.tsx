"use client";
import { useState, useRef } from "react";
import Button from "./ui/button";

export default function Home() {
    let [heading, setHeading] = useState<React.JSX.Element>(<h1 className="text-5xl font-black text-slate-800 pointer-events-none">DROP FILES ONTO THIS PAGE</h1>);
    let [subheading, setSubheading] = useState<React.JSX.Element|null>(<strong className="inline-block align-middle text-xl font-extrabold mr-4 pointer-events-none">OR</strong>);
    let [btnIsVisible, setBtnVisibility] = useState<boolean>(true);

    let uploader = useRef<HTMLInputElement>(null);

    function browseFiles() {
        uploader?.current?.click();
    }

    async function handleUpload(e: any) {
        e.preventDefault();

        setBtnVisibility(false);

        if (!e.target.files?.length) {
            setHeading(<h1 className="text-5xl font-black text-amber-400 pointer-events-none">PLEASE CHOOSE AT LEAST 1 FILE TO UPLOAD</h1>);
            setSubheading(null);
            return;
        }

        let data = new FormData();
        for (let file of e.target.files) data.append("files", file);

        let response = await fetch("/api/upload", {
            method: "POST",
            body: data
        });

        switch (response.status) {
            case 200:
                let json = await response.json();
                setHeading(<h1 className="text-5xl font-black emerald-400 cursor-pointer">{document.location.href.toUpperCase()}UPLOADS/{json.id.toString().toUpperCase()}</h1>);
                setSubheading(<strong className="block text-center text-xl font-extrabold emerald-200 mr-4 pointer-events-none">CLICK TO COPY</strong>);
                break;
            case 413:
                let multiple = (e.target.files.length > 1);
                setHeading(<h1 className="text-5xl font-black text-red-500 pointer-events-none">UPLOADED FILE{multiple ? "S" : ""} {multiple ? "WERE" : "WAS"} TOO LARGE</h1>);
                setSubheading(<strong className="block text-center text-xl font-extrabold red-300 mr-4 pointer-events-none">THE MAXIMUM UPLOAD SIZE IS 5GB</strong>);
                break;
            default:
                setHeading(<h1 className="text-5xl font-black text-red-500 pointer-events-none">AN UNEXPECTED SERVER ERROR OCCURED</h1>);
                setSubheading(<strong className="block text-center text-xl font-extrabold text-red-300 mr-4 pointer-events-none">PLEASE TRY AGAIN LATER</strong>);
                break;
        }
    }

  return (
    <main className="grid place-items-center h-screen">
      <section className="text-center">
          {heading}
          <div className="w-fit mt-8 mb-0 ml-auto mr-auto">
              {subheading}
              <Button text="Browse Files" classes={["inline-block", "align-middle", (btnIsVisible ? "" : "hidden")]} click={browseFiles} />
          </div>
      </section>
      <input type="file" ref={uploader} onChange={handleUpload} className="hidden" />
    </main>
  );
}