#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Chat Application Setup Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker version: $(docker --version)${NC}"
else
    echo -e "${YELLOW}⚠️  Docker is not installed. Docker setup will be skipped.${NC}"
fi

echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
echo ""

# Backend setup
echo -e "${GREEN}Setting up Backend...${NC}"
cd backend || exit

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created backend/.env - Please update with your credentials${NC}"
fi

echo "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

cd ..

# Frontend setup
echo ""
echo -e "${GREEN}Setting up Frontend...${NC}"
cd frontend || exit

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating frontend .env.local file...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created frontend/.env.local - Please update if needed${NC}"
fi

echo "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo -e "1. ${YELLOW}Update environment variables:${NC}"
echo -e "   - backend/.env"
echo -e "   - frontend/.env.local"
echo ""
echo -e "2. ${YELLOW}Start MongoDB and Redis:${NC}"
echo -e "   ${GREEN}docker-compose up -d mongodb redis${NC}"
echo ""
echo -e "3. ${YELLOW}Start the development servers:${NC}"
echo ""
echo -e "   ${GREEN}Terminal 1 (Backend):${NC}"
echo -e "   cd backend && npm run dev"
echo ""
echo -e "   ${GREEN}Terminal 2 (Frontend):${NC}"
echo -e "   cd frontend && npm run dev"
echo ""
echo -e "4. ${YELLOW}Or run everything with Docker:${NC}"
echo -e "   ${GREEN}docker-compose up${NC}"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:5000${NC}"
echo -e "   Health:   ${GREEN}http://localhost:5000/health${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
