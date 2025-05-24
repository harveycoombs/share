"use server";
import pool from "./database";
import { generateHash } from "./passwords";

export async function getUploadHistory(userid: string, search: string): Promise<any[]> {
    const filter = search.length ? " AND title LIKE ?" : "";
    const params = search.length ? [userid, `%${search}%`] : [userid];

    const [result]: any = await pool.query(`SELECT *, 0 AS available FROM uploads WHERE user_id = ?${filter} ORDER BY upload_date DESC`, params);
    return result;
}

export async function insertUploadHistory(userid: string, title: string, ip: string, files: number, size: number, password: string): Promise<string> {
    const passwordHash = password?.length ? await generateHash(password) : "";
    const [result]: any = await pool.query("SET @upload_id = UUID(); INSERT INTO uploads (upload_id, user_id, title, ip_address, files, size, upload_date, password) VALUES (@upload_id, ?, ?, ?, ?, ?, NOW(), ?); SELECT @upload_id AS upload_id", [userid, title, ip, files, size, passwordHash]);

    return result[2][0].upload_id;
}

export async function deleteUpload(userid: string, id: string): Promise<boolean> {
    const [result]: any = await pool.query("DELETE FROM uploads WHERE user_id = ? AND upload_id = ?", [userid, id]);
    return result.affectedRows > 0;
}

export async function renameUpload(userid: string, id: string, name: string): Promise<boolean> {
    const [result]: any = await pool.query("UPDATE uploads SET title = ? WHERE user_id = ? AND upload_id = ?", [name, userid, id]);
    return result.affectedRows > 0;
}

export async function checkUploadProtection(id: string): Promise<boolean> {
    const [result]: any = await pool.query("SELECT password FROM uploads WHERE upload_id = ?", [id]);
    return result[0]?.password?.length;
}

export async function getUploadPasswordHash(id: string): Promise<string> {
    const [result]: any = await pool.query("SELECT password FROM uploads WHERE upload_id = ?", [id]);
    return result[0]?.password;
}

export async function getTotalUploads(): Promise<number> {
    const [result]: any = await pool.query("SELECT COUNT(*) AS total FROM uploads");
    return result[0].total;
}

export async function getTotalUploadsFromGuests(): Promise<number> {
    const [result]: any = await pool.query("SELECT COUNT(*) AS total FROM uploads WHERE user_id IS NULL OR user_id = ''");
    return result[0].total;
}

export async function getTotalUploadsFromRegisteredUsers(): Promise<number> {
    const [result]: any = await pool.query("SELECT COUNT(*) AS total FROM uploads WHERE user_id IS NOT NULL AND user_id <> ''");
    return result[0].total;
}

export async function getTotalUploadsStorageUsed(): Promise<number> {
    const [result]: any = await pool.query("SELECT SUM(size) AS total FROM uploads");
    return result[0].total;
}