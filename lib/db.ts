import postgres from "postgres";

export interface Film {
  id: number;
  tmdb_id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number;
  watched: boolean;
  added_at: string;
}

// Get connection string - prefer non-pooling for Supabase, fallback to regular URL
function getConnectionString(): string {
  // For Supabase, use non-pooling URL for better compatibility
  const nonPoolingUrl = process.env.POSTGRES_URL_NON_POOLING;
  if (nonPoolingUrl) {
    return nonPoolingUrl;
  }

  const postgresUrl = process.env.POSTGRES_URL;
  if (!postgresUrl) {
    throw new Error(
      "POSTGRES_URL or POSTGRES_URL_NON_POOLING environment variable is not set. " +
        "Please set it in your .env.local file or Vercel project settings."
    );
  }

  // Clean up malformed connection strings (remove invalid parameters)
  return postgresUrl
    .replace(/[?&]supa=[^&]*/g, "")
    .replace(/[?&]base-pooler\.x[^&]*/g, "");
}

// Create a single connection instance
let sql: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (!sql) {
    const connectionString = getConnectionString();
    sql = postgres(connectionString, {
      max: 1, // Use a single connection for serverless
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sql;
}

export async function initDatabase() {
  try {
    const db = getSql();
    await db`
      CREATE TABLE IF NOT EXISTS films (
        id SERIAL PRIMARY KEY,
        tmdb_id INTEGER UNIQUE NOT NULL,
        title TEXT NOT NULL,
        overview TEXT,
        poster_path TEXT,
        release_date TEXT,
        vote_average NUMERIC,
        watched BOOLEAN DEFAULT FALSE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    // Add watched column if it doesn't exist (for existing databases)
    // Use DO block to check if column exists before adding
    await db`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'films' AND column_name = 'watched'
        ) THEN
          ALTER TABLE films ADD COLUMN watched BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `;
  } catch (error) {
    if (error instanceof Error) {
      // Provide more helpful error messages
      if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("fetch failed") ||
        error.message.includes("getaddrinfo")
      ) {
        throw new Error(
          `Database connection failed. Please check:\n` +
            `1. POSTGRES_URL or POSTGRES_URL_NON_POOLING is set correctly in .env.local\n` +
            `2. The connection string is valid (try using POSTGRES_URL_NON_POOLING for Supabase)\n` +
            `3. Your network connection is working\n` +
            `4. The database host is reachable\n` +
            `Original error: ${error.message}`
        );
      }
    }
    throw error;
  }
}

export async function getWatchlist(): Promise<Film[]> {
  try {
    const db = getSql();
    const rows = await db<Film[]>`
      SELECT * FROM films ORDER BY added_at DESC
    `;
    return rows;
  } catch (error) {
    console.error("Error getting watchlist:", error);
    throw error;
  }
}

export async function addToWatchlist(film: Omit<Film, "id" | "added_at" | "watched">) {
  try {
    const db = getSql();
    await db`
      INSERT INTO films (tmdb_id, title, overview, poster_path, release_date, vote_average, watched)
      VALUES (${film.tmdb_id}, ${film.title}, ${film.overview}, ${film.poster_path}, ${film.release_date}, ${film.vote_average}, FALSE)
      ON CONFLICT (tmdb_id) DO NOTHING
    `;
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
}

export async function toggleWatched(tmdbId: number) {
  try {
    const db = getSql();
    await db`
      UPDATE films 
      SET watched = NOT watched 
      WHERE tmdb_id = ${tmdbId}
    `;
  } catch (error) {
    console.error("Error toggling watched status:", error);
    throw error;
  }
}

export async function removeFromWatchlist(tmdbId: number) {
  try {
    const db = getSql();
    await db`
      DELETE FROM films WHERE tmdb_id = ${tmdbId}
    `;
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    throw error;
  }
}

export async function isInWatchlist(tmdbId: number): Promise<boolean> {
  try {
    const db = getSql();
    const rows = await db`
      SELECT 1 FROM films WHERE tmdb_id = ${tmdbId} LIMIT 1
    `;
    return rows.length > 0;
  } catch (error) {
    console.error("Error checking watchlist:", error);
    throw error;
  }
}

export async function updatePosterPath(tmdbId: number, posterPath: string | null) {
  try {
    const db = getSql();
    await db`
      UPDATE films 
      SET poster_path = ${posterPath} 
      WHERE tmdb_id = ${tmdbId}
    `;
  } catch (error) {
    console.error("Error updating poster path:", error);
    throw error;
  }
}
