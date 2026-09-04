"use client";
import { useState, useRef, useEffect, useCallback, useContext, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faKey } from "@fortawesome/free-solid-svg-icons";
import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";

import Panel from "@/app/components/common/Panel";
import Button from "@/app/components/common/Button";
import UploadHistory from "@/app/components/popups/UploadHistory";
import Field from "@/app/components/common/Field";
import Notice from "@/app/components/common/Notice";
import AccountPrompt from "@/app/components/popups/AccountPrompt";
import { formatBytes, formatTime } from "@/lib/utils";
import { UserContext } from "./context/UserContext";
import HCaptcha from "@hcaptcha/react-hcaptcha";

type GridColumn = {
    head: number;
    speed: number;
    trail: number;
};

const randomBetween = (minimum: number, maximum: number) => (
    Math.random() * (maximum - minimum) + minimum
);

export default function Home() {
     const user = useContext(UserContext);
 
     const [files, setFiles] = useState<FileList|null>(null);
     const [id, setID] = useState<string>("");
     const [loading, setLoading] = useState<boolean>(false);
     const [dragging, setDragging] = useState<boolean>(false);
     const [error, setError] = useState<string>("");
     const [progress, setProgress] = useState<number>(0);
     const [password, setPassword] = useState<string>("");
     const [passwordFieldIsVisible, setPasswordFieldVisibility] = useState<boolean>(false);
     const [uploadTime, setUploadTime] = useState<string>("");
     const [historyIsVisible, setHistoryVisibility] = useState<boolean>(false);
     const [sessionExists, setSessionExistence] = useState<boolean>(false);
     const [accountPromptIsVisible, setAccountPromptVisibility] = useState<boolean>(false);
     const [captchaToken, setCaptchaToken] = useState<string>("");
 
     const uploader = useRef<HTMLInputElement>(null);
 
     useEffect(() => {
         (async () => {
             const response = await fetch("/api/user/session");
             setSessionExistence(response.ok);
         })();
     }, []);

     useEffect(() => {
         if (!files?.length || (!captchaToken.length && !user)) return;
 
         if (Array.from(files).reduce((total: number, file: File) => total + file.size, 0) > (user ? 750000000 : 250000000)) {
             setError("File is too large");
             setLoading(false);
             return;
         }
 
         setLoading(true);
 
         const start = new Date().getTime();
 
         const title = (files.length > 1) ? "files.zip" : files[0].name;
         const contentType = (files.length > 1) ? "application/zip" : files[0]?.type || "application/octet-stream";
 
         (async () => {
             const uploadid = await insertUpload(title, contentType, captchaToken);
 
             if (!uploadid.length) return;
 
             const url = await getUploadURL(`uploads/${uploadid}`);
 
             if (!url.length) return;
     
             const request = new XMLHttpRequest();
 
             request.open("PUT", url, true);
             request.setRequestHeader("Content-Type", contentType);
 
             let file;
 
             if (files.length > 1) {
                 const zip = new JSZip();
 
                 for (const file of files) zip.file(file.name, await file.arrayBuffer());
                 const content = await zip.generateAsync({ type: "blob" });
 
                 file = new File([content], title, { type: contentType });
             } else {
                 file = files[0];
             }
 
             request.upload.addEventListener("progress", (e: ProgressEvent) => {
                 if (!e.lengthComputable) return;
                 setProgress((e.loaded / e.total) * 100);
             });
     
             request.addEventListener("readystatechange", (e: any) => {
                 if (e.target.readyState != 4) return;
     
                 setLoading(false);
     
                 const end = new Date().getTime();
                 setUploadTime(formatTime(end - start));
     
                 switch (e.target.status) {
                     case 200:
                     case 201:
                         setID(uploadid);
                         break;
                     case 413:
                         setError("File is too large");
                         break;
                     case 408:
                         setError("Server timed out");
                         break;
                     default:
                         setError("Something went wrong");
                         break;
                 }
             });
 
             request.send(file);
         })();
     }, [files, captchaToken]);
 
     useEffect(() => {
         window.addEventListener("paste", handlePaste);
         return () => window.removeEventListener("paste", handlePaste);
     }, []);
 
     useEffect(() => setPassword(""), [passwordFieldIsVisible]);
     
     async function insertUpload(title: string, contentType: string, captcha: string): Promise<string> {
         if (!files?.length) return "";
 
         const size = Array.from(files).reduce((total: number, file: File) => total + file.size, 0);
 
         const response = await fetch("/api/uploads", {
             method: "POST",
             body: JSON.stringify({ title, size, contentType, password, total: files.length, captchaToken: captcha })
         });
 
         const data = await response.json();
 
         switch (response.status) {
             case 413:
                 setError("File is too large");
                 break;
             case 408:
                 setError("Server timed out");
                 break;
             case 500:
                 setError("Something went wrong");
                 break;
         }
 
         return data.accessid ?? "";
     }
 
     async function getUploadURL(path: string) {
         const response = await fetch(`/api/uploads/url?filename=${path}`);
         const data = await response.json();
 
         if (!response.ok) {
             setError("An internal server error occurred");
             setLoading(false);
             return "";
         }
 
         return data.url ?? "";
     }
 
     const resetUploader = useCallback(() => {
         setID("");
         setError("");
         setProgress(0);
         setFiles(null);
         setUploadTime("");
         setLoading(false);
         setPassword("");
 
         if (uploader.current) {
             uploader.current.value = "";
         }
     }, []);
 
     const copyUploadURL = useCallback(async (e: any) => {
         if (!id) return;
 
         const url = e.target.innerText;
 
         await navigator.clipboard.writeText(url.toLowerCase());
         e.target.innerText = "Copied to Clipboard";
 
         setTimeout(() => e.target.innerText = url, 1200);
     }, [id]);
 
     const handleDragOverEvent = useCallback((e: any) => {
         e.preventDefault();
 
         if (!dragging && !files?.length) handleDragEnterEvent();
     }, [dragging, files]);
     
     const handleDragEnterEvent = useCallback(() => {
         if (files?.length) return;
 
         setDragging(true);
     }, [files]);
     
     const handleDragLeaveEvent = useCallback(() => {
         if (files?.length) return;
         setDragging(false);
     }, [files]);
 
     const handleDropEvent = useCallback((e: any) => {
         e.preventDefault();
 
         if (files?.length) return;
 
         if (uploader?.current) {
             uploader.current.files = e.dataTransfer.files;
             uploader.current.dispatchEvent(new Event("input", { bubbles: true }));
 
             handleDragLeaveEvent();
         }
     }, [files, uploader, handleDragLeaveEvent]);
 
     function handlePaste(e: ClipboardEvent) {
         const transfer = new DataTransfer();
 
         if (e.clipboardData?.files?.length) {
             for (let pastedFile of e.clipboardData.files) {
                 transfer.items.add(pastedFile);
             }
         } else if (e.clipboardData?.getData("text")?.length) {
             const textFile = new File([e.clipboardData.getData("text")], "pasted.txt", { type: "text/plain" });
             transfer.items.add(textFile);
         }
 
         if (!transfer.files.length) return;
 
         setFiles(transfer.files);
         uploader.current?.dispatchEvent(new Event("change"));
     }
 
     const browseFiles = useCallback(() => {
         uploader.current?.removeAttribute("webkitdirectory");
         uploader.current?.removeAttribute("directory");
 
         uploader.current?.click();
     }, [uploader]);
 
     const browseFolders = useCallback(() => {
         uploader.current?.setAttribute("webkitdirectory", "true");
         uploader.current?.setAttribute("directory", "true");
 
         uploader.current?.click();
     }, [uploader]);
     
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (!canvas || !context) return;

        const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
        let animationFrame = 0;
        let resizeFrame = 0;
        let lastFrame = performance.now();
        let lastDigitChange = lastFrame;
        let width = 0;
        let height = 0;
        let cellWidth = 16;
        let cellHeight = 19;
        let fontSize = 11;
        let columnCount = 0;
        let rowCount = 0;
        let cycleHeight = 0;
        let digits = new Uint8Array();
        let cellOpacity = new Float32Array();
        let columns: GridColumn[] = [];

        const createGrid = () => {
            columnCount = Math.ceil(width / cellWidth) + 1;
            rowCount = Math.ceil(height / cellHeight) + 1;
            cycleHeight = height + cellHeight * 10;
            digits = new Uint8Array(columnCount * rowCount);
            cellOpacity = new Float32Array(columnCount * rowCount);

            for (let index = 0; index < digits.length; index++) {
                digits[index] = Math.random() > 0.5 ? 1 : 0;
                cellOpacity[index] = randomBetween(0.055, 0.115);
            }

            columns = Array.from({ length: columnCount }, () => ({
                head: randomBetween(0, cycleHeight),
                speed: randomBetween(180, 320),
                trail: randomBetween(height * 0.22, height * 0.48)
            }));
        };

        const changeDigits = () => {
            const changes = Math.ceil(digits.length * 0.09);

            for (let index = 0; index < changes; index++) {
                const cell = Math.floor(Math.random() * digits.length);
                digits[cell] = digits[cell] === 0 ? 1 : 0;
            }
        };

        const drawGridLines = () => {
            context.beginPath();

            for (let column = 0; column <= columnCount; column++) {
                const x = column * cellWidth - cellWidth / 2;
                context.moveTo(x, 0);
                context.lineTo(x, height);
            }

            for (let row = 0; row <= rowCount; row++) {
                const y = row * cellHeight - cellHeight / 2;
                context.moveTo(0, y);
                context.lineTo(width, y);
            }

            context.strokeStyle = "rgba(112, 186, 143, 0.025)";
            context.lineWidth = 0.5;
            context.stroke();
        };

        const draw = (time: number) => {
            context.clearRect(0, 0, width, height);
            drawGridLines();

            context.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
            context.textAlign = "center";
            context.textBaseline = "middle";

            for (let column = 0; column < columnCount; column++) {
                const x = column * cellWidth;
                const sweep = columns[column];

                for (let row = 0; row < rowCount; row++) {
                    const y = row * cellHeight;
                    const index = row * columnCount + column;
                    const distance = (sweep.head - y + cycleHeight) % cycleHeight;
                    const isInTrail = distance < sweep.trail;
                    const trailStrength = isInTrail
                        ? Math.pow(1 - distance / sweep.trail, 1.65)
                        : 0;
                    const pulse = (Math.sin(time * 0.006 + column * 0.31 + row * 0.17) + 1) * 0.008;
                    const alpha = Math.min(cellOpacity[index] + trailStrength * 0.38 + pulse, 0.54);
                    const isLeadingCell = distance < cellHeight * 0.8;

                    if (isLeadingCell) {
                        context.fillStyle = `rgba(205, 235, 217, ${alpha})`;
                        context.shadowColor = "rgba(111, 204, 151, 0.32)";
                        context.shadowBlur = 7;
                    } else {
                        context.fillStyle = `rgba(101, 177, 132, ${alpha})`;
                        context.shadowBlur = 0;
                    }

                    context.fillText(digits[index].toString(), x, y);
                }
            }

            context.shadowBlur = 0;
        };

        const resize = () => {
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            cellWidth = width < 640 ? 13 : 16;
            cellHeight = width < 640 ? 16 : 19;
            fontSize = width < 640 ? 9 : 11;

            canvas.width = Math.floor(width * pixelRatio);
            canvas.height = Math.floor(height * pixelRatio);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

            createGrid();
            draw(performance.now());
        };

        const animate = (time: number) => {
            const elapsed = Math.min(time - lastFrame, 64);

            if (elapsed >= 1000 / 30) {
                columns.forEach((column) => {
                    column.head = (column.head + column.speed * (elapsed / 1000)) % cycleHeight;
                });

                if (time - lastDigitChange >= 65) {
                    changeDigits();
                    lastDigitChange = time;
                }

                draw(time);
                lastFrame = time;
            }

            animationFrame = window.requestAnimationFrame(animate);
        };

        const updateMotion = () => {
            window.cancelAnimationFrame(animationFrame);

            if (motionPreference.matches) {
                draw(performance.now());
                return;
            }

            lastFrame = performance.now();
            lastDigitChange = lastFrame;
            animationFrame = window.requestAnimationFrame(animate);
        };

        const handleResize = () => {
            window.cancelAnimationFrame(resizeFrame);
            resizeFrame = window.requestAnimationFrame(resize);
        };

        resize();
        updateMotion();
        window.addEventListener("resize", handleResize);
        motionPreference.addEventListener("change", updateMotion);

        return () => {
            window.cancelAnimationFrame(animationFrame);
            window.cancelAnimationFrame(resizeFrame);
            window.removeEventListener("resize", handleResize);
            motionPreference.removeEventListener("change", updateMotion);
        };
    }, []);

     const currentHour = new Date().getHours();
     
     const greeting = useMemo(() => {
          switch (true) {
               case (currentHour < 12):
                    return "Morning";
               case (currentHour < 18):
                    return "Afternoon";
               default:
                    return "Evening";
          }
     }, [currentHour]);
     
     return (
          <main
               aria-hidden="true"
               className="h-screen fixed inset-0 isolate overflow-hidden bg-[#050705] grid place-items-center"
          >
               <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                    background: [
                         "radial-gradient(circle at 50% 45%, rgba(61, 119, 84, 0.1), transparent 42%)",
                         "linear-gradient(145deg, #090e0a 0%, #050705 60%, #020302 100%)"
                    ].join(", ")
                    }}
               />
     
               <canvas
                    ref={canvasRef}
                    className="pointer-events-none absolute inset-0 h-full w-full"
               />
     
               <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                         background: "radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.38) 100%)"
                    }}
               />
     
               <Panel classes="w-100 shadow-lg">
                    <h1 className="text-white font-semibold text-3xl">Good {greeting}</h1>
                    <p className="font-semibold mb-3.5">Drop files onto this page to upload</p>
                    
                    <div className="flex gap-3.5">
                         <Button classes="w-full" onClick={browseFiles}>Browse Files</Button>

                         <Button type="secondary" title="Upload Folder" onClick={browseFolders} square>
                              <FontAwesomeIcon icon={faFolderOpen} />
                         </Button>

                         <Button type="secondary" title="View Upload History" square>
                              <FontAwesomeIcon icon={faHistory} />
                         </Button>

                         <Button type="secondary" title="Set Upload Password" square>
                              <FontAwesomeIcon icon={faKey} />
                         </Button>
                    </div>

                    <div className="leading-none font-semibold text-xs flex justify-between items-center mt-3 px-px">
                         <div>24h expiration</div>
                         <div>Max 250MB</div>
                    </div>
               </Panel>
          </main>
     );
}