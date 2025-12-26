import { NextResponse } from 'next/server';

export async function GET() {
  const postgresUrl = process.env.POSTGRES_URL;
  const postgresPrismaUrl = process.env.POSTGRES_PRISMA_URL;
  const postgresUser = process.env.POSTGRES_USER;
  const postgresHost = process.env.POSTGRES_HOST;
  const postgresDatabase = process.env.POSTGRES_DATABASE;

  const hasPostgresUrl = !!postgresUrl;
  const hasIndividualVars = !!(postgresUser && postgresHost && postgresDatabase);

  return NextResponse.json({
    hasConnectionString: hasPostgresUrl,
    hasIndividualVariables: hasIndividualVars,
    variables: {
      POSTGRES_URL: postgresUrl ? '✓ Set' : '✗ Missing',
      POSTGRES_PRISMA_URL: postgresPrismaUrl ? '✓ Set' : '✗ Missing',
      POSTGRES_USER: postgresUser ? '✓ Set' : '✗ Missing',
      POSTGRES_HOST: postgresHost ? '✓ Set' : '✗ Missing',
      POSTGRES_DATABASE: postgresDatabase ? '✓ Set' : '✗ Missing',
    },
    message: hasPostgresUrl || hasIndividualVars
      ? 'Database connection variables are configured'
      : 'No database connection variables found. Please set POSTGRES_URL or individual Postgres variables.',
    instructions: !hasPostgresUrl && !hasIndividualVars
      ? [
          'If using Vercel Postgres:',
          '1. Go to your Vercel project dashboard',
          '2. Navigate to Storage tab',
          '3. Create a new Postgres database',
          '4. The connection strings will be automatically added',
          '',
          'If using a different Postgres provider:',
          '1. Add POSTGRES_URL to your .env.local file',
          '2. Format: postgres://user:password@host:port/database',
        ]
      : null,
  });
}

