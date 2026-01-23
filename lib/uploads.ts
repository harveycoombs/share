"use server";
import { supabase } from "./database";
import { generateHash, verify } from "./passwords";
import { randomUUID } from "crypto";

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
    
    const { data, error } = await supabase.from("uploads").insert({
        upload_id: uploadId,
        user_id: userid,
        title,
        ip_address: ip,
        files,
        size,
        password: passwordHash,
        content_type: contentType,
    }).select("upload_id").single();

    if (error) throw error;

    return data?.upload_id ?? "";
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
    const { data, error } = await supabase.from("uploads").select("password").eq("upload_id", id).single();

    if (error) throw error;

    return (data?.password?.length ?? 0) > 0;
}

export async function getUploadPasswordHash(id: string): Promise<string> {
    const { data, error } = await supabase.from("uploads").select("password").eq("upload_id", id).single();

    if (error) throw error;

    return data?.password ?? "";
}

export async function verifyUploadPassword(id: string, password: string): Promise<boolean> {
    const passwordHash = await getUploadPasswordHash(id);

    if (!passwordHash.length) return true;

    return await verify(password, passwordHash);
}

export async function incrementUploadViews(id: string): Promise<boolean> {
    const { data: currentData, error: fetchError } = await supabase.from("uploads").select("views").eq("upload_id", id).single();

    if (fetchError?.message?.length) throw new Error(fetchError.message);

    const currentViews = currentData?.views ?? 0;

    const { error } = await supabase.from("uploads").update({ views: currentViews + 1 }).eq("upload_id", id);

    return !error;
}

export async function checkPasswordIsSet(id: string): Promise<boolean> {
    const passwordHash = await getUploadPasswordHash(id);
    return passwordHash.length > 0;
}