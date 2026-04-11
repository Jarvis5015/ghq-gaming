# GHQ — GamerHeadQuarter

A competitive gaming tournament platform built with React + Node.js + PostgreSQL.

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS + Framer Motion + Zustand
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT
- **Payments**: UPI (manual verification)

## Deployment

### Backend → Railway

1. Go to [railway.app](https://railway.app) → New Project
2. **Add PostgreSQL** plugin — Railway auto-sets `DATABASE_URL`
3. **Deploy from GitHub** → point to the `/server` folder
4. Set these **Environment Variables** in Railway dashboard:

```
DATABASE_URL        = (auto-set by Railway PostgreSQL plugin)
JWT_SECRET          = (generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_EXPIRES_IN      = 7d
NODE_ENV            = production
PORT                = 5000
CLIENT_URL          = https://your-frontend.vercel.app
UPI_ID              = parshwapati2009@okhdfcbank
UPI_NAME            = GamerHeadQuarter
PAYMENT_CODE_EXPIRY_HOURS = 24
```

5. Railway will run `npm install` → `postinstall` runs `prisma generate` automatically
6. After first deploy, run migrations: Railway Dashboard → your service → Shell:
   ```
   npx prisma migrate deploy
   node prisma/seed.js
   ```

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import from GitHub → select the root `/GHQ` folder (not `/server`)
3. Framework: **Vite**
4. Set **Environment Variable** in Vercel dashboard:
   ```
   VITE_API_URL = https://your-railway-app.railway.app/api
   ```
5. Deploy — Vercel auto-detects Vite and builds correctly

## Local Development

```bash
# Backend
cd server
cp .env.example .env          # fill in your local values
npm install
npx prisma migrate dev
npm run db:seed
npm run dev                   # starts on :5000

# Frontend (new terminal)
cd ..
cp .env.example .env.local    # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                   # starts on :5173
```

## Default Credentials (after seed)

| Role   | Email              | Password   |
|--------|--------------------|------------|
| Admin  | admin@ghq.gg       | admin123   |
| Player | phantom@ghq.gg     | player123  |
