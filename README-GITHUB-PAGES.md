# Restaurant Ordering System — GitHub Pages demo

A browser-only simulation of the restaurant ordering coursework. The original Express, PostgreSQL and Prisma source files remain in this repository, but **do not run on GitHub Pages**.

## Publish to a NEW GitHub repository

1. Create an empty public GitHub repository (for example `restaurant-ordering-demo`) without adding a README.
2. Extract this ZIP and open the folder in VS Code.
3. Run `git init`, `git branch -M main`, `git add .`, and `git commit -m "Add restaurant demo"`.
4. Run `git remote add origin https://github.com/YOUR-USERNAME/restaurant-ordering-demo.git` and `git push -u origin main`.
5. Open the repository Settings > Pages and select **GitHub Actions** as the source.
6. Open Actions and wait for **Deploy Restaurant Demo to GitHub Pages** to succeed.
7. Open `https://YOUR-USERNAME.github.io/restaurant-ordering-demo/`.

## Demo behaviour

Register with **fake demo credentials only**. Then try products, cart, checkout and feedback. Saved data is in this browser's localStorage, not PostgreSQL. It will not sync across devices/browsers. Admin-only access controls and the original database stored procedures are not demonstrated in the static app. The dashboard can display browser-local orders if opened directly via `dashboard.html`.

The demo uses illustrative sample products, not live or imported production records. Discount and delivery tiers are illustrative and may differ from the real database rules.

## Important security note

Browser-local passwords are **not secure authentication**. Do not use real passwords or sensitive personal information. Database SQL dumps and `.env` files have intentionally been excluded from this public-ready ZIP; keep your original archive private for coursework submission.
