"use server";
import pool from "@/lib/database";
import { generateHash, verify } from "./passwords";

export async function getUserByID(userid: string): Promise<any> {
    const { rows } = await pool.query("SELECT user_id, name FROM users WHERE user_id = $1 AND deleted = FALSE LIMIT 1", [userid]);
    return rows[0] ?? null;
}

export async function getUserByEmailAddress(emailAddress: string): Promise<any> {
    const { rows } = await pool.query("SELECT user_id, name, email_address FROM users WHERE email_address = $1 AND deleted = FALSE LIMIT 1", [emailAddress]);
    return rows[0] ?? null;
}

export async function getUserDetails(userid: string): Promise<any> {
    const { rows } = await pool.query("SELECT user_id, name, email_address, creation_date, totp_secret, discord_id FROM users WHERE user_id = $1 AND deleted = FALSE LIMIT 1", [userid]);
    return rows[0] ?? null;
}

export async function getUserData(userid: string): Promise<any> {
    const { rows } = await pool.query("SELECT user_id, creation_date, email_address, name, discord_id, verified, deleted FROM users WHERE user_id = $1 LIMIT 1", [userid]);
    return rows[0] ?? null;
}

export async function getPasswordHash(identifier: string | number): Promise<string> {
    const field = typeof identifier === "number" ? "user_id" : "email_address";
    const { rows } = await pool.query<{ password: string|null }>(`SELECT password FROM users WHERE ${field} = $1 AND deleted = FALSE LIMIT 1`, [identifier]);
    return rows[0]?.password ?? "";
}

export async function verifyCredentials(emailAddress: string, password: string): Promise<boolean> {
    const hash = await getPasswordHash(emailAddress);

    if (!hash?.length) return false;

    return await verify(password, hash);
}

export async function emailExists(emailAddress: string, userid: string = ""): Promise<boolean> {
    const values = userid.length ? [emailAddress, userid] : [emailAddress];
    const excludeUser = userid.length ? " AND user_id <> $2" : "";
    const { rows } = await pool.query<{ exists: boolean }>(
        `SELECT EXISTS(SELECT 1 FROM users WHERE email_address = $1 AND deleted = FALSE${excludeUser}) AS exists`,
        values
    );
    return rows[0]?.exists ?? false;
}

export async function createUser(name: string, emailAddress: string): Promise<any> {
    const code = crypto.randomUUID();

    try {
        await pool.query(
            "INSERT INTO users (name, email_address, access_code, creation_date) VALUES ($1, $2, $3, $4)",
            [name, emailAddress, code, new Date().toISOString()]
        );
        return { success: true, code };
    } catch {
        return { success: false, code };
    }
}

export async function createUserFromDiscord(name: string, emailAddress: string, discordid: string): Promise<boolean> {
    try {
        await pool.query(
            "INSERT INTO users (name, email_address, discord_id, creation_date) VALUES ($1, $2, $3, $4)",
            [name, emailAddress, discordid, new Date().toISOString()]
        );
        return true;
    } catch {
        return false;
    }
}

export async function updateUser(userid: string, name: string, emailAddress: string): Promise<boolean> {
    return runMutation("UPDATE users SET name = $1, email_address = $2 WHERE user_id = $3", [name, emailAddress, userid]);
}

export async function updateUserPassword(userid: string, password: string): Promise<boolean> {
    const passwordHash = await generateHash(password);
    return runMutation("UPDATE users SET password = $1 WHERE user_id = $2", [passwordHash, userid]);
}

export async function updateUserPasswordByEmail(emailAddress: string, password: string): Promise<boolean> {
    const passwordHash = await generateHash(password);
    return runMutation("UPDATE users SET password = $1 WHERE email_address = $2", [passwordHash, emailAddress]);
}

export async function deleteUser(userid: string): Promise<boolean> {
    return runMutation("UPDATE users SET deleted = TRUE WHERE user_id = $1", [userid]);
}

export async function verifyUserAccessCode(emailAddress: string, code: string): Promise<boolean> {
    const { rows } = await pool.query<{ exists: boolean }>(
        "SELECT EXISTS(SELECT 1 FROM users WHERE email_address = $1 AND access_code = $2) AS exists",
        [emailAddress, code]
    );
    return rows[0]?.exists ?? false;
}

export async function updateUserAccessDate(emailAddress: string): Promise<boolean> {
    return runMutation("UPDATE users SET accessed_at = $1 WHERE email_address = $2", [new Date().toISOString(), emailAddress]);
}

export async function updateUserAccessCode(emailAddress: string, code: string|null): Promise<boolean> {
    return runMutation("UPDATE users SET access_code = $1 WHERE email_address = $2", [code, emailAddress]);
}

export async function checkUserVerification(userid: string): Promise<boolean> {
    const { rows } = await pool.query<{ accessed_at: string|null }>("SELECT accessed_at FROM users WHERE user_id = $1 LIMIT 1", [userid]);
    return !!rows[0]?.accessed_at;
}

export async function getUserTOTPSecret(emailAddress: string): Promise<string> {
    const { rows } = await pool.query<{ totp_secret: string|null }>("SELECT totp_secret FROM users WHERE email_address = $1 AND deleted = FALSE LIMIT 1", [emailAddress]);
    return rows[0]?.totp_secret ?? "";
}

export async function updateUserTOTPSettings(userid: string, secret: string): Promise<boolean> {
    return runMutation("UPDATE users SET totp_secret = $1 WHERE user_id = $2", [secret, userid]);
}

export async function getUserDiscordIDFromEmail(emailAddress: string): Promise<string> {
    const { rows } = await pool.query<{ discord_id: string|null }>("SELECT discord_id FROM users WHERE email_address = $1 LIMIT 1", [emailAddress]);
    return rows[0]?.discord_id ?? "";
}

async function runMutation(query: string, values: unknown[]): Promise<boolean> {
    try {
        await pool.query(query, values);
        return true;
    } catch {
        return false;
    }
}
