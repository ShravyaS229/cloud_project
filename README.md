# Campus Marketplace

Buy, sell and exchange used items inside a college campus.
React (Vite) frontend, Node + Express + TypeScript backend, PostgreSQL (Neon) with Prisma 7, Cloudinary for images.

Wherever you see **REPLACE**, put in your own credentials. All secrets live in two `.env` files that are never committed.

## 1. Accounts you need (all free, no credit card)
- Neon (neon.tech): PostgreSQL database
- Cloudinary (cloudinary.com): image storage
- GitHub, Render (backend hosting), Vercel (frontend hosting)

## 2. Run the backend locally
```bash
cd backend
copy .env.example .env        # Windows   (Mac/Linux: cp .env.example .env)
```
Open `backend/.env` and **REPLACE** every value:
- `DATABASE_URL`: Neon dashboard > Connect > turn OFF "Connection pooling" > copy the string. The host must not contain `-pooler`. Remove `&channel_binding=require` if present.
- `JWT_SECRET`: any long random text
- `CLOUDINARY_*`: from the Cloudinary dashboard
- `CLIENT_URL`: keep `http://localhost:5173` for local use

Then:
```bash
npm install
npx prisma db push     # creates the tables in Neon
npx prisma db seed     # adds 6 categories and the admin user
npm run dev
```
Open http://localhost:5000/api/health. It should list the 6 categories.

If you already have a `prisma/migrations` folder from earlier work, keep it. `db push` works either way.

Default admin (change it in `backend/prisma/seed.ts` before deploying): `admin@campus.edu` / `Admin@123`

## 3. Run the frontend locally
```bash
cd frontend
copy .env.example .env        # Mac/Linux: cp .env.example .env
npm install
npm run dev
```
In `frontend/.env`, **REPLACE** `VITE_API_URL` if your backend is not on http://localhost:5000.
Open http://localhost:5173.

## 4. Push to GitHub
```bash
git init
git add .
git status        # make sure no ".env" file is listed
git commit -m "Campus Marketplace"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/campus-marketplace.git
git push -u origin main
```

## 5. Deploy the backend on Render
1. Render > New > Web Service > connect your GitHub repo.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Instance type: Free
6. Environment variables: add every key from `backend/.env` with your real values. Set `CLIENT_URL` after step 6 below.
7. Deploy. Your API address will look like `https://something.onrender.com`. Free services sleep after inactivity, so the first request can take about 50 seconds.

## 6. Deploy the frontend on Vercel
1. Vercel > Add New > Project > import the same repo.
2. Root Directory: `frontend`. Framework: Vite.
3. Environment variable: `VITE_API_URL` = your Render URL (no trailing slash).
4. Deploy. Copy the Vercel URL.
5. Go back to Render and set `CLIENT_URL` to that Vercel URL, then redeploy the backend.

## Features
Students: register and log in, add a listing with photo and price, browse, search and filter (name, category, price, condition, type), view details and seller contact, edit or delete own listings, mark as sold.
Admin: log in, dashboard statistics, view and deactivate students, view all listings, remove any listing.
