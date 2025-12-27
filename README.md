# SocialHub

A full-stack social platform (Threads-style) built with Node/Express, MongoDB, and a React frontend. This README covers setup for both backend and frontend, key features, and workflow notes.

## Features
- JWT auth (login/register), protected routes, profile edit
- Posts with media upload, likes, comments, activity feed
- Search users, follow/unfollow, suggestions
- Responsive UI with sidebar navigation and modals

## Tech Stack
- **Backend:** Node.js, Express, MongoDB, JWT, Multer (uploads)
- **Frontend:** React, React Router, fetch API
- **Dev:** npm scripts, local .env configuration

## Repository Structure
```
backend/        Express API and uploads
frontend/       React app
```

## Prerequisites
- Node.js 18+
- npm 8+
- MongoDB running locally (or connection string in .env)

## Backend Setup
1) `cd backend`
2) Install deps: `npm install`
3) Create `.env` in `backend/` with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/socialhub
JWT_SECRET=your_jwt_secret
```
4) Start API: `npm start`

### Useful Backend Scripts
- `npm start` – run server
- `npm run dev` – nodemon (if configured)

## Frontend Setup
1) `cd frontend`
2) Install deps: `npm install`
3) Start dev server: `npm start` (defaults to http://localhost:3000)

### Auth Flow
- On login: backend returns JWT + user id; stored in `localStorage` (`token`, `userId`)
- Protected pages check these values; logout clears them and redirects to login

## Environment & API Endpoints (common)
- API base: `http://localhost:5000/api`
- Auth: `POST /auth/login`, `POST /auth/register`
- Users: `GET /users/:id/profile`, `POST /users/:userId/follow/:targetId`, `GET /users/suggestions/:id`, `GET /users/search/:query`
- Posts: `GET /posts/feed/:userId`, `POST /posts`, `DELETE /posts/:id`
- Uploads: `POST /upload/profile` (Multer)

## Media Handling
- Uploaded files are served from backend `public/uploads`; frontend builds URLs via helper `getMediaUrl`.

## Project Conventions
- Frontend uses inline SVG logo (shared with sidebar) instead of static image
- Keep tokens in `localStorage` for now; consider httpOnly cookies for production
- Routes guarded via `Navigate` in React Router based on `isAuthenticated`

## Running Full Stack
- Start MongoDB
- Start backend: `cd backend && npm start`
- Start frontend: `cd frontend && npm start`

## Troubleshooting
- 401 errors: ensure `Authorization: Bearer <token>` header is sent
- CORS issues: confirm backend CORS config allows frontend origin
- Missing media: check `public/uploads` path and `getMediaUrl` usage

## License
MIT
