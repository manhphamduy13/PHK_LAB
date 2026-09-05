# Authentication Security Review

## Current model

- Passwords are hashed with `bcryptjs`.
- Login and registration issue one-day JWTs signed with `JWT_SECRET`.
- The browser stores the user and JWT in `localStorage`.
- Protected API requests send the token in the `Authorization: Bearer` header.
- Production fails fast when `JWT_SECRET` is missing; local development has an explicit development fallback.
- Roles are carried in the JWT and checked by server middleware/route guards.

## Threats

A successful XSS attack can read a `localStorage` token and use it until expiry. Tokens are also exposed to any JavaScript running in the origin. The current model is acceptable for controlled testing only when the deployment is trusted, CSP/input handling is reviewed, credentials are not shared, and the service is served over HTTPS.

The frontend `ProtectedRoute` is only a navigation convenience. Server-side JWT and ownership checks are the security boundary. Notification updates, class analytics, assignment creation and lesson publishing now include server-side ownership checks where the resource relationship is available.

## Migration path

For public production, move the JWT to an `httpOnly`, `secure`, `sameSite=lax` cookie, add CSRF protection for state-changing requests, and replace frontend localStorage reads with a `/api/users/me` session check. Keep token expiry short and add a refresh-token rotation strategy only if the product needs long-lived sessions. Invalidate sessions on logout/server-side revocation where required.

This should be implemented as one coordinated auth change rather than a partial cookie/localStorage hybrid.

## Current readiness

**BLOCKED — controlled testing only.** The code has production secret fail-fast and server-side authorization improvements, but the current localStorage token model has not been migrated to secure httpOnly cookies and has not received a production threat-model test.
