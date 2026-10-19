# Capstone Project: Full-Stack Portfolio & Blog Application

Course    : Web Data Management and Application
Instructor: Ahsan Shehzad
Student   : Xianshu Ze  (24998025)

## Live Links

| Part      | URL |
|-----------|-----|
| Front-End | https://capstone-client-lilac.vercel.app |
| Back-End  | https://capstone-api-blond.vercel.app |

(Both links are deployed from this repository.)

## Overview

A production-ready full-stack personal portfolio with a complete blog
platform. The project consolidates everything built during the semester
(Labs 9-14): Express + Mongoose data modeling, input validation, MVC
architecture, centralized error handling, bcrypt password hashing, and
JWT authentication - now finished with a React SPA front-end, multi-page
routing, an authenticated comment system, and a secure admin dashboard.

- **Back-End API** (`server/`): Node.js + Express + MongoDB Atlas
  (Mongoose). JWT-based auth with role-based access control (`user` /
  `admin`). Centralized error contract `{ success, status, message }`.
- **Front-End SPA** (`client/`): React 19 + Vite + React Router 7.
  Consumes every API endpoint; global auth state via React Context;
  protected routes; admin CRUD panels.

## Repository Structure

```
CapstoneProject/
├── server/            # Express REST API (deployed on Render)
│   ├── config/        # DB connection + campus DNS-SRV workaround
│   ├── models/        # User, Project, Skill, Message, Post, Comment
│   ├── controllers/   # business logic per resource (MVC)
│   ├── routes/        # route -> controller wiring
│   ├── middleware/    # JWT protect/adminOnly guards + error handler
│   ├── utils/         # ErrorHandler, generateToken
│   └── seed.js        # one-shot content seeder (node seed.js)
└── client/            # React SPA (deployed on Netlify)
    └── src/
        ├── pages/     # Home, Blog, PostDetail, Login, Admin
        ├── components/# Navbar, ProjectCard, ProtectedRoute
        ├── AuthContext.jsx  # global login state
        └── api.js     # fetch wrapper (VITE_API_URL)
```

## API Endpoints

Base URL: `https://capstone-api-blond.vercel.app` (local: `http://localhost:5000`)

### Auth (`/api/users`)
| Method | Path | Auth | Body / Purpose |
|--------|------|------|----------------|
| POST | `/api/users/register` | public | `{ username, email, password }` - creates user, password bcrypt-hashed (pre-save hook), min 8 chars, returns JWT |
| POST | `/api/users/login` | public | `{ email, password }` - verifies hash, returns `{ token }` + httpOnly cookie; generic 401 on failure |
| GET | `/api/users/me` | JWT | returns the current user document |

### Portfolio (`/api/projects`, `/api/skills`)
| Method | Path | Auth | Body / Purpose |
|--------|------|------|----------------|
| GET | `/api/projects` | public | list all projects |
| GET | `/api/projects/:id` | public | single project |
| POST | `/api/projects` | admin | `{ title, description, tags[], imageUrl, liveUrl, repoUrl, featured }` |
| PUT | `/api/projects/:id` | admin | partial update |
| DELETE | `/api/projects/:id` | admin | remove project |
| GET | `/api/skills` | public | list skills |
| POST | `/api/skills` | admin | `{ name, level, category }` |
| DELETE | `/api/skills/:id` | admin | remove skill |

### Blog (`/api/posts`, `/api/comments`)
| Method | Path | Auth | Body / Purpose |
|--------|------|------|----------------|
| GET | `/api/posts?category=&tag=` | public | list posts (author populated) |
| GET | `/api/posts/:id` | public | single post |
| POST | `/api/posts` | admin | `{ title, content, category, tags[] }` |
| PUT | `/api/posts/:id` | admin | update post |
| DELETE | `/api/posts/:id` | admin | delete post + cascade comments |
| GET | `/api/comments/post/:postId` | public | list comments of a post |
| POST | `/api/comments/post/:postId` | JWT | `{ content }` - comment as logged-in user |
| DELETE | `/api/comments/:id` | admin | remove comment |

### Contact (`/api/messages`)
| Method | Path | Auth | Body / Purpose |
|--------|------|------|----------------|
| POST | `/api/messages` | public | `{ name, email, subject, message }` from the contact form |
| GET | `/api/messages` | admin | inbox (newest first) |
| PATCH | `/api/messages/:id/read` | admin | mark as read |
| DELETE | `/api/messages/:id` | admin | delete message |

Auth header format: `Authorization: Bearer <token>` (JWT from /login).
Errors always come back as `{ success:false, status:<code>, message:<text> }`.

## Run Locally

### 1. Back-end
```bash
cd server
npm install
# create .env with:
#   MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/blog?retryWrites=true&w=majority
#   JWT_SECRET=<a long random string>
#   CLIENT_URL=http://localhost:5173
node server.js          # -> MongoDB Connected + Server is running on port 5000
node seed.js            # optional: fill the DB with portfolio content
```

### 2. Front-end
```bash
cd client
npm install
# create .env with:  VITE_API_URL=http://localhost:5000
npm run dev           # -> http://localhost:5173
```

### 3. Admin account
Register at `/api/users/register`, then promote once:
```bash
cd server
node promote-admin.js your@email.com
```

## Deployment Notes

- **Back-end**: Render (free tier). Root directory `server/`, start command
  `node server.js`. Environment variables: `MONGO_URI`, `JWT_SECRET`,
  `CLIENT_URL` (the Netlify URL), `NODE_ENV=production`.
- **Front-end**: Netlify. Root directory `client/`, build `npm run build`,
  publish `dist`. Environment variable: `VITE_API_URL` (the Render URL).
  SPA fallback via `public/_redirects` (`/*  /index.html  200`).
- MongoDB Atlas Network Access must allow `0.0.0.0/0` (Render IPs vary).

## Security Design (what the course taught)

1. Passwords are NEVER stored in plaintext - bcrypt (cost 10) in a pre-save hook.
2. The hash has `select: false` so normal queries can never leak it; only the
   login query opts back in with `.select('+password')`.
3. Login failures return ONE generic message - attackers cannot enumerate accounts.
4. JWTs are signed with a server-side secret; the `protect` middleware rejects
   forged or missing tokens (401) and `adminOnly` rejects non-admin writes (403).
5. The front-end guard (ProtectedRoute) is UX only - the API enforces the rules.
