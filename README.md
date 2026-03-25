# DB Playground

A prototype demonstrating a unified search and discovery experience — and unified chat.

**Stack:** Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS 4.

---

## Getting started

### Prerequisites

- **Node.js** 18.18+ or 20+ (recommended: current LTS)
- **npm** (comes with Node)

### 1. Clone and install

```bash
git clone <repo-url>
cd clerestory
npm install
```

### 2. Run the app

**Development (with hot reload):**

```bash
npm run dev
```

Then open **http://127.0.0.1:3000** (or http://localhost:3000) in your browser.

**Production build and run:**

```bash
npm run build
npm run start
```

Again, open http://127.0.0.1:3000.

---

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start dev server (Turbopack)   |
| `npm run build`| Production build               |
| `npm run start`| Serve production build         |
| `npm run lint` | Run ESLint                     |

---

## Main routes

- **/** — Home (search, quick chips, suggested/recents)
- **/chat** — Unified chat with thread list and composer
- **/search** — Search results (e.g. `?q=...`, `?template=tables|notebooks|...`)
- **/discover** — Discover view
- **/agents** — Agents
- **/ai-gateway** — AI Gateway
- **/components** — Component gallery

---

## Troubleshooting

- **404 or blank page in dev**  
  Try a clean dev run: `rm -rf .next && npm run dev`, and ensure you’re visiting **http://127.0.0.1:3000** (port 3000).

- **"EMFILE: too many open files" in dev**  
  On macOS, raise the file descriptor limit before starting dev:  
  `ulimit -n 10240`  
  Then run `npm run dev` again.

- **Port 3000 in use**  
  Stop whatever is using 3000, or run dev on another host/port (e.g. `npx next dev --port 3001`).

---

## License

Private — see repo or maintainers for terms.
