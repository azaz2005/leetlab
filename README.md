# Codexa

Codexa is a full-stack coding platform inspired by competitive programming and learning platforms. It allows users to browse coding problems, solve them in the browser, submit code, view results, and manage practice playlists.

## Tech Stack

- Frontend: React + Vite + Tailwind-inspired UI
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma ORM
- Authentication: JWT + cookies
- Code execution: Judge0 API

## Features

- User sign up and login
- Protected routes for authenticated users
- Problem listing and detail pages
- Code editor and submission workflow
- Judge0-based code execution and result polling
- User submissions history
- Problem playlists and saved collections
- Admin-only add problem flow

## Project Structure

```bash
Codexa/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── package.json
└── README.md
```

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+ installed
- npm installed
- PostgreSQL database running
- Access to a Judge0 API key (already configured in the backend env file in this repo)

## Environment Setup

### Backend

The backend already includes a `.env` file in `backend/.env` with the required values for local development, including:

```env
PORT=8080
DATABASE_URL=postgresql://...
JWT_SECRET=...
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=...
```

If you are setting it up from scratch, create `backend/.env` with these variables.

### Frontend

Create a `.env` file in `frontend/` with:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

This allows the React app to communicate with the backend.

## Installation

From the project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Database Setup

Generate Prisma client and apply migrations:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

If you need to reset the database during development:

```bash
npx prisma migrate reset
```

## Running the App

### Start the backend

```bash
cd backend
npm run dev
```

The backend runs on:

```text
http://localhost:8080
```

### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Default App Flow

- Open the frontend in the browser at `http://localhost:5173`
- Sign up or log in
- Browse or solve coding problems
- Submit solutions for execution
- View problem submissions and playlist management

## API Notes

The backend exposes routes under:

```text
/api/v1/auth
/api/v1/problems
/api/v1/execute-code
/api/v1/submission
/api/v1/playlist
```

Health check endpoint:

```text
GET /health
```

## Production Notes

This project is set up for local development and includes a CORS configuration for localhost and deployment origins. If deploying to production, update the allowed origins in the backend server and ensure environment variables are configured securely.

## Scripts

### Backend

```bash
npm run dev   # starts server with nodemon
npm start     # starts the server in production mode
```

### Frontend

```bash
npm run dev    # Vite dev server
npm run build  # production build
npm run preview # preview production build
```

## License

This project is currently unlicensed unless a license file is added later.

## Contributing

Pull requests and enhancements are welcome. For local development, make sure to keep environment variables and database credentials private.
