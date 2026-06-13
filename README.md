# Skillcase Intern Assessment

Mini short-video learning platform built with Node.js, Express, PostgreSQL/Supabase, React, Vite, Redux Toolkit, and Axios.

## Features

- JWT authentication with register, login, and protected profile route.
- Vertical Shorts-style video feed.
- Autoplay for the current visible video.
- Like, bookmark, comments, and nested comment replies.
- Optimistic like/bookmark UI updates.
- Express static video serving from backend uploads.
- PostgreSQL relational schema with primary keys, foreign keys, and indexes.

## Architecture

### Backend

The backend lives in `backend` and follows the required layered structure:

- `src/routes`: route declarations only.
- `src/controllers`: HTTP request and response handling.
- `src/services`: database and business logic.
- `src/middlewares`: auth, validation, async handling, and centralized errors.
- `src/config`: environment and PostgreSQL pool configuration.
- `src/utils`: shared helpers such as JWT and app errors.
- `sql/schema.sql`: PostgreSQL schema for Supabase.
- `uploads`: local video files served by Express static middleware.

### Frontend

The frontend lives in `frontend` and uses Vite React:

- `src/pages`: route-level screens.
- `src/components`: reusable UI components.
- `src/redux`: Redux Toolkit auth state.
- `src/api`: centralized Axios client.
- `src/hooks`: reusable React hooks.

## Database Setup

Run `backend/sql/schema.sql` in the Supabase SQL editor. It creates:

- `app_users`
- `videos`
- `likes`
- `comments`
- `bookmarks`

The `videos.category` column is indexed. Likes and bookmarks use composite primary keys to prevent duplicates.

## Environment Setup

Create backend env:

```bash
cp backend/.env.example backend/.env
```

Set these values in `backend/.env`:

```bash
PORT=5001
DATABASE_URL=your-supabase-postgres-connection-string
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Create frontend env:

```bash
cp frontend/.env.example frontend/.env
```

Set:

```bash
VITE_API_URL=http://localhost:5001
```

## Install Dependencies

From the project root:

```bash
npm install
npm run install:all
```

Or separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run Backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:5001`.

For non-watch mode:

```bash
npm start
```

## Run Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Run Both Together

From the project root:

```bash
npm run dev
```

## Video Files

Download the 3 provided assignment videos and place them in:

```bash
backend/uploads/
```

The current database rows expect these paths:

```bash
/uploads/short-1.mp4
/uploads/short-2.mp4
/uploads/short-3.mp4
```

So the local files should be named:

```bash
backend/uploads/short-1.mp4
backend/uploads/short-2.mp4
backend/uploads/short-3.mp4
```

## Important GitHub Rule

Video files must not be pushed to GitHub.

This project ignores video upload folders in `.gitignore`:

```gitignore
backend/uploads/*
!backend/uploads/.gitkeep
frontend/src/video/*
!frontend/src/video/.gitkeep
```

Only `backend/uploads/.gitkeep` should be committed so the folder exists in the repository.

## API Routes

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` protected

### Videos

- `POST /videos` protected
- `GET /videos`
- `GET /videos/:id`

### Engagement

- `POST /videos/:id/like`
- `POST /videos/:id/comment`
- `GET /videos/:id/comments`
- `POST /videos/:id/bookmark`

## Creating A Video Row

Use a protected request with a JWT:

```json
{
  "title": "Learning Short 1",
  "description": "First provided short-form learning video.",
  "category": "Education",
  "file_path": "/uploads/short-1.mp4"
}
```

## Build Check

```bash
cd frontend
npm run build
```
