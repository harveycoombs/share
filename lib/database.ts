import { getCloudflareContext } from "@opennextjs/cloudflare";

export const db = () => getCloudflareContext().env.DB;