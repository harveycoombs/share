"use server";
import { db } from "@/lib/database";
import { generateCode } from "@/lib/utils";
import { generateHash, verify } from "./passwords";

interface User {
     user_id?: string;
     created_at?: number;
     email_address?: string;
     name?: string;
     password?: string;
     access_code?: number;
     auth_code?: number;
     totp_secret?: string;
     discord?: string;
     status?: UserStatus;
}

enum UserStatus {
     Unverified,
     Verified,
     Suspended,
     Deleted
}

export async function getUserByID(userid: string): Promise<User|null> {
     const user = await db()
          .prepare("SELECT user_id, name FROM users WHERE user_id = ? AND status < 3")
          .bind(userid)
          .first<User>();
          
     return user;
}

export async function getUserByEmailAddress(emailAddress: string): Promise<any> {
     const user = await db()
          .prepare("SELECT user_id, name, email_address FROM users WHERE email_address = ? AND status < 3")
          .bind(emailAddress)
          .first();

     return user;
}

export async function getUserDetails(userid: string): Promise<any> {
     const user = await db()
          .prepare("SELECT user_id, name, email_address, created_at, totp_secret, discord_id, status FROM users WHERE user_id = ? AND status < 3")
          .bind(userid)
          .first();

     return user;
}

export async function getPasswordHash(emailAddress: string): Promise<string> {
     const password = await db()
          .prepare("SELECT password FROM users WHERE email_address = ? AND status < 3")
          .bind(emailAddress)
          .first<string>("password");

     return password ?? "";
}

export async function verifyCredentials(emailAddress: string, password: string): Promise<boolean> {
    const hash = await getPasswordHash(emailAddress);

    if (!hash?.length) return false;

    const valid = await verify(password, hash);
    return valid;
}

export async function emailExists(emailAddress: string, userid: string = ""): Promise<boolean> {
     const total = await db()
          .prepare("SELECT COUNT(*) AS total FROM users WHERE email_address = ? AND (user_id = ? OR ? = '') AND status < 3")
          .bind(emailAddress, userid, userid)
          .first<number>("total");

     return !!total;
}

export async function createUser(name: string, emailAddress: string, discordid: string|null = null): Promise<any> {
     const code = discordid?.length ? null : generateCode();
     
     const { meta } = await db()
          .prepare("INSERT INTO users (user_id, created_at, name, email_address, auth_code, discord_id) VALUES()")
          .bind(crypto.randomUUID(), new Date().getTime(), name, emailAddress, code, discordid)
          .run();
     
     return { success: !!meta.changes, code };
}

export async function updateUser(userid: string, name: string, emailAddress: string): Promise<boolean> {
     const { meta } = await db()
          .prepare("UPDATE users SET name = ?, email_address = ? WHERE user_id = ?")
          .bind(name, emailAddress, userid)
          .run();

     return !!meta.changes;
}

export async function updateUserPassword(userid: string, password: string): Promise<boolean> {
     const passwordHash = await generateHash(password);

     const { meta } = await db()
          .prepare("UPDATE users SET password = ? WHERE user_id = ? AND status < 3")
          .bind(passwordHash, userid)
          .run();

     return !!meta.changes;
}

export async function updateUserPasswordByEmail(emailAddress: string, password: string): Promise<boolean> {
     const passwordHash = await generateHash(password);

     const { meta } = await db()
          .prepare("UPDATE users SET password = ? WHERE email_address = ? AND status < 3")
          .bind(passwordHash, emailAddress)
          .run();

     return !!meta.changes;
}

export async function updateUserStatus(userid: string, status: UserStatus): Promise<boolean> {
     const { meta } = await db()
          .prepare("UPDATE users SET status = ? WHERE user_id = ?")
          .bind(status, userid)
          .run();

     return !!meta.changes;
}

export async function verifyUserAccessCode(emailAddress: string, code: string): Promise<boolean> {
     const total = await db()
          .prepare("SELECT COUNT(*) AS total FROM users WHERE email_address = ? AND access_code = ?")
          .bind(emailAddress, code)
          .first<number>("total");

     return !!total;
}

export async function updateUserAccessCode(emailAddress: string, code: string|null): Promise<boolean> {
     const { meta } = await db()
          .prepare("UPDATE users SET access_code = ? WHERE email_address = ?")
          .bind(code, emailAddress)
          .run();

     return !!meta.changes;
}

export async function getUserTOTPSecret(emailAddress: string): Promise<string> {
     const secret = await db()
          .prepare("SELECT totp_secret FROM users WHERE email_address = ? AND status < 3")
          .bind(emailAddress)
          .first<string|null>("totp_secret");

     return secret ?? "";
}

export async function updateUserTOTPSettings(userid: string, secret: string): Promise<boolean> {
     const { meta } = await db()
          .prepare("UPDATE users SET totp_secret = ? WHERE user_id = ?")
          .bind(secret, userid)
          .run();
     
     return !!meta.changes;
}

export async function getUserDiscordIDFromEmail(emailAddress: string): Promise<string> {
     const discordid = await db()
          .prepare("SELECT discord_id FROM users WHERE email_address = ? AND status < 3")
          .bind(emailAddress)
          .first<string|null>("discord_id");

     return discordid ?? "";
}

export async function checkUserPasswordUsage(emailAddress: string): Promise<boolean> {
     const total = await db()
          .prepare("SELECT COUNT(*) AS total FROM users WHERE email_address = ? AND password IS NOT NULL AND password != ''")
          .bind(emailAddress)
          .first<number>("total");

     return !!total;
}