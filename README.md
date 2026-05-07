# CodeRefactor AI - AI Code Refactoring Bot

This is a simple portfolio-ready website for the `ai-code-review-assistant` project.

## Features

- Paste JavaScript or Python code
- Run quick static analysis checks
- Get a quality score out of 100
- See suggested code review issues
- Apply basic automatic refactoring suggestions
- Save each review in Supabase (cloud database)

## Run Locally

No build tools required.

1. Open `index.html` directly in your browser
2. Or run any local static server from this folder

Example (Python):

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Supabase Setup (Required Once)

1. Open your Supabase project SQL Editor
2. Paste and run `supabase-setup.sql`
3. Keep using your publishable key only in frontend

Current app config is set to:

- Project URL: `https://fmmlcroghjmjfmcvnsas.supabase.co`
- Key type: `publishable` (safe for frontend)

## Deploy Publicly

Fastest path:

1. Push this folder to GitHub
2. Import repo in Vercel
3. Deploy and share the generated `vercel.app` link

Any user clicking your link can open and test the app.

## Next Upgrade Ideas

- Connect to OpenAI or Gemini API for deep code review
- Add diff view (before/after)
- Add PR URL input and GitHub integration
- Add severity levels (critical, warning, info)
- Add authentication and review history
