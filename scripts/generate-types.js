const { execSync } = require("child_process");
require("dotenv").config();

// Load the password from .env
const dbPassword = process.env.DUMP_DB_PASS;

// Define the connection string with the password from the environment variable
const supabaseDbUrl = `postgresql://postgres:${dbPassword}@203.161.60.208:5432/postgres`;

try {
  console.log("Generating types...");
  // Construct the command without extra quotes around the connection string
  const command = `npx supabase gen types --lang=typescript --db-url ${supabaseDbUrl} --schema public,auth > types/supabase.ts`;

  execSync(command, { stdio: "inherit", shell: true });

  console.log("Types generated successfully.");
} catch (error) {
  console.error("Error during type generation:", error.message);
  process.exit(1);
}
