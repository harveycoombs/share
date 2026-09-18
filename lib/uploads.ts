"use server";
import { randomUUID } from "crypto";

import pool from "@/lib/database";
import { generateHash, verify } from "@/lib/passwords";
import { generateRandomString } from "@/lib/utils";

export async function getUploadHistory(userid: string, search: string = ""): Promise<any[]> {
    const values: string[] = [userid];
    let searchCondition = "";

    if (search.length) {
        values.push(`%${search}%`);
        searchCondition = ` AND title ILIKE $${values.length}`;
    }

    const { rows } = await pool.query(
        `SELECT upload_id, created_at, ip_address, user_id, title, files, size, content_type, views
         FROM uploads
         WHERE user_id = $1${searchCondition}
         ORDER BY created_at DESC`,
        values
    );

    return rows.map(row => ({ ...row, available: 0 }));
}

export async function insertUploadHistory(userid: string, title: string, ip: string, files: number, size: number, password: string, contentType: string): Promise<string> {
    const passwordHash = password?.length ? await generateHash(password) : "";
    const uploadId = randomUUID();

    let accessId = generateRandomString();

    while (await checkAccessIDExists(accessId)) {
        accessId = generateRandomString();
    }

    await pool.query(
        `INSERT INTO uploads (upload_id, access_id, user_id, title, ip_address, files, size, password, content_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [uploadId, accessId, userid, title, ip, files, size, passwordHash, contentType]
    );

    return accessId;
}

export async function deleteUpload(userid: string, id: string): Promise<boolean> {
    try {
        await pool.query("DELETE FROM uploads WHERE user_id = $1 AND upload_id = $2", [userid, id]);
        return true;
    } catch {
        return false;
    }
}

export async function renameUpload(userid: string, id: string, name: string): Promise<boolean> {
    try {
        await pool.query("UPDATE uploads SET title = $1 WHERE user_id = $2 AND upload_id = $3", [name, userid, id]);
        return true;
    } catch {
        return false;
    }
}

export async function checkUploadProtection(id: string): Promise<boolean> {
    const { rows } = await pool.query<{ password: string|null }>("SELECT password FROM uploads WHERE access_id = $1 LIMIT 1", [id]);
    return (rows[0]?.password?.length ?? 0) > 0;
}

export async function getUploadPasswordHash(id: string): Promise<string> {
    const { rows } = await pool.query<{ password: string|null }>("SELECT password FROM uploads WHERE access_id = $1 LIMIT 1", [id]);
    return rows[0]?.password ?? "";
}

export async function verifyUploadPassword(id: string, password: string): Promise<boolean> {
    const passwordHash = await getUploadPasswordHash(id);

    if (!passwordHash.length) return true;

    return await verify(password, passwordHash);
}

export async function incrementUploadViews(id: string): Promise<boolean> {
    try {
        await pool.query("UPDATE uploads SET views = COALESCE(views, 0) + 1 WHERE access_id = $1", [id]);
        return true;
    } catch {
        return false;
    }
}

export async function checkPasswordIsSet(id: string): Promise<boolean> {
    const passwordHash = await getUploadPasswordHash(id);
    return passwordHash.length > 0;
}

export async function checkAccessIDExists(accessid: string): Promise<boolean> {
    const { rows } = await pool.query<{ exists: boolean }>("SELECT EXISTS(SELECT 1 FROM uploads WHERE access_id = $1) AS exists", [accessid]);
    return rows[0]?.exists ?? false;
}
