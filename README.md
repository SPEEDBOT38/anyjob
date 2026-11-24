# AnyJob

Find a job, check your fit, tailor your CV honestly and download a LaTeX resume. Live at https://anyjob.hatchable.site.

## What it does

- **Find jobs**: pick a role (224 options) and a place from dropdowns. The search runs two LinkedIn scrapers on Apify (`valig/linkedin-jobs-scraper`, `orgupdate/linkedin-jobs-scraper`) plus Remotive and Arbeitnow in parallel, keeps only jobs whose title is that role (with close synonyms such as "Front End Engineer" for "Frontend Developer") in that place, and removes duplicates.
- **Fit**: requirement-by-requirement keyword evidence (in the browser) plus an AI analysis of strengths, gaps and missing keywords.
- **Tailor**: AI suggests a headline, summary and stronger bullets. A truth guard drops any rewrite that adds numbers not already in the CV; nothing changes until you accept it.
- **Resume editor**: every part of the CV is editable (sections, roles, bullets, skills) with AI rewrites per bullet and a live, page-accurate PDF preview.
- **LaTeX templates**: Jake's Resume, Awesome CV, Deedy, ModernCV, AltaCV and McDowell CV (see `public/assets/latex/NOTICE.md` for sources, licences and changes). A CodeMirror LaTeX editor compiles on a real TeX Live server and points to errors by line.
- **Export**: PDF (compiled LaTeX), Word, LaTeX project (.zip with class files) and plain text; cover letters written by AI from the tailored CV.

AI runs through the Kilo AI gateway (`KILO_API_KEY`) on free models only: `kilo-auto/free` by default, `openrouter/free` as a backup. The `kilo_model` setting is used only when it names a free model (ending in `/free` or `:free`), so nothing is ever billed. PDFs are compiled by LaTeX-on-HTTP (latex.ytotech.com) with texlive.net as a fallback.

## Local Python backend (legacy)

Install the backend dependencies with `python -m pip install -r backend/requirements.txt` and run `python -m uvicorn backend.main:app --host 127.0.0.1 --port 8130`. Open http://127.0.0.1:8130 for the integrated app. The existing static frontend at http://127.0.0.1:8129 also connects to this API. Keep the same address and browser profile to access your saved workspace.

Upload or paste a master CV, add a job description, and check the matching terms and evidence. Prepare a draft, review the bullet order and approve the document. Approval checks the PDF text. The export screen offers PDF, Word, LaTeX and plain text. Record the actual application stage in Applications.

The local API loads KILO_API_KEY, KILO_MODEL and APIFY_API_TOKEN from the process environment or %LOCALAPPDATA%/AnyJob/.env. Process settings take precedence. Kilo ranks existing CV lines when selected. Settings also offers browser-only Local preparation and Gemini with a session key. Restart the API after changing the environment file.

## Discovery and previous profiles

Discover can search boards, open saved postings, or read up to 50 records from an existing Apify dataset ID. Resumes can import earlier profiles from backend/data. Classic and Modern use the MIT-licensed [LaTeXCV templates](https://github.com/jankapunkt/latexcv/tree/c4284b2ac9d20ba751e272fc805bb00accc6f1a8). The TeX exporter combines the upstream preamble with escaped approved content. Browser PDF and Word exports adapt the same heading styles.

## Develop and test

Run `npm ci` and `npm run build` to rebuild the static files in `public/workspace`. Run `npm test` with Google Chrome installed. The browser suite starts an isolated HTTP server, checks the application journey and downloads, and tests navigation at four widths. Discovery and previous-profile UI tests use fixture responses.

## Deploy on Hatchable

`api/`, `lib/`, `migrations/` and `hatchable.toml` are the JavaScript backend for Hatchable. It serves `public/` and the endpoints the app uses: `/api/providers/status`, `/api/ai/assist`, `/api/latex/compile`, `/api/providers/kilo/rank`, `/api/providers/apify/jobs/:dataset`, `/api/discovery/search`, `/api/discovery/jobs` and `/api/profile/profiles`. Set `KILO_API_KEY` and `APIFY_API_TOKEN` on the project Setup page (both are optional). Job search uses the Remotive and Arbeitnow public boards. The original Python/FastAPI backend lives in `backend/` for local use. Hatchable has no build step and only accepts plain scripts, so `npm run build` produces one classic `public/workspace/app.js` bundle (PDF reading runs on the main thread). Rebuild and commit `public/workspace` before deploying.
