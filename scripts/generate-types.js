require("dotenv").config();
const { execSync } = require("child_process");

const dbPassword = process.env.DUMP_DB_PASS;
const command = `npx supabase gen types --lang=typescript --db-url "postgresql://postgres:${dbPassword}@203.161.60.208:5432/postgres" --schema public,auth > types/supabase.ts`;

execSync(command, { stdio: "inherit" });
