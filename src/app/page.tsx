"use client";
import { useState, useRef } from "react";
import Button from "./ui/button";

export default function Home() {
    let [heading, setHeading] = useState<React.JSX.Element>(<h1 className="text-5xl font-black text-slate-800 pointer-events-none">DROP FILES ONTO THIS PAGE</h1>);
    let [subheading, setSubheading] = useState<React.JSX.Element|null>(<strong className="inline-block align-middle text-xl font-extrabold mr-4 pointer-events-none">OR</strong>);
    let [button, setButton] = useState<React.JSX.Element|null>(<Button text="Browse Files" classes={["inline-block", "align-middle"]} click={browseFiles} />);

    let uploader = useRef<HTMLInputElement>(null);
    let progressBar = useRef<HTMLProgressElement>(null);
    let percentageLabel = useRef<HTMLElement>(null);

    function browseFiles() {
        uploader?.current?.click();
    }

    function updateProgressBar(e: any) {
        if (!e.lengthComputable) return;
    
        let progress = (e.loaded / e.total) * 100;
    
        if (progressBar.current && percentageLabel.current) {
            progressBar.current.value = progress;
            progressBar.current.innerText = `${Math.round(progress)}&percnt;`;
            percentageLabel.current.innerHTML = `${Math.round(progress)}&percnt; COMPLETE`;
        }
    }

    async function handleUpload(e: any) {
        e.preventDefault();

        let uploads = e.target.files;

        setSubheading(<strong className="block text-xl text-center font-extrabold" ref={percentageLabel}>0&percnt; COMPLETE</strong>);
        setButton(<progress className="appearance-none w-96 h-3 mt-8 bg-slate-200 border-none rounded duration-150" max="100" value="0" ref={progressBar}></progress>);      

        if (!uploads?.length) {
            setHeading(<h1 className="text-5xl font-black text-amber-400 pointer-events-none">PLEASE CHOOSE AT LEAST 1 FILE TO UPLOAD</h1>);
            return;
        }

        let files = new FormData();
        for (let file of uploads) files.append("files", file);

        let request = new XMLHttpRequest();
    
        request.open("POST", "/api/upload", true);
        request.responseType = "json";
    
        request.upload.addEventListener("progress", updateProgressBar);

        request.addEventListener("readystatechange", (e: any) => {
            if (e.target.readyState != 4) return;

            switch (e.target.status) {
                case 200:
                    setHeading(<h1 className="text-5xl font-black emerald-400 cursor-pointer">{document.location.href.toUpperCase()}UPLOADS/{e.target.response.id.toString().toUpperCase()}</h1>);
                    setSubheading(<strong className="block text-center text-xl font-extrabold emerald-200 mr-4 pointer-events-none">CLICK TO COPY</strong>);
                    break;
                case 413:
                    let multiple = (uploads.length > 1);
                    setHeading(<h1 className="text-5xl font-black text-red-500 pointer-events-none">UPLOADED FILE{multiple ? "S" : ""} {multiple ? "WERE" : "WAS"} TOO LARGE</h1>);
                    setSubheading(<strong className="block text-center text-xl font-extrabold red-300 mr-4 pointer-events-none">THE MAXIMUM UPLOAD SIZE IS 5GB</strong>);
                    break;
                default:
                    setHeading(<h1 className="text-5xl font-black text-red-500 pointer-events-none">AN UNEXPECTED SERVER ERROR OCCURED</h1>);
                    setSubheading(<strong className="block text-center text-xl font-extrabold text-red-300 mr-4 pointer-events-none">PLEASE TRY AGAIN LATER</strong>);
                    break;
            }
        });

        request.send(files);
    }

  return (
    <main className="grid place-items-center h-screen">
      <section className="text-center">
          {heading}
          <div className="w-fit mt-8 mb-0 ml-auto mr-auto">
              {subheading}
              {button}
          </div>
      </section>
      <input type="file" ref={uploader} onChange={handleUpload} className="hidden" />
    </main>
  );
}