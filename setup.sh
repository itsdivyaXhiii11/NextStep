#!/bin/bash

# GSSS NextStep — Interactive Setup Script
# Run this once after cloning: bash setup.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      GSSS NextStep — Setup           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}You'll need these before starting:${NC}"
echo "  1. Supabase project URL + anon key + service role key"
echo "     → supabase.com → your project → Settings → API"
echo "  2. Resend API key (optional, skip for now)"
echo "     → resend.com → API Keys"
echo ""
read -p "Press Enter to continue…"
echo ""

# Collect values
read -p "Supabase Project URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
read -p "Resend API Key (or press Enter to skip): " RESEND_API_KEY
RESEND_API_KEY=${RESEND_API_KEY:-skip_for_now}
read -p "Your email for From address (e.g. you@gsss.edu): " RESEND_EMAIL
RESEND_EMAIL=${RESEND_EMAIL:-noreply@gsss.edu}

echo ""

# Write backend .env
cat > backend/.env << EOF
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
RESEND_API_KEY=${RESEND_API_KEY}
RESEND_FROM=GSSS NextStep <${RESEND_EMAIL}>
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
EOF

# Write frontend .env
cat > frontend/.env << EOF
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
VITE_API_URL=http://localhost:5000/api
EOF

echo -e "${GREEN}✅ .env files created in backend/ and frontend/${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing backend dependencies…${NC}"
cd backend && npm install && cd ..

echo -e "${BLUE}Installing frontend dependencies…${NC}"
cd frontend && npm install && cd ..

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  All done! Run the app:                          ║${NC}"
echo -e "${GREEN}║                                                  ║${NC}"
echo -e "${GREEN}║  Terminal 1:  cd backend && npm run dev          ║${NC}"
echo -e "${GREEN}║  Terminal 2:  cd frontend && npm run dev         ║${NC}"
echo -e "${GREEN}║                                                  ║${NC}"
echo -e "${GREEN}║  Open: http://localhost:5173                     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to run postgres/init.sql in your Supabase SQL editor!${NC}"
echo ""
