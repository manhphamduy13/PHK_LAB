# AI Studio Import Audit

## Architecture
- **Frontend**: React + Vite (SPA)
- **Backend**: Express (server.ts) serving as a proxy and API handler
- **Database**: Drizzle ORM + LibSQL for local/dev, Postgres supported for production. (Using file:local.db for demo)
- **AI**: Gemini (`@google/genai` SDK) connected server-side via `GEMINI_API_KEY` and `FAST_MODEL` env vars.
- **Auth**: JWT based, roles for Super Admin, Teacher, Student
- **Storage**: Local filesystem storage supported.
- **Port**: Configured using `process.env.PORT` bound to 0.0.0.0.

## Google AI Studio Demo Constraints
- Database: Ephemeral local sqlite (`file:local.db`) used for the demo.
- AI: Uses Gemini-3.6-flash from environment, accessed server-side to hide API key from the browser.
- Storage: Ephemeral local storage.
- Scale: Demo-sized (30 students, 1 teacher, 1 admin seeded).

## What Works
- Database schema and seed logic
- Gemini connection from server-side
- SPA routing via Express fallback
- Basic auth mechanism

## What Needs Checking
- PDF upload path compatibility with AI Studio filesystem (must write to a valid ephemeral directory).
- Physics simulation execution limits.
- Background rate limits might affect concurrent demo usage if too strict.
