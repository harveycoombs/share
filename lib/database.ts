import { createClient } from "@supabase/supabase-js";

import { Database } from "@/lib/supabase";
import getEnvironmentVariables from "@/lib/variables";

const env = await getEnvironmentVariables();
export const supabase = createClient<Database>(env.SUPABASE_URL!, env.SUPABASE_KEY!);