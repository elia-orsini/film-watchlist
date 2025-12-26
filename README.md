# Film Watchlist

A Next.js application for searching and managing a film watchlist using TMDB API and Vercel Postgres.

## Features

- 🔍 Search movies using TMDB API
- 💾 Save movies to your watchlist (stored in Vercel Postgres)
- 📱 Responsive design with dark mode support
- ⚡ Fast search with debouncing
- 🎬 Beautiful movie cards with posters and ratings

## Setup

### 1. Get a TMDB API Key

1. Go to [TMDB](https://www.themoviedb.org/) and create an account
2. Navigate to [API Settings](https://www.themoviedb.org/settings/api)
3. Request an API key (free)
4. Copy your API key

### 2. Set Up Database

You have two options:

#### Option A: Vercel Postgres (Recommended)

1. Deploy your project to Vercel (or use Vercel CLI)
2. In your Vercel project dashboard, go to **Storage**
3. Click **Create Database** and select **Postgres**
4. The connection strings will be automatically added as environment variables

#### Option B: External Postgres Database (Supabase, Neon, etc.)

If you're using an external Postgres database (like Supabase, Neon, or your own Postgres instance):

1. Get your connection string from your database provider
2. Add it to your `.env.local` file as `POSTGRES_URL`

Example format:

```
POSTGRES_URL=postgres://user:password@host:port/database
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Required: TMDB API Key
TMDB_API_KEY=your_tmdb_api_key_here

# Required: Database connection (automatically set if using Vercel Postgres)
POSTGRES_URL=your_postgres_connection_string_here
```

**For Vercel Postgres**, the following variables are automatically set when you connect the database:

- `POSTGRES_URL` (primary connection string)
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**Check your database connection:**
Visit `http://localhost:3000/api/db-status` to verify your environment variables are set correctly.

### 4. Initialize the Database

After setting up Vercel Postgres, initialize the database by calling:

```bash
curl -X POST http://localhost:3000/api/init-db
```

Or visit `http://localhost:3000/api/init-db` in your browser after starting the dev server.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js app directory with pages and API routes
- `components/` - React components (FilmCard, SearchBar)
- `lib/` - Utility functions (database operations, TMDB API client)
- `app/api/search/` - API route for searching movies
- `app/api/watchlist/` - API routes for managing watchlist
- `app/api/init-db/` - API route for initializing database schema

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vercel Postgres** - Database
- **TMDB API** - Movie data
- **use-debounce** - Search debouncing

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your `TMDB_API_KEY` environment variable
4. Connect Vercel Postgres from the Storage tab
5. Deploy!

After deployment, initialize the database by calling the `/api/init-db` endpoint once.
