import { NextResponse } from "next/server";

import { getTotalUsers } from "@/lib/users";
import { getTotalUploadedSize, getTotalUploadViews } from "@/lib/uploads";

export async function GET(_: Request): Promise<NextResponse> {
    try {
        const totalUsers = await getTotalUsers();
        const totalUploadedSize = await getTotalUploadedSize();
        const totalUploadViews = await getTotalUploadViews();
    
        return NextResponse.json({ totalUsers, totalUploadedSize, totalUploadViews });
    } catch (ex: any) {
        return NextResponse.json({ error: ex.message }, { status: 500 });
    }    
}