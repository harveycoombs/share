import { createClient } from "@supabase/supabase-js";

import { Database } from "@/lib/supabase";
import getEnvironmentVariables from "@/lib/variables";

export default async function getSupabaseClient() {
     const env = await getEnvironmentVariables();
     return createClient<Database>(env.SUPABASE_URL!, env.SUPABASE_KEY!);
}