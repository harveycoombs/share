import jwt from "jsonwebtoken";

import getEnvironmentVariables from "@/lib/variables";

export async function authenticate(token: string): Promise<any> {
     const env = await getEnvironmentVariables();

	return new Promise((resolve, _) => {
		if (!token) {
			resolve(null);
		}

		jwt.verify(token, env.JWT_SECRET!, async (ex: any, user: any) => {
			if (ex || !user) {
				resolve(null);
                return;
			}

			resolve(user);
		});
	});
}

export async function createJWT(user: any) {
     const env = await getEnvironmentVariables();
     
     const now = new Date();
     
     return {
          token: jwt.sign(JSON.stringify(user), env.JWT_SECRET!),
          timestamp: now.getTime()
     };
}