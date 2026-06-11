Backend API TODO

Replace mock data with real backend endpoints. Minimal required endpoints:

- POST /auth/login
  - Request: { email, password }
  - Response: { user: { id, username, email, avatarUrl? }, token }

- POST /auth/register
  - Request: { name, email, password }
  - Response: { user, token }

- GET /threads
  - Query params: page, limit, q (search)
  - Response: { threads: [...], total }

- GET /threads/:id
  - Response: { thread: { id, title, content, author, createdAt, repliesCount }, replies: [...] }

- POST /threads
  - Auth required (Bearer token)
  - Request: { title, content }
  - Response: created thread

- POST /threads/:id/replies
  - Auth required
  - Request: { content }
  - Response: created reply

- GET /users/:id
  - Response: user profile

Notes:
- Use JWT access tokens with `exp` claim for session expiry handling, or use refresh tokens + HTTP-only cookies for improved security.
- API must return 401 for invalid/expired tokens so the frontend can auto-logout.
