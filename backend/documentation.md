# Backend Authentication & User API – Documentation

> Copy-paste ready markdown for your project README or `/docs/authentication.md`.

---

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Middleware](#middleware)
   - [`validateLocalSignUp`](#validatelocalsignup)
   - [`isAuthenticated`](#isauthenticated)
6. [Authentication Strategies](#authentication-strategies)
   - [Local (email + password)](#1-local-strategy-email--password)
   - [Google OAuth 2.0](#2-google-oauth-20-strategy)
7. [API Reference](#api-reference)
   - [Auth Routes](#auth-routes)
   - [User Routes](#user-routes)
8. [Error Handling](#error-handling)
9. [Running Locally](#running-locally)
10. [License](#license)

---

## Overview
This backend module provides:

- Email/password sign-up & login (Passport **local** strategy)
- Social login with Google (Passport **google-oidc** strategy)
- Session-based authentication (cookie sessions)
- Protected user endpoint (`/api/user`)
- Input validation & duplicate-email checks via custom middleware
- Data persistence with **Prisma ORM**

---

## Tech Stack
| Layer | Library / Service |
|-------|--------------------|
| **Framework** | Express .js |
| **ORM** | Prisma Client |
| **Auth** | Passport.js (`passport-local`, `passport-google-oidc`) |
| **Hashing** | bcrypt |
| **Database** | Your choice (PostgreSQL, MySQL, SQLite, etc.) |
| **Runtime** | Node.js ≥ 18 |

---

## Project Structure
```
├── middleware/
│ └── middleware.js # validateLocalSignUp, isAuthenticated
├── routes/
│ ├── authRoutes.js # /api/local-auth/* & Google OAuth handlers
│ └── userRoutes.js # /api/user
├── strategies/
│ ├── googleStrategy.js
│ └── localStrategy.js
├── utils/
│ └── randomPasswordGenerator.js
└── prisma/
└── schema.prisma
```


---

## Middleware
### `validateLocalSignUp`
| Purpose | Ensure the request body contains `email` & `password` and the email is **not** already registered. |
| Success | Calls `next()` to continue. |
| Failure | `400 Bad Request` – `{ error: "Email already exists" \| "Email and password are required" }` |

### `isAuthenticated`
| Purpose | Gate-keeps protected routes by checking `req.isAuthenticated()` (Passport). |
| Success | Calls `next()`; user object available as `req.user`. |
| Failure | `401 Unauthorized` – `{ error: "Not authenticated" }` |

---

## Authentication Strategies
### 1. Local Strategy (email + password)
- **Hashing:** `bcrypt` with 12 salt rounds.
- **Flow:**
  1. 📬 `POST /api/local-auth/login` with JSON `{ "email", "password" }`
  2. Passport verifies user & stores user ID in the session.
  3. Response: the authenticated user’s `id`.

### 2. Google OAuth 2.0 Strategy
- Uses `passport-google-oidc`.
- Auto-creates a new user if the Google email is not found.
- Random password (hashed) is generated for future local logins.
- **Endpoints:**
  - `GET /auth/google` – redirects to Google’s consent screen.
  - `GET /auth/google/callback` – handles the OAuth response and redirects to your frontend (`${FRONTEND_URL}/dashboard` on success, `/login` on failure).

---

## API Reference

### Auth Routes
| Method & Path | Middleware | Description | Success Response |
|---------------|------------|-------------|------------------|
| `POST /api/local-auth/signup` | `validateLocalSignUp` | Register with email & password. | `200 OK` → user object |
| `POST /api/local-auth/login` | `passport.authenticate("local")` | Login with email & password. | `200 OK` → user ID |
| `POST /api/local-auth/logout` | — | Destroy session & clear cookie. | `200 OK` |
| `GET /auth/google` | — | Google OAuth entry point. | 302 Redirect |
| `GET /auth/google/callback` | — | Google OAuth callback handler. | 302 Redirect to dashboard |

