# Forum App (React + TypeScript)

A lightweight forum frontend built with React, TypeScript, Vite, Redux Toolkit, TanStack Query (v5), and Framer Motion for animations. This repository contains a feature-complete frontend with mock APIs for local development.

## Tech stack

- React 19
- TypeScript
- Vite
- Redux Toolkit
- TanStack Query v5
- Framer Motion (animations)

## Project overview

This is a forum client demonstrating common features: authentication (mock), thread browsing, thread details, posting comments (mock), and simple AI summary integration. Styling is implemented via a global CSS file (`src/index.css`) with a card-based design system.

## Install

Install dependencies (uses legacy peer deps for compatibility with current React setup):

```bash
npm install --legacy-peer-deps
```

## Run

Start the development server:

```bash
npm run dev
```

Vite will print a local URL (e.g. `http://127.0.0.1:4173/` or another available port).

## File structure

- `src/` – source code
	- `components/` – reusable UI components
		- `layout/Navbar.tsx` – top navigation
		- `threads/CreateThreadForm.tsx` – local thread creation form
	- `pages/` – route pages
		- `HomePage.tsx` – thread list + create form
		- `ThreadPage.tsx` – thread detail + comments
		- `ProfilePage.tsx` – placeholder user profile
	- `routes/` – `AppRoutes.tsx` contains route definitions and page transitions
	- `api/` – API layer (axios instance + typed endpoints)
	- `features/` – redux features (auth)
	- `utils/` – small utilities (e.g. `dateUtils.ts`)
	- `index.css` – global styling and design system

## Animations & Performance notes

- Page transitions use `framer-motion`'s `AnimatePresence` + `motion.div` with small durations to create a subtle fade effect.
- Thread list items animate using `transform` (translateY) and `opacity`, which are GPU-friendly and minimize layout shifts.
- Hover interactions use `scale` transforms (`whileHover={{ scale: 1.02 }}`) which avoid layout reflows.

If you notice layout shifts, prefer `transform` changes over `top/left` or large style recalculations. Avoid animating width/height of large elements.

## Development notes

- The project uses mock implementations for auth and threads to enable UI development without a backend.
- For production, replace mock API calls in `src/features/auth/authThunks.ts` and `src/api/threadsApi.ts` to integrate with a real backend.

## Validation

After changes, verify navigation: Login -> Home, Profile, ThreadPage, and back to Login. The project includes a Navbar persisted across routes.

---

If you want, I can add a small automated test harness or a checklist for pre-deployment steps (lint, type-check, bundle analyze).
