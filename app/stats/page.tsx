"use client";
import { useState, useEffect } from "react";

import { formatBytes } from "@/lib/utils";

export default function Stats() {
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [totalVerifiedUsers, setTotalVerifiedUsers] = useState<number>(0);
    const [totalUnverifiedUsers, setTotalUnverifiedUsers] = useState<number>(0);
    const [totalDeletedUsers, setTotalDeletedUsers] = useState<number>(0);
    
    const [totalUploads, setTotalUploads] = useState<number>(0);
    const [totalUploadsFromGuests, setTotalUploadsFromGuests] = useState<number>(0);
    const [totalUploadsFromRegisteredUsers, setTotalUploadsFromRegisteredUsers] = useState<number>(0);
    const [totalUploadsStorageUsed, setTotalUploadsStorageUsed] = useState<number>(0);

    const [mostCommonContentType, setMostCommonContentType] = useState<string>("");

    useEffect(() => {
        (async () => {
            const response = await fetch("/api/stats");

            if (!response.ok) return;

            const data = await response.json();

            setTotalUsers(data.totalUsers);
            setTotalVerifiedUsers(data.totalVerifiedUsers);
            setTotalUnverifiedUsers(data.totalUnverifiedUsers);
            setTotalDeletedUsers(data.totalDeletedUsers);
            setTotalUploads(data.totalUploads);
            setTotalUploadsFromGuests(data.totalUploadsFromGuests);
            setTotalUploadsFromRegisteredUsers(data.totalUploadsFromRegisteredUsers);
            setTotalUploadsStorageUsed(data.storageUsed);
        })();
    }, []);

    return (
        <main className="h-[calc(100vh-122px)] p-4">
            <div className="grid grid-cols-4 gap-4">
                <StatisticPanel title="Uploads">
                    <StatisticField label="Total" value={totalUploads} />
                    <StatisticField label="Storage Used" value={formatBytes(totalUploadsStorageUsed)} />
                    <StatisticField label="Most Common File Type" value={mostCommonContentType} />
                    <StatisticField label="Uploads From Guests" value={totalUploadsFromGuests} />
                    <StatisticField label="Uploads From Registered Users" value={totalUploadsFromRegisteredUsers} />
                </StatisticPanel>

                <StatisticPanel title="Accounts">
                    <StatisticField label="Total" value={totalUsers} />
                    <StatisticField label="Verified Users" value={totalVerifiedUsers} />
                    <StatisticField label="Unverified Users" value={totalUnverifiedUsers} />
                    <StatisticField label="Deleted Users" value={totalDeletedUsers} />
                </StatisticPanel>
            </div>
        </main>
    );
}

function StatisticPanel({ title, children }: any) {
    return (
        <div className="py-3 px-4 border border-slate-300 rounded-lg">
            <strong className="block text-sm text-slate-600 font-bold select-none mb-1.5">{title}</strong>
            {children}
        </div>
    );
}

function StatisticField({ label, value }: any) {
    return (
        <div className="flex items-center mt-3">
            <div className="w-1/2 text-slate-400 select-none">{label}</div>
            <div className="w-1/2 font-bold text-right">{value}</div>
        </div>
    );
}