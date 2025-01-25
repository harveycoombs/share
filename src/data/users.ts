"use server";
import pool from "./database";
import * as Passwords from "./passwords";

export async function getUserByID(userid: number): Promise<any> {
	const [result]: any = await pool.query("SELECT user_id, first_name, last_name FROM users WHERE user_id = ?", [userid]);
	return result[0];
}

export async function getUserByEmailAddress(emailAddress: string): Promise<any> {
	const [result]: any = await pool.query("SELECT user_id, first_name, last_name FROM users WHERE email_address = ?", [emailAddress]);
	return result[0];
}


export async function getUserDetails(userid: number): Promise<any> {
    const [result]: any = await pool.query("SELECT user_id, first_name, last_name, email_address, creation_date FROM users WHERE user_id = ?", [userid]);
    return result[0];
}

export async function getUserSettings(userid: number): Promise<any> {
    const [result]: any = await pool.query("SELECT * FROM settings WHERE user_id = ?", [userid]);
    return result[0];
}

export async function getPasswordHash(identifier: string | number): Promise<string> {
	const field = typeof identifier == "number" ? "user_id" : "email_address";
	const [result]: any = await pool.query(`SELECT password FROM users WHERE ${field} = ?`, [identifier]);

	return result[0]?.password;
}

export async function verifyCredentials(emailAddress: string, password: string): Promise<boolean> {
	const hash = await getPasswordHash(emailAddress);

	if (!hash?.length) return false;

	const valid = await Passwords.verify(password, hash);
	return valid;
}

export async function emailExists(emailAddress: string): Promise<boolean> {
	const [result]: any = await pool.query("SELECT COUNT(*) AS total FROM users WHERE email_address = ?", [emailAddress]);
	return result[0].total;
}

export async function createUser(firstName: string, lastName: string, emailAddress: string, password: string): Promise<number> {
	const passwordHash = await Passwords.generateHash(password);
	const [result]: any = await pool.query("INSERT INTO users (creation_date, first_name, last_name, email_address, password) VALUES ((SELECT NOW()), ?, ?, ?, ?)", [firstName, lastName, emailAddress, passwordHash]);

	return result?.insertId ?? 0;
}

export async function getUploadHistory(userid: number): Promise<any[]> {
    const [result]: any = await pool.query("SELECT *, 0 AS available FROM uploads WHERE user_id = ?", [userid]);
    return result;
}

export async function insertUploadHistory(userid: number, name: string, files: number, size: number): Promise<boolean> {
    const [result]: any = await pool.query("INSERT INTO uploads (user_id, name, files, size) VALUES (?, ?, ?, ?)", [userid, name, files, size]);
    return result.affectedRows > 0;
}

export async function deleteUpload(userid: number, id: number): Promise<boolean> {
    const [result]: any = await pool.query("DELETE FROM uploads WHERE user_id = ? AND upload_id = ?", [userid, id]);
    return result.affectedRows > 0;
}

export async function renameUpload(userid: number, id: number, name: string): Promise<boolean> {
    const [result]: any = await pool.query("UPDATE uploads SET name = ? WHERE user_id = ? AND upload_id = ?", [name, userid, id]);
    return result.affectedRows > 0;
}