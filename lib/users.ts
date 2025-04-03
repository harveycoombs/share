"use server";
import pool from "./database";
import * as Passwords from "./passwords";

export async function getUserByID(userid: number): Promise<any> {
	const [result]: any = await pool.query("SELECT user_id, first_name, last_name FROM users WHERE user_id = ? AND deleted = 0", [userid]);
	return result[0];
}

export async function getUserByEmailAddress(emailAddress: string): Promise<any> {
	const [result]: any = await pool.query("SELECT user_id, first_name, last_name FROM users WHERE email_address = ? AND deleted = 0", [emailAddress]);
	return result[0];
}


export async function getUserDetails(userid: number): Promise<any> {
    const [result]: any = await pool.query("SELECT user_id, first_name, last_name, email_address, creation_date FROM users WHERE user_id = ? AND deleted = 0", [userid]);
    return result[0];
}

export async function getUserSettings(userid: number): Promise<any> {
    const [result]: any = await pool.query("SELECT * FROM settings WHERE user_id = ?", [userid]);
    return result[0];
}

export async function getPasswordHash(identifier: string | number): Promise<string> {
	const field = typeof identifier == "number" ? "user_id" : "email_address";
	const [result]: any = await pool.query(`SELECT password FROM users WHERE ${field} = ? AND deleted = 0`, [identifier]);

	return result[0]?.password;
}

export async function verifyCredentials(emailAddress: string, password: string): Promise<boolean> {
	const hash = await getPasswordHash(emailAddress);

	if (!hash?.length) return false;

	const valid = await Passwords.verify(password, hash);
	return valid;
}

export async function emailExists(emailAddress: string, userid: number = 0): Promise<boolean> {
	const [result]: any = await pool.query("SELECT COUNT(*) AS total FROM users WHERE email_address = ? AND user_id <> ? AND deleted = 0", [emailAddress, userid]);
	return result[0].total > 0;
}

export async function createUser(firstName: string, lastName: string, emailAddress: string, password: string): Promise<number> {
	const passwordHash = await Passwords.generateHash(password);
	const [result]: any = await pool.query("INSERT INTO users (creation_date, first_name, last_name, email_address, password) VALUES ((SELECT NOW()), ?, ?, ?, ?)", [firstName, lastName, emailAddress, passwordHash]);

	return result?.insertId ?? 0;
}

export async function updateUser(userid: number, firstName: string, lastName: string, emailAddress: string): Promise<boolean> {
    const [result]: any = await pool.query("UPDATE users SET first_name = ?, last_name = ?, email_address = ? WHERE user_id = ?", [firstName, lastName, emailAddress, userid]);
    return result.affectedRows > 0;
}

export async function deleteUser(userid: number): Promise<boolean> {
    const [result]: any = await pool.query("UPDATE users SET deleted = 1 WHERE user_id = ?", [userid]);
    return result.affectedRows > 0;
}

export async function getUploadHistory(userid: number): Promise<any[]> {
    const [result]: any = await pool.query("SELECT *, 0 AS available FROM uploads WHERE user_id = ?", [userid]);
    return result;
}

export async function insertUploadHistory(userid: number, name: string, ip: string, files: number, size: number): Promise<boolean> {
    const [result]: any = await pool.query("INSERT INTO uploads (user_id, name, ip_address, files, size) VALUES (?, ?, ?, ?, ?)", [userid, name, ip, files, size]);
    return result.affectedRows > 0;
}

export async function deleteUpload(userid: number, id: number): Promise<boolean> {
    const [result]: any = await pool.query("DELETE FROM uploads WHERE user_id = ? AND upload_id = ?", [userid, id]);
    return result.affectedRows > 0;
}

export async function renameUpload(userid: number, id: number, name: string): Promise<boolean> {
    const [result]: any = await pool.query("UPDATE uploads SET title = ? WHERE user_id = ? AND upload_id = ?", [name, userid, id]);
    return result.affectedRows > 0;
}