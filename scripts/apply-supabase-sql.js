const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) {
      databaseUrl = match[1];
    }
  }
}

// Candidates to try:
// 1. Direct host: db.pufrmkhblkvdhejecnht.supabase.co:5432
// 2. Session pooler: aws-0-ap-south-1.pooler.supabase.com:5432
// 3. Transaction pooler: aws-0-ap-south-1.pooler.supabase.com:6543
// 4. Raw DATABASE_URL

const connectionCandidates = [
  "postgresql://postgres:Vansh1107%40suthar@db.pufrmkhblkvdhejecnht.supabase.co:5432/postgres",
  "postgresql://postgres.pufrmkhblkvdhejecnht:Vansh1107%40suthar@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
  databaseUrl
].filter(Boolean);

async function connectClient() {
  for (const connStr of connectionCandidates) {
    console.log(`Trying connection... (${connStr.replace(/:[^:@]+@/, ':****@')})`);
    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      console.log('Connected successfully!');
      return client;
    } catch (err) {
      console.warn('Connection failed:', err.message);
      try { await client.end(); } catch (e) {}
    }
  }
  throw new Error('All database connection candidates failed.');
}

async function main() {
  const client = await connectClient();

  const sqlFiles = [
    path.join(__dirname, '..', 'supabase', 'schema.sql'),
    path.join(__dirname, '..', 'supabase', 'clubs.sql'),
    path.join(__dirname, '..', 'supabase', 'governance.sql')
  ];

  for (const filePath of sqlFiles) {
    if (fs.existsSync(filePath)) {
      console.log(`\nApplying SQL file: ${path.basename(filePath)}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      try {
        await client.query(sql);
        console.log(`Successfully applied ${path.basename(filePath)}`);
      } catch (err) {
        console.error(`Error applying ${path.basename(filePath)}:`, err.message);
      }
    }
  }

  // Reload Supabase schema cache
  try {
    console.log('\nNotifying PostgREST to reload schema cache...');
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('PostgREST schema reloaded successfully.');
  } catch (err) {
    console.warn('Could not notify PostgREST:', err.message);
  }

  await client.end();
  console.log('\nAll SQL scripts processed!');
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
