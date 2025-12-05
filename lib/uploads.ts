"use server";
import pool from "./database";
import { generateHash, verify } from "./passwords";

export async function getUploadHistory(userid: string, search: string = ""): Promise<any[]> {
    const filter = search.length ? " AND title LIKE $2" : "";
    const params = search.length ? [userid, `%${search}%`] : [userid];

    const result = await pool.query(`SELECT *, 0 AS available FROM share.uploads WHERE user_id = $1${filter} ORDER BY upload_date DESC`, params);
    return result.rows;
}

export async function insertUploadHistory(userid: string, title: string, ip: string, files: number, size: number, password: string, contentType: string): Promise<string> {
    const passwordHash = password?.length ? await generateHash(password) : "";
    
    const result = await pool.query(
        `WITH new_upload AS (
            INSERT INTO share.uploads (upload_id, user_id, title, ip_address, files, size, upload_date, password, content_type)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), $6, $7)
            RETURNING upload_id
        )
        SELECT upload_id FROM new_upload`,
        [userid, title, ip, files, size, passwordHash, contentType]
    );

    return result.rows[0].upload_id;
}

export async function deleteUpload(userid: string, id: string): Promise<boolean> {
    const result = await pool.query("DELETE FROM share.uploads WHERE user_id = $1 AND upload_id = $2", [userid, id]);
    return result.rowCount ? result.rowCount > 0 : false;
}

export async function renameUpload(userid: string, id: string, name: string): Promise<boolean> {
    const result = await pool.query("UPDATE share.uploads SET title = $1 WHERE user_id = $2 AND upload_id = $3", [name, userid, id]);
    return result.rowCount ? result.rowCount > 0 : false;
}

export async function checkUploadProtection(id: string): Promise<boolean> {
    const result = await pool.query("SELECT password FROM share.uploads WHERE upload_id = $1", [id]);
    return result.rows[0]?.password?.length > 0;
}

export async function getUploadPasswordHash(id: string): Promise<string> {
    const result = await pool.query("SELECT password FROM share.uploads WHERE upload_id = $1", [id]);
    return result.rows[0]?.password ?? "";
}

export async function verifyUploadPassword(id: string, password: string): Promise<boolean> {
    const passwordHash = await getUploadPasswordHash(id);

    if (!passwordHash.length) return true;

    return await verify(password, passwordHash);
}

export async function incrementUploadViews(id: string): Promise<boolean> {
    const result = await pool.query("UPDATE share.uploads SET views = views + 1 WHERE upload_id = $1", [id]);
    return result.rowCount ? result.rowCount > 0 : false;
}

export async function checkPasswordIsSet(id: string): Promise<boolean> {
    const passwordHash = await getUploadPasswordHash(id);
    return passwordHash.length > 0;
}