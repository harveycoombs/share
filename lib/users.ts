"use server";
import { supabase } from "@/lib/database";
import { generateHash, verify } from "./passwords";

export async function getUserByID(userid: string): Promise<any> {
    const { data, error } = await supabase.from("users").select("user_id, name").eq("user_id", userid).eq("deleted", false).single();

    if (error) throw error;

    return data;
}

export async function getUserByEmailAddress(emailAddress: string): Promise<any> {
    const { data, error } = await supabase.from("users").select("user_id, name").eq("email_address", emailAddress).eq("deleted", false).single();

    if (error) throw error;

    return data;
}

export async function getUserDetails(userid: string): Promise<any> {
    const { data, error } = await supabase.from("users").select("user_id, name, email_address, creation_date, totp_secret, discord_id").eq("user_id", userid).eq("deleted", false).single();

    if (error) throw error;

    return data;
}

export async function getPasswordHash(identifier: string | number): Promise<string> {
    const field = typeof identifier == "number" ? "user_id" : "email_address";
    const { data, error } = await supabase.from("users").select("password").eq(field, String(identifier)).eq("deleted", false).single();
    
    if (error) throw error;

    return data?.password ?? "";
}

export async function verifyCredentials(emailAddress: string, password: string): Promise<boolean> {
    const hash = await getPasswordHash(emailAddress);

    if (!hash?.length) return false;

    const valid = await verify(password, hash);
    return valid;
}

export async function emailExists(emailAddress: string, userid: string = ""): Promise<boolean> {
    let query = supabase.from("users").select("user_id", { count: "exact", head: true }).eq("email_address", emailAddress).eq("deleted", false);
    
    if (userid.length) {
        query = query.neq("user_id", userid);
    }
    
    const { count, error } = await query;

    if (error) throw error;

    return (count ?? 0) > 0;
}

export async function createUser(name: string, emailAddress: string, password: string): Promise<boolean> {
    const passwordHash = await generateHash(password);
    const { error } = await supabase.from("users").insert({
        name,
        email_address: emailAddress,
        password: passwordHash,
        creation_date: new Date().toISOString()
    });

    return !error;
}

export async function createUserFromDiscord(name: string, emailAddress: string, discordid: string): Promise<boolean> {
    const { error } = await supabase.from("users").insert({
        name,
        email_address: emailAddress,
        discord_id: discordid,
        creation_date: new Date().toISOString()
    });

    return !error;
}

export async function updateUser(userid: string, name: string, emailAddress: string): Promise<boolean> {
    const { error } = await supabase.from("users").update({ name, email_address: emailAddress }).eq("user_id", userid);
    return !error;
}

export async function updateUserPassword(userid: string, password: string): Promise<boolean> {
    const passwordHash = await generateHash(password);
    const { error } = await supabase.from("users").update({ password: passwordHash }).eq("user_id", userid);

    return !error;
}

export async function updateUserPasswordByEmail(emailAddress: string, password: string): Promise<boolean> {
    const passwordHash = await generateHash(password);
    const { error } = await supabase.from("users").update({ password: passwordHash }).eq("email_address", emailAddress);

    return !error;
}

export async function updateUserAuthCode(emailAddress: string, code: number|null): Promise<boolean> {
    const result = await supabase.from("users").update({ auth_code: code }).eq("email_address", emailAddress);
    return !result.error;
}

export async function deleteUser(userid: string): Promise<boolean> {
    const { error } = await supabase.from("users").update({ deleted: true }).eq("user_id", userid);
    return !error;
}

export async function verifyUserAuthCode(emailAddress: string, code: number): Promise<boolean> {
    const { count, error } = await supabase.from("users").select("user_id", { count: "exact", head: true }).eq("email_address", emailAddress).eq("auth_code", code);

    if (error) throw error;

    return (count ?? 0) > 0;
}

export async function checkUserVerification(userid: string): Promise<boolean> {
    const { data, error } = await supabase.from("users").select("verified").eq("user_id", userid).single();
    
    if (error) throw error;

    return data?.verified ?? false;
}

export async function updateUserVerification(emailAddress: string, verified: boolean): Promise<boolean> {
    const { error } = await supabase.from("users").update({ verified }).eq("email_address", emailAddress);
    return !error;
}

export async function getUserDiscordIDFromEmail(emailAddress: string): Promise<string> {
    const { data, error } = await supabase.from("users").select("discord_id").eq("email_address", emailAddress).single();
    
    if (error) throw error;

    return data?.discord_id ?? "";
}

export async function getUserTOTPSecret(emailAddress: string): Promise<string> {
    const { data, error } = await supabase.from("users").select("totp_secret").eq("email_address", emailAddress).eq("deleted", false).single();
    
    if (error) throw error;

    return data?.totp_secret ?? "";
}

export async function updateUserTOTPSettings(userid: string, secret: string): Promise<boolean> {
    const { error } = await supabase.from("users").update({ totp_secret: secret }).eq("user_id", userid);
    return !error;
}