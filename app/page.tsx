"use client";
import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faKey } from "@fortawesome/free-solid-svg-icons";
import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";

import Button from "@/app/components/common/Button";

type GridColumn = {
    head: number;
    speed: number;
    trail: number;
};

const randomBetween = (minimum: number, maximum: number) => (
    Math.random() * (maximum - minimum) + minimum
);

export default function Home() {
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

     return (
          <main
               aria-hidden="true"
               className="fixed inset-0 isolate overflow-hidden bg-[#050705] grid place-items-center"
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
     
               <section className="p-4 backdrop-blur-md border border-white/15 bg-white/5 rounded w-100">
                    <ul>
                         <li>Uploads expire after 24 hours</li>
                         <li>250MB Upload Limit</li>
                    </ul>
                    
                    <div className="flex gap-3.5">
                         <Button classes="w-full">Browse Files</Button>

                         <Button type="secondary" title="Upload Folder" square>
                              <FontAwesomeIcon icon={faFolderOpen} />
                         </Button>

                         <Button type="secondary" title="View Upload History" square>
                              <FontAwesomeIcon icon={faHistory} />
                         </Button>

                         <Button type="secondary" title="Set Upload Password" square>
                              <FontAwesomeIcon icon={faKey} />
                         </Button>
                    </div>
               </section>
          </main>
     );
}
