# Tibo landing page

Next.js App Router landing page for [Tibo](https://github.com/ankanganguly24/tibo).
Production: [tiborun.vercel.app](https://tiborun.vercel.app).

## Deploy on Vercel

Import the repository into Vercel and set the project root to `website/`.
Vercel detects Next.js automatically. Add this production environment variable
so canonical links, Open Graph URLs, `robots.txt`, and the sitemap all point at
the deployed site:

```bash
NEXT_PUBLIC_SITE_URL=https://tiborun.vercel.app
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` (or the port Next reports).

## Build

```bash
npm run build
npm run start
```
