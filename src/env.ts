import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === 'test') {
    console.log("Using test environment variables");
    config({ path: '.env.test' });
} else {
    console.log("Using production environment variables");
    config();
}

const envSchema = z.object({
    DATABASE_URL: z.string(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
    PORT: z.string().default("3000")
})

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
    console.error("Invalid environment variables", _env.error.format());
    throw new Error("Invalid environment variables");
}

export const env = _env.data;