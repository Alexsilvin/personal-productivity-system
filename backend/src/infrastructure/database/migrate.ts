import { getMigrationStatus, runMigrations } from './migrations.js';

async function main() {
  const command = process.argv[2];

  if (command === 'status') {
    const migrations = await getMigrationStatus();
    console.log(JSON.stringify(migrations, null, 2));
    return;
  }

  const applied = await runMigrations();
  console.log(`Applied migrations: ${applied.length ? applied.join(', ') : 'none'}`);
}

main().catch((error: unknown) => {
  console.error('Migration failed:');

  if (error instanceof Error) {
    console.error(error.stack ?? error.message);
  } else {
    console.error(String(error));
  }

  process.exit(1);
});
