"use server";
import pool from "./database";
import { generateHash, verify } from "./passwords";

export async function getUserByID(userid: string): Promise<any> {
    const result = await pool.query("SELECT user_id, name FROM share.users WHERE user_id = $1 AND deleted = false", [userid]);
    return result.rows[0];
}

export async function getUserByEmailAddress(emailAddress: string): Promise<any> {
    const result = await pool.query("SELECT user_id, name FROM share.users WHERE email_address = $1 AND deleted = false", [emailAddress]);
    return result.rows[0];
}

export async function getUserDetails(userid: string): Promise<any> {
    const result = await pool.query("SELECT user_id, name, email_address, creation_date FROM share.users WHERE user_id = $1 AND deleted = false", [userid]);
    return result.rows[0];
}

export async function getUserSettings(userid: string): Promise<any> {
    const result = await pool.query("SELECT * FROM settings WHERE user_id = $1", [userid]);
    return result.rows[0];
}

export async function getPasswordHash(identifier: string | number): Promise<string> {
    const field = typeof identifier == "number" ? "user_id" : "email_address";
    const result = await pool.query(`SELECT password FROM share.users WHERE ${field} = $1 AND deleted = false`, [identifier]);
    return result.rows[0]?.password;
}

export async function verifyCredentials(emailAddress: string, password: string): Promise<boolean> {
    const hash = await getPasswordHash(emailAddress);

    if (!hash?.length) return false;

    const valid = await verify(password, hash);
    return valid;
}

export async function emailExists(emailAddress: string, userid: string|null = null): Promise<boolean> {
    const result = await pool.query("SELECT COUNT(*) AS total FROM share.users WHERE email_address = $1 AND user_id <> $2 AND deleted = false", [emailAddress, userid]);
    return parseInt(result.rows[0].total) > 0;
}

export async function createUser(name: string, emailAddress: string, password: string): Promise<boolean> {
    const passwordHash = await generateHash(password);
    const result = await pool.query(
        "INSERT INTO share.users (user_id, creation_date, name, email_address, password) VALUES (gen_random_uuid(), NOW(), $1, $2, $3)",
        [name, emailAddress, passwordHash]
    );
    return result.rowCount ? result.rowCount > 0 : false;
}

export async function updateUser(userid: string, name: string, emailAddress: string): Promise<boolean> {
    const result = await pool.query("UPDATE share.users SET name = $1, email_address = $2 WHERE user_id = $3", [name, emailAddress, userid]);
    return result.rowCount ? result.rowCount > 0 : false;
}

export async function updateUserPassword(userid: string, password: string): Promise<boolean> {
    const passwordHash = await generateHash(password);
    const result = await pool.query("UPDATE share.users SET password = $1 WHERE user_id = $2", [passwordHash, userid]);
    return result.rowCount ? result.rowCount > 0 : false;
}

export async function updateUserAuthCode(emailAddress: string, code: number|null): Promise<boolean> {
    const result = await pool.query("UPDATE share.users SET auth_code = $1 WHERE email_address = $2", [code, emailAddress]);
    return result.rowCount ? result.rowCount > 0 : false;
}

export async function deleteUser(userid: string): Promise<boolean> {
    const result = await pool.query("UPDATE share.users SET deleted = true WHERE user_id = $1", [userid]);
    return result.rowCount ? result.rowCount > 0 : false;
}

export async function verifyUserAuthCode(emailAddress: string, code: number): Promise<boolean> {
    const result = await pool.query("SELECT COUNT(*) AS total FROM share.users WHERE email_address = $1 AND auth_code = $2", [emailAddress, code]);
    return parseInt(result.rows[0].total) > 0;
}

export async function checkUserVerification(userid: string): Promise<boolean> {
    const result = await pool.query("SELECT verified FROM share.users WHERE user_id = $1", [userid]);
    return result.rows[0]?.verified || false;
}

export async function updateUserVerification(emailAddress: string, verified: boolean): Promise<boolean> {
    const result = await pool.query("UPDATE share.users SET verified = $1 WHERE email_address = $2", [verified, emailAddress]);
    return result.rowCount ? result.rowCount > 0 : false;
}

export async function getUserDiscordIDFromEmail(emailAddress: string): Promise<string> {
    const result = await pool.query("SELECT discord_id FROM share.users WHERE email_address = $1", [emailAddress]);
    return result.rows[0]?.discord_id ?? "";
}