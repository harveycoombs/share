import jwt from "jsonwebtoken";
import { getUserByID } from "@/lib/users";

export async function authenticate(token: string): Promise<any> {
	return new Promise((resolve, reject) => {
		if (!token) {
			resolve(null);
		}

		jwt.verify(token, process.env.JWT_SECRET ?? "", async (ex: any, user: any) => {
			if (ex || !user) {
				reject(ex.message);
                return;
			}

			//user = await getUserByID(user.user_id);
			resolve(user);
		});
	});
}

export function createJWT(user: any) {
	const now = new Date();

    return {
		token: jwt.sign(JSON.stringify(user), process.env.JWT_SECRET ?? ""),
		timestamp: now.getTime(),
	};
}