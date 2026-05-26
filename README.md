# GSSS NextStep 🎓

**Letter of Recommendation Management System**  
GSSS Institute of Engineering & Technology for Women, Mysuru

---

## Stack
| Layer | Tool | Cost |
|---|---|---|
| Frontend | React + Tailwind + Vite | Free (Vercel) |
| Backend | Node.js + Express | Free (Render) |
| Database + Auth + Storage | Supabase | Free |
| Email | Resend | Free (3000/month) |

---

## Quick Start (Local Dev)

### 1. Clone & Setup
```bash
git clone https://github.com/YOUR_USERNAME/NextStep.git
cd NextStep
bash setup.sh        # interactive — asks for your keys, installs deps
```

### 2. Run Supabase Schema
- Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
- Paste the contents of `postgres/init.sql` → click **Run**

### 3. Create Supabase Storage Bucket
- Go to **Storage** → **New bucket**
- Name: `nextstep-files` → Public: **ON** → Create

### 4. Run the App
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open **http://localhost:5173**

---

## First Admin User
After running the schema, create your admin account:

1. Go to Supabase → **Authentication → Users → Add User**
2. Enter email + password → Create
3. Copy the new user's UUID
4. Go to **SQL Editor** and run:
```sql
INSERT INTO users (id, name, email, role, status)
VALUES ('<uuid-from-step-2>', 'Admin', 'admin@gsss.edu', 'admin', 'active');
```
5. Log in at `/login` with those credentials

---

## Deploy to Production

### Backend → Render
1. Push to GitHub
2. [render.com](https://render.com) → New Web Service → connect repo
3. Root dir: `backend` | Build: `npm install` | Start: `node src/index.js`
4. Add all env vars from `backend/.env.example`

### Frontend → Vercel
1. [vercel.com](https://vercel.com) → New Project → connect repo
2. Root dir: `frontend`
3. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (your Render URL)

---

## Project Structure
```
NextStep/
├── backend/
│   ├── src/
│   │   ├── index.js          # Entry point
│   │   ├── routes/           # auth, lor, profile, analytics, reports, notifications, admin
│   │   ├── middleware/        # JWT auth + role check
│   │   └── services/         # PDF gen, email, cron
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Routes
│   │   ├── pages/             # student/, faculty/, coordinator/, admin/
│   │   ├── components/        # Layout
│   │   ├── context/           # AuthContext
│   │   └── utils/             # api.js, supabase.js
│   └── .env.example
├── postgres/
│   └── init.sql               # Full DB schema — run in Supabase
├── setup.sh                   # One-command local setup
└── render.yaml                # Render deploy config
```

---

## Roles
| Role | Can do |
|---|---|
| **Student** | Submit LOR requests, track status, download PDFs, update outcome |
| **Faculty** | Review requests, approve/reject, add remarks |
| **Coordinator** | View all requests, generate reports, manage users (view) |
| **Admin** | Everything + activate/deactivate users + change roles |

---

Built for GSSS IETW Placement Department · 2026
