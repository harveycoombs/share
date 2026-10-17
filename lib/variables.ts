"server only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export default async function getEnvironmentVariables() {
     const { env } = await getCloudflareContext({ async: true });
     return env;
}