"use server";
import { randomUUID } from "crypto";

import { generateRandomString } from "@/lib/utils";
import { supabase } from "@/lib/database";
import { generateHash, verify } from "@/lib/passwords";

export async function getUploadHistory(userid: string, search: string = ""): Promise<any[]> {
    let query = supabase.from("uploads").select("upload_id, upload_date, ip_address, user_id, title, files, size, content_type, views").eq("user_id", userid).order("upload_date", { ascending: false });

    if (search.length) {
        query = query.ilike("title", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data ?? []).map(row => ({ ...row, available: 0 }));
}

export async function insertUploadHistory(userid: string, title: string, ip: string, files: number, size: number, password: string, contentType: string): Promise<string> {
    const passwordHash = password?.length ? await generateHash(password) : "";
    const uploadId = randomUUID();
    
    let accessId = generateRandomString();

    while (await checkAccessIDExists(accessId)) {
        accessId = generateRandomString();
    }

    const { error } = await supabase.from("uploads").insert({
        upload_id: uploadId,
        access_id: accessId,
        user_id: userid,
        title,
        ip_address: ip,
        files,
        size,
        password: passwordHash,
        content_type: contentType,
    });

    if (error) throw error;

    return accessId;
}

export async function deleteUpload(userid: string, id: string): Promise<boolean> {
    const { error } = await supabase.from("uploads").delete().eq("user_id", userid).eq("upload_id", id);
    return !error;
}

export async function renameUpload(userid: string, id: string, name: string): Promise<boolean> {
    const { error } = await supabase.from("uploads").update({ title: name }).eq("user_id", userid).eq("upload_id", id);
    return !error;
}

export async function checkUploadProtection(id: string): Promise<boolean> {
    const { data, error } = await supabase.from("uploads").select("password").eq("access_id", id).maybeSingle();

    if (error) throw error;

    return (data?.password?.length ?? 0) > 0;
}

export async function getUploadPasswordHash(id: string): Promise<string> {
    const { data, error } = await supabase.from("uploads").select("password").eq("access_id", id).maybeSingle();

    if (error) throw error;

    return data?.password ?? "";
}

export async function verifyUploadPassword(id: string, password: string): Promise<boolean> {
    const passwordHash = await getUploadPasswordHash(id);

    if (!passwordHash.length) return true;

    return await verify(password, passwordHash);
}

export async function incrementUploadViews(id: string): Promise<boolean> {
    const { data: currentData, error: fetchError } = await supabase.from("uploads").select("views").eq("access_id", id).maybeSingle();

    if (fetchError?.message?.length) throw new Error(fetchError.message);

    const currentViews = currentData?.views ?? 0;

    const { error } = await supabase.from("uploads").update({ views: currentViews + 1 }).eq("access_id", id);

    return !error;
}

export async function checkPasswordIsSet(id: string): Promise<boolean> {
    const passwordHash = await getUploadPasswordHash(id);
    return passwordHash.length > 0;
}

export async function checkAccessIDExists(accessid: string): Promise<boolean> {
    const { count, error } = await supabase.from("uploads").select("access_id").eq("access_id", accessid).maybeSingle();

    if (error?.message?.length) throw error;

    return !!count;
}