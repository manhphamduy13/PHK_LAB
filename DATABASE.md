# Database Schema

Uses Drizzle ORM with LibSQL.

- `users`: Core identity.
- `roles`: RBAC definition.
- `subjects`, `grades`: Categorization.
- `courses`: High level curriculum container.
- `chapters`: Course sections.
- `lessons`: Individual learning units.
- `lesson_sections`: Multimedia content blocks.
- `experiments`, `simulations`: Interactive modules attached to lessons.
- `exercises`, `questions`, `answers`: Assessment models.
- `progress`: Tracking student completion of lessons.
- `achievements`, `student_achievements`: Gamification system.

See `/src/db/schema.ts` for full implementation details.
