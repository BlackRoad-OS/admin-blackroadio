# admin-blackroadio

Static admin dashboard for [admin.blackroad.io](https://admin.blackroad.io) — part of the [BlackRoad OS](https://blackroad.io) ecosystem.

## Status: Working

**20/20 tests passing** as of 2026-03-04.

### What's Working

| Component | Status | Details |
|-----------|--------|---------|
| Static site (`index.html`) | Working | Valid HTML5, responsive, brand-compliant colors |
| Cloudflare Worker (`src/index.js`) | Working | All routes return correct responses |
| Stylesheet (`styles.css`) | Working | Official color variables, black background |
| Brand compliance | Passing | Zero forbidden colors across all source files |
| CI pipeline | Configured | Runs `npm test` on push/PR to main/master |
| Deploy pipeline | Configured | Brand compliance gate + Cloudflare Pages deploy |

### Worker Routes (Verified)

| Route | Method | Response | Tested |
|-------|--------|----------|--------|
| `/` | GET | HTML page — BlackRoad OS landing | Yes |
| `/health` | GET | JSON `{ status: "ok", worker, region, timestamp }` | Yes |
| `/robots.txt` | GET | `text/plain` — Disallows `/api/` | Yes |
| `/*` (other) | GET | 404 JSON `{ error: "not_found", path }` | Yes |
| Any | OPTIONS | CORS preflight with `Access-Control-Allow-*` headers | Yes |

### Security Headers (Verified)

All responses include:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'; ...`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Quick Start

```bash
npm install
npm test        # Run 20 tests (worker, HTML, brand compliance)
npm run dev     # Local dev server
```

## Project Structure

```
index.html          Static admin page (served by Cloudflare Pages)
src/index.js        Cloudflare Worker (routes, CORS, security headers)
styles.css          Shared stylesheet with brand color variables
test/worker.test.js Automated test suite (Node.js test runner)
```

## Brand Colors (Official)

| Color | Hex | Usage |
|-------|-----|-------|
| Amber | `#F5A623` | Gradient start |
| Hot Pink | `#FF1D6C` | Primary accent |
| Violet | `#9C27B0` | Gradient mid |
| Electric Blue | `#2979FF` | Gradient end |
| Black | `#000000` | Background |
| White | `#FFFFFF` | Text |

## License

Copyright 2025 BlackRoad OS, Inc. All rights reserved.

## Links

- [BlackRoad OS](https://blackroad.io)
- [GitHub](https://github.com/BlackRoad-OS)

---

Generated with [Claude Code](https://claude.com/claude-code)
