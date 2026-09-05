# AI Studio Demo Setup

## How the app runs
The application runs as a full-stack SPA using Express and Vite. 
- The backend serves API routes from `/api/*`.
- Vite handles the frontend assets and routes. 
- The server binds to port `3000` via `process.env.PORT`.

## Gemini Configuration
- **Model**: `gemini-3.6-flash`
- **Secrets**: `GEMINI_API_KEY` is injected from AI Studio's user secrets directly into the server environment. It is **never** exposed to the browser or logged. 
- The `FAST_MODEL` env variable is used to select the primary Gemini model.

## Infrastructure
- **Database**: Ephemeral SQLite (`file:local.db`) used for the demo. Data resets on application restart.
- **Storage**: Local filesystem storage used for PDFs. This storage is ephemeral and will not persist across restarts.
- **Demo Accounts**: 
  - Admin: `admin@phk.edu`
  - Teacher: `khe.pham@phk.edu`
  - Students: `student1@phk.edu` to `student30@phk.edu`
  - Password for all: `password123`

## Known Limitations
- Data and storage are strictly ephemeral for this demo.
- Advanced background analytics may require optimizations at a larger scale.

## How to reset demo data
Rerun the seed command:
`npm run db:push && npm run db:seed`
