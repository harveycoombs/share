import { NextResponse } from "next/server";

import { getTotalUsers, getTotalVerifiedUsers, getTotalUnverifiedUsers, getTotalDeletedUsers, getTotalUploads, getTotalUploadsFromGuests, getTotalUploadsFromRegisteredUsers, getTotalUploadsStorageUsed } from "@/lib/users";

export async function GET(): Promise<NextResponse> {
    const totalUsers = await getTotalUsers();
    const totalVerifiedUsers = await getTotalVerifiedUsers();
    const totalUnverifiedUsers = await getTotalUnverifiedUsers();
    const totalDeletedUsers = await getTotalDeletedUsers();

    const totalUploads = await getTotalUploads();
    const totalUploadsFromGuests = await getTotalUploadsFromGuests();
    const totalUploadsFromRegisteredUsers = await getTotalUploadsFromRegisteredUsers();
    const storageUsed = await getTotalUploadsStorageUsed();

    return NextResponse.json({ totalUsers, totalVerifiedUsers, totalUnverifiedUsers, totalDeletedUsers, totalUploads, totalUploadsFromGuests, totalUploadsFromRegisteredUsers, storageUsed }, { status: 200 });
}