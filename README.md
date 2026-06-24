# RecipeVerse AI

An AI-powered recipe sharing social platform built with Next.js, Supabase, and Gemini API.

## Features

- Create, edit, and delete personal recipes
- Discover recipes from other users on the Explore page
- Home feed showing recipes from followed users
- Like and unlike recipes
- Follow and unfollow other creators
- Search recipes by title and users by username
- Filter recipes by cuisine, difficulty, and cook time
- AI cooking assistant powered by Gemini API (ingredient scaling, substitutions, cooking tips)
- Responsive design — mobile and desktop layouts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| AI | Gemini API |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Gemini API key

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd recipeverse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Set up Supabase

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Recipes
create table recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  cover_image_url text,
  ingredients text[] default '{}',
  preparation_steps text[] default '{}',
  prep_time int default 0,
  cook_time int default 0,
  servings int default 2,
  difficulty text default 'Easy',
  cuisine text[] default '{}',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Likes
create table likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade not null,
  unique(user_id, recipe_id)
);

-- Follows
create table follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  unique(follower_id, following_id)
);
```

Enable Row Level Security and create a Storage bucket named `recipe-images` with public read access.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |
| `GEMINI_API_KEY` | Google Gemini API key for AI assistant |

## Deployment

The application is deployed on Vercel.

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add all environment variables in Vercel project settings
4. Deploy — Vercel auto-deploys on every push to `main`

## Project Structure

```
app/
  home/          # Home feed (following + own recipes)
  explore/       # Explore all recipes + users
  create/        # Create recipe form
  recipe/[id]/   # Recipe detail + edit
  profile/[id]/  # User profile
  ai-assistant/  # AI chat page
  api/ai-chat/   # AI API route
components/
  layout/        # Sidebar, TopNav, BottomNav, FloatingAI
  recipe/        # RecipeCard
lib/
  actions/       # Server actions (recipes, social, explore)
  supabase/      # Supabase client/server/middleware
```
