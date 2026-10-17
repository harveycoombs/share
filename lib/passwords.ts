import bcrypt from "bcryptjs";

export async function generateHash(password: string): Promise<string> {
	try {
		const hash = await bcrypt.hash(password, 12);
		return hash;
	} catch (ex: any) {
		throw ex;
	}
}

export async function verify(password: string, hash: string): Promise<boolean> {
	try {
		const result = await bcrypt.compare(password, hash);
		return result;
	} catch (ex: any) {
		throw ex;
	}
}