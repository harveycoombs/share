import { NextResponse } from "next/server";
import * as fs from "fs/promises";

import { getTotalUsers, getTotalVerifiedUsers, getTotalUnverifiedUsers, getTotalDeletedUsers, getOldestUser, getNewestUser, getTotalUploads, getTotalUploadsFromGuests, getTotalUploadsFromRegisteredUsers } from "@/lib/users";

export async function GET(): Promise<NextResponse> {
    const totalUsers = await getTotalUsers();
    const totalVerifiedUsers = await getTotalVerifiedUsers();
    const totalUnverifiedUsers = await getTotalUnverifiedUsers();
    const totalDeletedUsers = await getTotalDeletedUsers();
    const oldestUser = await getOldestUser();
    const newestUser = await getNewestUser();

    const totalUploads = await getTotalUploads();
    const totalUploadsFromGuests = await getTotalUploadsFromGuests();
    const totalUploadsFromRegisteredUsers = await getTotalUploadsFromRegisteredUsers();

    const storageUsed = (await Promise.all((await fs.readdir("./uploads")).map(async (upload) => {
        const stats = await fs.stat(`./uploads/${upload}`);

        console.log(stats);

        return stats.size;
    }))).reduce((a, b) => a + b, 0);

    return NextResponse.json({ totalUsers, totalVerifiedUsers, totalUnverifiedUsers, totalDeletedUsers, oldestUser, newestUser, totalUploads, totalUploadsFromGuests, totalUploadsFromRegisteredUsers, storageUsed }, { status: 200 });
}