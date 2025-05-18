import { NextResponse } from "next/server";
import fs from "fs/promises";
import mime from "mime";

import { getTotalUsers, getTotalVerifiedUsers, getTotalUnverifiedUsers, getTotalDeletedUsers } from "@/lib/users";
import { getTotalUploads, getTotalUploadsFromGuests, getTotalUploadsFromRegisteredUsers, getTotalUploadsStorageUsed } from "@/lib/uploads";

export async function GET(): Promise<NextResponse> {
    const totalUsers = await getTotalUsers();
    const totalVerifiedUsers = await getTotalVerifiedUsers();
    const totalUnverifiedUsers = await getTotalUnverifiedUsers();
    const totalDeletedUsers = await getTotalDeletedUsers();

    const totalUploads = await getTotalUploads();
    const totalUploadsFromGuests = await getTotalUploadsFromGuests();
    const totalUploadsFromRegisteredUsers = await getTotalUploadsFromRegisteredUsers();
    const storageUsed = await getTotalUploadsStorageUsed();

    const contentTypes = (await Promise.all((await fs.readdir("./uploads/")).filter(directory => directory != "avatars").map(async (directory) => {
        const files = await fs.readdir(`./uploads/${directory}`);
        return files.map(file => mime.getType(file));
    }))).flat().filter(file => file);

    const distinctContentTypes = contentTypes.filter((type, i, list) => list.indexOf(type) == i);
    const mostCommonContentType = distinctContentTypes.sort((x, y) => contentTypes.filter(type => type == y).length - contentTypes.filter(type => type == x).length)[0];

    return NextResponse.json({ totalUsers, totalVerifiedUsers, totalUnverifiedUsers, totalDeletedUsers, totalUploads, totalUploadsFromGuests, totalUploadsFromRegisteredUsers, storageUsed, mostCommonContentType }, { status: 200 });
}