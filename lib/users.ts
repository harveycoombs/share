"use server";
import { supabase } from "@/lib/database";
import { generateHash, verify } from "./passwords";

export async function getUserByID(userid: string): Promise<any> {
    const { data, error } = await supabase.from("users").select("user_id, name").eq("user_id", userid).eq("deleted", false).maybeSingle();

    if (error) throw error;

    return data;
}

export async function getUserByEmailAddress(emailAddress: string): Promise<any> {
    const { data, error } = await supabase.from("users").select("user_id, name, email_address").eq("email_address", emailAddress).eq("deleted", false).maybeSingle();

    if (error) throw error;

    return data;
}

export async function getUserDetails(userid: string): Promise<any> {
    const { data, error } = await supabase.from("users").select("user_id, name, email_address, creation_date, totp_secret, discord_id").eq("user_id", userid).eq("deleted", false).maybeSingle();

    if (error) throw error;

    return data;
}

export async function getUserData(userid: string): Promise<any> {
    const { data, error } = await supabase.from("users").select("user_id, creation_date, email_address, name, discord_id, verified, deleted").eq("user_id", userid).maybeSingle();

    if (error) throw error;

    return data;
}

export async function getPasswordHash(identifier: string | number): Promise<string> {
    const field = typeof identifier == "number" ? "user_id" : "email_address";
    const { data, error } = await supabase.from("users").select("password").eq(field, String(identifier)).eq("deleted", false).maybeSingle();
    
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

export async function createUser(name: string, emailAddress: string): Promise<any> {
    const code = crypto.randomUUID();

    const { error } = await supabase.from("users").insert({
        name,
        email_address: emailAddress,
        access_code: code,
        creation_date: new Date().toISOString()
    });

    return { success: !error, code };
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

export async function deleteUser(userid: string): Promise<boolean> {
    const { error } = await supabase.from("users").update({ deleted: true }).eq("user_id", userid);
    return !error;
}

export async function verifyUserAccessCode(emailAddress: string, code: string): Promise<boolean> {
    const { count, error } = await supabase.from("users").select("user_id", { count: "exact", head: true }).eq("email_address", emailAddress).eq("access_code", code);

    if (error) throw error;

    return (count ?? 0) > 0;
}

export async function updateUserAccessDate(emailAddress: string): Promise<boolean> {
    const { error } = await supabase.from("users").update({ accessed_at: new Date().toISOString() }).eq("email_address", emailAddress);
    return !error;
}

export async function updateUserAccessCode(emailAddress: string, code: string|null): Promise<boolean> {
    const result = await supabase.from("users").update({ access_code: code }).eq("email_address", emailAddress);
    return !result.error;
}

export async function checkUserVerification(userid: string): Promise<boolean> {
    const { data, error } = await supabase.from("users").select("accessed_at").eq("user_id", userid).maybeSingle();
    
    if (error) throw error;

    return !!data?.accessed_at;
}

export async function getUserTOTPSecret(emailAddress: string): Promise<string> {
    const { data, error } = await supabase.from("users").select("totp_secret").eq("email_address", emailAddress).eq("deleted", false).maybeSingle();
    
    if (error) throw error;

    return data?.totp_secret ?? "";
}

export async function updateUserTOTPSettings(userid: string, secret: string): Promise<boolean> {
    const { error } = await supabase.from("users").update({ totp_secret: secret }).eq("user_id", userid);
    return !error;
}

export async function getUserDiscordIDFromEmail(emailAddress: string): Promise<string> {
    const { data, error } = await supabase.from("users").select("discord_id").eq("email_address", emailAddress).maybeSingle();
    
    if (error) throw error;

    return data?.discord_id ?? "";
}
