"use client";
import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";

import Button from "@/app/components/ui/button";

export default function Home() {
    let [heading, setHeading] = useState(<h1 className="text-6xl font-semibold">Drop Files onto this Page</h1>);
    let [subheading, setSubheading] = useState(<h2 className="text-xl font-semibold my-8">Share is a no-frills file sharing service designed to be as convenient as possible</h2>);

    return (
        <main className="grid place-items-center h-screen">
            <section className="text-center">
                {heading}
                {subheading}
                <div>
                    <Button classes="mr-2">Browse Files</Button>
                    <Button transparent={true}><FontAwesomeIcon icon={faHistory} /> View Upload History</Button>
                </div>
            </section>
        </main>
    );
}