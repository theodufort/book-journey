const { execSync } = require("child_process");
require("dotenv").config();

// Load the password from .env
const dbPassword = process.env.DUMP_DB_PASS;

// Define the connection string with the password from the environment variable
const supabaseDbUrl = `postgresql://postgres:${dbPassword}@203.161.60.208:5432/postgres`;

try {
  console.log("Backing up roles...");
  execSync(
    `npx supabase db dump --db-url "${supabaseDbUrl}" -f roles.sql --role-only --debug`,
    { stdio: "inherit" }
  );

  console.log("Backing up schema...");
  execSync(`npx supabase db dump --db-url "${supabaseDbUrl}" -f schema.sql`, {
    stdio: "inherit",
  });

  console.log("Backing up data...");
  execSync(
    `npx supabase db dump --db-url "${supabaseDbUrl}" -f data.sql --data-only --use-copy`,
    { stdio: "inherit" }
  );

  console.log("Backup completed successfully.");
} catch (error) {
  console.error("Error during backup:", error.message);
  process.exit(1);
}
