"use server";
import { db } from "@/lib/database";

import { generateRandomString } from "@/lib/utils";
import { generateHash, verify } from "@/lib/passwords";

interface Upload {
     upload_id?: string;
     created_at?: number;
     ip_address?: string;
     user_id?: string;
     title?: string;
     files?: number;
     size?: number;
     content_type?: string;
     password?: string;
     views?: number;
     access_id?: string;
}

export async function getUploadHistory(userid: string, search: string = ""): Promise<any[]> {
     const { results } = await db()
          .prepare("SELECT upload_id, upload_date, ip_address, user_id, title, files, size, content_type, views FROM uploads WHERE user_id = ? AND (title LIKE ? OR ? = '')")
          .bind(userid, search)
          .all<Upload>();

     return results?.map(row => ({ ...row, available: 0 })) || [];
}

export async function insertUploadHistory(userid: string, title: string, ip: string, files: number, size: number, password: string, contentType: string): Promise<string> {
     const passwordHash = password?.length ? await generateHash(password) : "";
     
     let accessid = generateRandomString();
     
     while (await checkAccessIDExists(accessid)) {
          accessid = generateRandomString();
     }
     
     const { meta } = await db()
          .prepare("INSERT INTO uploads (upload_id, created_at, access_id, user_id, title, ip_address, files, size, password, content_type) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .bind(crypto.randomUUID(), new Date().getTime(), accessid, userid, title, ip, files, size, passwordHash, contentType)
          .run();
     
     return meta.changes ? accessid : "";
}

export async function deleteUpload(userid: string, id: string): Promise<boolean> {
     const { meta } = await db()
          .prepare("DELETE FROM uploads WHERE user_id = ? AND upload_id = ?")
          .bind(userid, id)
          .run();
     
     return !!meta.changes;
}

export async function renameUpload(userid: string, id: string, name: string): Promise<boolean> {
     const { meta } = await db()
          .prepare("UPDATE uploads SET title = ? WHERE user_id = ? AND upload_id = ?")
          .bind(name, userid, id)
          .run();

     return !!meta.changes;
}

export async function getUploadPasswordHash(id: string): Promise<string> {
     const password = await db()
          .prepare("SELECT password FROM uploads WHERE access_id = ?")
          .bind(id)
          .first<string>("password");

     return password ?? "";
}

export async function verifyUploadPassword(id: string, password: string): Promise<boolean> {
    const passwordHash = await getUploadPasswordHash(id);

    if (!passwordHash.length) return true;

    return await verify(password, passwordHash);
}

export async function incrementUploadViews(id: string): Promise<boolean> {
     const { meta } = await db()
          .prepare("UPDATE uploads SET views = views + 1 WHERE upload_id = ?")
          .bind(id)
          .run();

     return !!meta.changes;
}

export async function checkPasswordIsSet(id: string): Promise<boolean> {
    const passwordHash = await getUploadPasswordHash(id);
    return passwordHash.length > 0;
}

export async function checkAccessIDExists(accessid: string): Promise<boolean> {
     const total = await db()
          .prepare("SELECT COUNT(*) AS total FROM uploads WHERE access_id = ?")
          .bind(accessid)
          .first<number>("total");
     
     return !!total;
}

export async function getUploadTitle(accessid: string): Promise<string> {
     const title = await db()
          .prepare("SELECT title FROM uploads WHERE access_id = ?")
          .bind(accessid)
          .first<string>("total");
     
     return title ?? "";
}