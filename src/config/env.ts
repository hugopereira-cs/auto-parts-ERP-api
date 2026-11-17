import { z } from "zod";
import "dotenv/config";

export const envSchema = z.object({
	PORT: z.coerce.number().int().positive().default(3333),
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error("Variáveis de ambiente inválidas: ");
	console.error(JSON.stringify(_env.error.format(), null, 2));
	process.exit(1);
}

export const env = _env.data;
export type Env = z.infer<typeof envSchema>;
