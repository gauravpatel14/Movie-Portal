# Movie Portal

A modern, responsive movie streaming web application built with React, Vite, and TailwindCSS. It features a cinematic hero banner, movie rows with categories, and detailed movie pages with trailer playback.

## Features
- **Cinematic UI:** High-quality movie banners and a dark, modern aesthetic.
- **Movie Catalog:** View movies by categories (Action, Thriller, Comedy, etc.).
- **Watchlist:** Add your favorite movies to a personalized watchlist.
- **Trailers:** Watch YouTube trailers directly on the movie details page.

## How to Run Locally
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start the Backend (Mock API):**
   ```bash
   npm run backend
   ```
   *This starts the JSON Server on port 5001 using `db.json`.*

3. **Start the Frontend:**
   ```bash
   npm run dev
   ```
   *This starts the Vite development server (usually on http://localhost:5173).*

## Vercel Deployment Plan
Deploying this project to Vercel requires a small change because Vercel is a serverless platform and cannot run the persistent `json-server` backend.

**Steps for Production:**
1. **Move Database:** Move `db.json` to the `public/` folder so it acts as a static file.
2. **Update Fetch URLs:** Change all API calls in the code from `http://localhost:5001/movies` to fetch directly from `/db.json`.
3. **Deploy to Vercel:**
   - Go to [Vercel](https://vercel.com) and create a new project.
   - Import this GitHub repository (`gauravpatel14/Movie-Portal`).
   - Vercel will automatically detect Vite and set the build command to `npm run build` and output directory to `dist`.
   - Click **Deploy**!
