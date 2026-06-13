# Skillcase Intern Assessment

Mini short-video learning platform built with Node.js, Express, PostgreSQL, React, Vite, Redux Toolkit, and Supabase/Postgres.

## Architecture

- `backend` exposes JWT authentication, video, like, comment, and bookmark APIs.
- `backend/src/routes` contains route definitions only.
- `backend/src/controllers` handles HTTP request/response mapping.
- `backend/src/services` contains database/business logic.
- `backend/src/middlewares` contains JWT auth, validation, not-found, and error handling.
- `frontend` is a Vite React app with a full-screen vertical Shorts feed.
- `frontend/src/redux` stores authentication state.
- `frontend/src/api` centralizes Axios configuration.

## Setup

1. Install dependencies:

```bash
npm run install:all
npm install
```

2. Create backend environment file:

```bash
cp backend/.env.example backend/.env
```

Set `DATABASE_URL` to your Supabase PostgreSQL connection string and choose a strong `JWT_SECRET`.

3. Create frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

4. Run the SQL schema in Supabase SQL editor:

```bash
backend/sql/schema.sql
```

5. Put the 3 provided videos in:

```bash
backend/uploads/
```

Do not commit video files. The folder is ignored by Git.

6. Start both apps:

```bash
npm run dev
```

Backend runs on `http://localhost:5001` and frontend runs on `http://localhost:5173`.

## Useful API Routes

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /videos`
- `GET /videos`
- `GET /videos/:id`
- `POST /videos/:id/like`
- `POST /videos/:id/comment`
- `GET /videos/:id/comments`
- `POST /videos/:id/bookmark`

## Creating Videos

Use a protected request with a JWT:

```json
{
  "title": "React Hooks in 60 Seconds",
  "description": "A quick lesson about useState and useEffect.",
  "category": "React",
  "file_path": "/uploads/react-hooks.mp4"
}
```

