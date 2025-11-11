# 🎯 GETTING STARTED - Read This First!

## 📌 What You Have

A **production-ready real-time chat application** with:
- ✅ Complete backend with Socket.io, MongoDB, Redis
- ✅ Frontend foundation with Next.js 15, Zustand, TailwindCSS
- ✅ Docker setup for easy deployment
- ✅ CI/CD pipeline with GitHub Actions
- ✅ All core chat features implemented

---

## 🚀 Installation (Choose One Method)

### Method 1: Automated Setup (Recommended)

```bash
# Run the setup script
./setup.sh
```

This will:
1. Check dependencies (Node.js, Docker)
2. Install all npm packages
3. Create `.env` files from examples
4. Provide next steps

### Method 2: Using npm Scripts

```bash
# Install all dependencies
npm run install:all

# Start with Docker
npm run docker:up

# Or start manually
# Terminal 1:
npm run dev:backend

# Terminal 2:
npm run dev:frontend
```

### Method 3: Manual Installation

```bash
# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local if needed
npm run dev
```

---

## 🔧 Environment Configuration

### Backend `.env` (Required Changes)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/chat-app

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets - CHANGE THESE!
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local` (Usually OK as is)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 📦 Running the Application

### Option A: Full Docker (Easiest)

```bash
# Start everything
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop everything
docker-compose down
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

### Option B: Hybrid (Databases in Docker, Apps Local)

```bash
# Start only databases
docker-compose up -d mongodb redis

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Option C: Everything Local

Requires MongoDB and Redis installed locally.

```bash
# Start MongoDB (if installed locally)
mongod

# Start Redis (if installed locally)
redis-server

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## ✅ Verify Installation

### 1. Check Backend

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T10:00:00.000Z"
}
```

### 2. Check Frontend

Open browser: http://localhost:3000

You should see the Next.js app (currently default page - UI components not built yet)

### 3. Check Database Connection

Look for these in backend logs:
```
✅ MongoDB connected successfully
✅ Redis connected successfully
✅ Socket.io Redis adapter configured
🚀 Server is running!
```

---

## 🧪 Test the API

### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

Save the `accessToken` from the response!

### Get Current User

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📚 Documentation Files

- **README.md** - Project overview and features
- **DEVELOPMENT.md** - Detailed development guide
- **PROJECT_SUMMARY.md** - Current status and next steps
- **THIS FILE** - Quick start guide

---

## 🎯 Current Status

### ✅ What Works Now

1. **Authentication**
   - User registration
   - Login/Logout
   - Token refresh
   - Protected routes

2. **Real-Time Features**
   - Socket.io connection
   - Typing indicators
   - Online/offline status
   - Presence tracking

3. **Chat Backend**
   - Create conversations
   - Send messages
   - Edit/delete messages
   - Message reactions
   - Read receipts
   - Group management

### ⏳ What Needs to Be Built

1. **Frontend Pages** (Priority)
   - Login page
   - Register page
   - Chat interface
   - Conversation list
   - Message components

2. **Additional Features**
   - File uploads
   - Image sharing
   - Voice messages
   - Search functionality
   - User profiles

---

## 🛠️ Development Workflow

### Daily Development

```bash
# Start development environment
docker-compose up -d mongodb redis

# Backend (auto-reload enabled)
cd backend
npm run dev

# Frontend (hot-reload enabled)
cd frontend
npm run dev
```

### Making Changes

1. **Backend Changes**
   - Edit files in `backend/src/`
   - Server auto-restarts on save
   - Check terminal for errors

2. **Frontend Changes**
   - Edit files in `frontend/src/`
   - Page auto-refreshes on save
   - Check browser console for errors

### Adding New Features

See **DEVELOPMENT.md** for:
- Creating new modules
- Adding routes
- Database models
- Socket events
- Frontend components

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Restart MongoDB
docker-compose restart mongodb

# View MongoDB logs
docker-compose logs mongodb
```

### Redis Connection Failed

```bash
# Check if Redis is running
docker-compose ps redis

# Restart Redis
docker-compose restart redis

# View Redis logs
docker-compose logs redis
```

### Clear Everything and Start Fresh

```bash
# Stop all services
docker-compose down -v

# Remove node_modules
rm -rf backend/node_modules frontend/node_modules node_modules

# Reinstall
./setup.sh

# Start again
docker-compose up -d
```

---

## 📞 Need Help?

1. **Check Documentation**
   - README.md for features
   - DEVELOPMENT.md for API details
   - PROJECT_SUMMARY.md for status

2. **Check Logs**
   ```bash
   # Docker logs
   docker-compose logs -f
   
   # Backend only
   docker-compose logs -f backend
   
   # Frontend only
   docker-compose logs -f frontend
   ```

3. **Common Commands**
   ```bash
   # See all running containers
   docker-compose ps
   
   # Stop all services
   docker-compose down
   
   # Rebuild containers
   docker-compose up -d --build
   
   # View database
   docker-compose exec mongodb mongosh
   
   # View Redis
   docker-compose exec redis redis-cli
   ```

---

## 🎓 Learning Path

If you're learning from this project:

1. **Start with Backend**
   - Understand the authentication flow
   - Study the database models
   - Learn Socket.io events
   - Test APIs with Postman

2. **Move to Frontend**
   - Build login/register pages
   - Create chat components
   - Implement real-time features
   - Add styling with TailwindCSS

3. **Deploy**
   - Use Docker for local testing
   - Deploy to cloud (AWS, DigitalOcean, etc.)
   - Set up domain and SSL
   - Monitor performance

---

## 🚀 Next Steps

After installation:

1. **Test the APIs** with Postman or curl
2. **Start building frontend pages** (see TODO in PROJECT_SUMMARY.md)
3. **Add features** you want
4. **Deploy** when ready
5. **Share** your project!

---

## 💡 Pro Tips

- Use **Postman** for API testing
- Install **MongoDB Compass** for database viewing
- Use **Redis Desktop Manager** for Redis viewing
- Enable **ESLint** and **Prettier** in your IDE
- Use **Docker Desktop** for easy container management
- Check **browser console** for frontend errors
- Check **terminal logs** for backend errors

---

## 📈 This Project is Perfect For:

- ✅ Learning full-stack development
- ✅ Understanding real-time applications
- ✅ Portfolio projects
- ✅ Job interviews
- ✅ Starting a SaaS
- ✅ Understanding scalable architecture

---

**You're all set! Start coding! 🎉**

Questions? Check DEVELOPMENT.md or PROJECT_SUMMARY.md
