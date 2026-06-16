# Security & Accessibility

## Security Measures
- **Authentication**: JWT-based Google Authentication via Firebase SDK.
- **Backend API**: 
  - `helmet` middleware for strict HTTP headers.
  - `cors` configured for restricted cross-origin access.
  - Verification of Firebase ID Tokens in Express middleware before granting access to protected routes.
- **Data Safety**: Firestore Security Rules ensure users can only read/write their own UID data.
- **XSS Prevention**: Handled natively by React's auto-escaping rendering engine. DOMPurify used for any rich-text rendering.

## Accessibility (a11y)
- **WCAG 2.1 AA Compliance**: Achieved through strict contrast ratios (e.g., text-slate-50 on bg-dark).
- **Keyboard Navigation**: All buttons, links, and forms are fully navigable via `Tab` with visible focus rings.
- **Semantic HTML**: Proper use of `<main>`, `<nav>`, `<section>`, and `<header>` tags throughout the application.
- **ARIA Labels**: Screen-reader friendly labels on all icon-only buttons (e.g., mobile menu toggle, log out).
