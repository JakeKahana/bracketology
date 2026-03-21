# 🏆 Bracketology

AI-powered March Madness-style bracket tournaments for any topic. Deployable to Vercel in ~5 minutes.

---

## Deploy to Vercel (step by step)

### Step 1 — Put this project on GitHub

You need the code in a GitHub repo so Vercel can access it.

1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click the **+** button → **New repository**
3. Name it `bracketology`, leave it Public or Private (either works), click **Create repository**
4. On your computer, open Terminal and run:

```bash
cd bracketology-next
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/bracketology.git
git push -u origin main
```

(Replace `YOUR_USERNAME` with your GitHub username)

---

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New → Project**
3. Find your `bracketology` repo and click **Import**
4. Vercel will auto-detect it as a Next.js project — you don't need to change any settings
5. **Before clicking Deploy**, look for the **Environment Variables** section
6. Add one variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from [console.anthropic.com](https://console.anthropic.com/settings/api-keys)
7. Click **Deploy**

Vercel will build and deploy it. In ~2 minutes you'll have a live URL like `https://bracketology-abc123.vercel.app`.

---

## Run locally (for testing before deploying)

```bash
cd bracketology-next
npm install
cp .env.example .env.local
# Edit .env.local and paste your API key
npm run dev
# Open http://localhost:3000
```

---

## How it works

- `app/api/generate/route.js` — the backend. Receives a topic, calls Anthropic, returns 32 items. Your API key lives here, on the server, never exposed to the browser.
- `app/page.js` — the entire frontend UI. Calls `/api/generate` to get bracket items.
- `app/layout.js` — sets up fonts and HTML boilerplate.
