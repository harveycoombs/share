"use client";
import { useState, useEffect } from "react";

interface Properties {
     on?: boolean;
     onChange: (on: boolean) => void;
     classes?: string;
     [key: string]: any;
}

export default function Switch({ on = false, onChange, classes = "", ...rest }: Properties) {
     const [checked, setChecked] = useState<boolean>(on);

     useEffect(() => {
          onChange(checked);
     }, [checked]);
     
     return (
          <button className={`p-1.5 w-14 text-sm leading-none border ${checked ? "border-green-500/50 bg-green-500/20" : "border-white/25 bg-white/10"} rounded-md cursor-pointer duration-150 ${classes}`} onClick={() => setChecked(!checked)} {...rest}>
               <div className={`w-1/2 aspect-square bg-white rounded duration-150 ${checked ? "ml-5.25" : ""}`}></div>
          </button>
     );
}