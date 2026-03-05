# CLAUDE.md - AI Assistant Guide for admin-blackroadio

## Project Overview

This is the admin subdomain application (admin.blackroad.io) for BlackRoad OS, Inc. It is a static landing page with a Cloudflare Worker edge function providing API endpoints, security headers, and CORS support.

**Owner:** BlackRoad OS, Inc. (Proprietary - all contributions become company property)
**Code Owner:** @blackboxprogramming

## Tech Stack

- **Runtime:** Cloudflare Workers (edge serverless)
- **Language:** Vanilla JavaScript (ES modules, no transpilation)
- **Frontend:** Static HTML + CSS (no framework)
- **Deployment:** Cloudflare Pages via Wrangler CLI
- **CI/CD:** GitHub Actions
- **Package Manager:** npm
- **Node Version:** 18 (used in CI)

## Project Structure

```
/
├── src/
│   └── index.js          # Cloudflare Worker entry point (routes, CORS, security headers)
├── index.html            # Static landing page
├── styles.css            # Global stylesheet with CSS variables
├── package.json          # Minimal npm config (@blackroad/admin-blackroadio)
├── LICENSE               # Proprietary license
├── CONTRIBUTING.md       # Brand guidelines and contribution rules
├── BLACKROAD_EMOJI_DICTIONARY.md  # Emoji standards for docs
├── TRAFFIC_LIGHT_SYSTEM.md        # Status indicator system
└── .github/
    ├── workflows/        # CI, deploy, auto-merge, CodeQL workflows
    ├── CODEOWNERS        # @blackboxprogramming owns all files
    ├── SECURITY.md       # Security reporting policy
    ├── dependabot.yml    # Weekly dependency updates
    └── ISSUE_TEMPLATE/   # Issue templates
```

## Commands

```bash
# Local development - serves static files
npm run dev

# Deploy to Cloudflare Pages
npm run deploy
```

There are no test scripts configured. CI runs `npm test` with `continue-on-error: true`.

## Architecture

### Cloudflare Worker (`src/index.js`)

The worker exports a default `fetch` handler with these routes:

| Method  | Path         | Response                              |
|---------|-------------|---------------------------------------|
| OPTIONS | *           | CORS preflight (204)                  |
| GET     | `/health`   | JSON health check (worker name, region, timestamp) |
| GET     | `/robots.txt` | Disallows `/api/`                   |
| GET     | `/`         | HTML landing page with branding       |
| *       | `/*`        | 404 JSON error                        |

**Security headers applied to all responses:**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`
- `Permissions-Policy` (restricts camera/mic/geolocation)

### Frontend

Single-page static HTML with inline styles and glassmorphism effects. No component library or build step.

## Environment Variables

| Variable | Context | Purpose |
|----------|---------|---------|
| `WORKER_NAME` | Cloudflare Worker runtime | Worker identification (defaults to "blackroad-worker") |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions secret | Deployment authentication |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secret | Cloudflare account targeting |

## Brand Guidelines (MUST FOLLOW)

### Approved Colors
- Hot Pink: `#FF1D6C` (primary accent)
- Amber: `#F5A623`
- Electric Blue: `#2979FF`
- Violet: `#9C27B0`
- Background: `#000000`

### Forbidden Colors (CI will reject these)
`#FF9D00`, `#FF6B00`, `#FF0066`, `#FF006B`, `#D600AA`, `#7700FF`, `#0066FF`

The deploy workflow scans all `.css`, `.html`, `.js`, and `.jsx` files for forbidden color codes and blocks deployment if any are found.

### Typography
- Primary: Inter
- Code: JetBrains Mono
- Spacing follows golden ratio (1.618)

## CI/CD Workflows

1. **ci.yml** - Runs on push to main and all PRs. Node 18, install, test, build (all optional/continue-on-error).
2. **deploy.yml** - Brand compliance check + Cloudflare Pages deploy. Auto-deploys only on main/master push.
3. **auto-merge.yml** - Squash-merges dependabot PRs and PRs labeled `automerge`.
4. **autonomous-agent.yml** - Scheduled (every 6h) and PR-triggered. Auto-detects project type, runs tests, attempts merge.
5. **blackroad-auto-merge.yml** - Smart merge with validation for `blackroad-auto-fix` branch PRs.
6. **blackroad-codeql-analysis.yml** - CodeQL security scanning (JS, Python) weekly on Mondays.

## Conventions

- **No dependencies** - This project intentionally has zero production dependencies. Do not add npm packages without explicit approval.
- **No build step** - The code is served as-is. Do not introduce bundlers or transpilers.
- **Vanilla JS only** - No TypeScript, no frameworks. Keep it simple.
- **Security-first** - All responses include security headers. Never weaken CSP or remove HSTS.
- **Brand compliance is enforced in CI** - Any use of forbidden colors will block deployment.
- **Emoji usage** - Follow `BLACKROAD_EMOJI_DICTIONARY.md` for documentation emoji standards.
- **Status indicators** - Follow `TRAFFIC_LIGHT_SYSTEM.md` (Green/Yellow/Red/Blue system).

## Security

- Report vulnerabilities to: blackroad.systems@gmail.com
- Compliance targets: OWASP, NIST, SOC 2, SEC Rule 17a-4
- See `.github/SECURITY.md` for full policy
