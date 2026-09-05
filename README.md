# PHK STEM LAB

**Slogan:** Learn. Explore. Experiment.

## Architecture & Foundation (Phase 0)

This is the production-ready foundational structure for the PHK STEM LAB EdTech product.

### Core Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Radix/Lucide icons.
- **Backend:** Express (served alongside Vite in dev, compiled to standalone in prod).
- **Database:** SQLite (LibSQL) managed by Drizzle ORM. Local `.db` file for phase 0 to ensure zero-setup bootstrapping.
- **Security:** JWT authentication, bcrypt hashed passwords, RBAC (Role-Based Access Control).

### Folder Structure
- `/src/components` - Reusable UI elements (`Button`, `Card`, `Input`, `Badge`).
- `/src/layouts` - Layout wrappers (`AdminLayout`, `StudentLayout`).
- `/src/pages` - Routable page components.
- `/src/store` - Zustand stores (e.g., `authStore.ts`).
- `/src/db` - Database schemas, connection, and seeding logic.
- `/server.ts` - Express backend entry point.

### Roles
- **SUPER_ADMIN:** Full access to all dashboards.
- **TEACHER:** Access to admin dashboard but restricted (to be enforced at API level in Phase 1).
- **STUDENT:** Access to the student learning dashboard only.

### How to run
1. Install dependencies: `npm install`
2. Push DB schema: `npm run db:push`
3. Seed DB: `npm run db:seed`
4. Start dev server: `npm run dev`

### Demo Accounts
- **Student:** student@phk.edu / password123
- **Teacher:** khe.pham@phk.edu / password123
- **Admin:** admin@phk.edu / password123
