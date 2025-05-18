"use server";
import pool from "./database";
import { generateHash, verify } from "./passwords";

export async function getUserByID(userid: string): Promise<any> {
	const [result]: any = await pool.query("SELECT user_id, first_name, last_name FROM users WHERE user_id = ? AND deleted = 0", [userid]);
	return result[0];
}

export async function getUserByEmailAddress(emailAddress: string): Promise<any> {
	const [result]: any = await pool.query("SELECT user_id, first_name, last_name FROM users WHERE email_address = ? AND deleted = 0", [emailAddress]);
	return result[0];
}

export async function getUserDetails(userid: string): Promise<any> {
    const [result]: any = await pool.query("SELECT user_id, first_name, last_name, email_address, creation_date FROM users WHERE user_id = ? AND deleted = 0", [userid]);
    return result[0];
}

export async function getUserSettings(userid: string): Promise<any> {
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

	const valid = await verify(password, hash);
	return valid;
}

export async function emailExists(emailAddress: string, userid: string|null = null): Promise<boolean> {
	const [result]: any = await pool.query("SELECT COUNT(*) AS total FROM users WHERE email_address = ? AND user_id <> ? AND deleted = 0", [emailAddress, userid]);
	return result[0].total > 0;
}

export async function createUser(firstName: string, lastName: string, emailAddress: string, password: string): Promise<boolean> {
	const passwordHash = await generateHash(password);
	const [result]: any = await pool.query("INSERT INTO users (user_id, creation_date, first_name, last_name, email_address, password) VALUES ((SELECT UUID()), (SELECT NOW()), ?, ?, ?, ?)", [firstName, lastName, emailAddress, passwordHash]);

	return result.affectedRows > 0;
}

export async function updateUser(userid: string, firstName: string, lastName: string, emailAddress: string): Promise<boolean> {
    const [result]: any = await pool.query("UPDATE users SET first_name = ?, last_name = ?, email_address = ? WHERE user_id = ?", [firstName, lastName, emailAddress, userid]);
    return result.affectedRows > 0;
}

export async function updateUserPassword(userid: string, password: string): Promise<boolean> {
    const passwordHash = await generateHash(password);
    const [result]: any = await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [passwordHash, userid]);

    return result.affectedRows > 0;
}

export async function updateUserAuthCode(emailAddress: string, code: number): Promise<boolean> {
    const [result]: any = await pool.query("UPDATE users SET auth_code = ? WHERE email_address = ?", [code, emailAddress]);
    return result.affectedRows > 0;
}

export async function deleteUser(userid: string): Promise<boolean> {
    const [result]: any = await pool.query("UPDATE users SET deleted = 1 WHERE user_id = ?", [userid]);
    return result.affectedRows > 0;
}

export async function verifyUserAuthCode(emailAddress: string, code: number): Promise<boolean> {
    const [result]: any = await pool.query("SELECT COUNT(*) AS total FROM users WHERE email_address = ? AND auth_code = ?", [emailAddress, code]);
    return result[0].total > 0;
}

export async function getTotalUsers(): Promise<any> {
    const [result]: any = await pool.query("SELECT COUNT(*) AS total FROM users");
    return result[0].total;
}

export async function getTotalVerifiedUsers(): Promise<number> {
    const [result]: any = await pool.query("SELECT COUNT(*) AS total FROM users WHERE verified = 1");
    return result[0].total;
}

export async function getTotalUnverifiedUsers(): Promise<number> {
    const [result]: any = await pool.query("SELECT COUNT(*) AS total FROM users WHERE verified = 0");
    return result[0].total;
}

export async function getTotalDeletedUsers(): Promise<number> {
    const [result]: any = await pool.query("SELECT COUNT(*) AS total FROM users WHERE deleted = 1");
    return result[0].total;
}

export async function getOldestUser(): Promise<any> {
    const [result]: any = await pool.query("SELECT * FROM users ORDER BY creation_date ASC LIMIT 1");
    return result[0];
}

export async function getNewestUser(): Promise<any> {
    const [result]: any = await pool.query("SELECT * FROM users ORDER BY creation_date DESC LIMIT 1");
    return result[0];
}