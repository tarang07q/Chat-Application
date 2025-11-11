# Development Guide

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [WebSocket Events](#websocket-events)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)

## Project Overview

This is a production-grade real-time chat application built with:
- **Backend**: Node.js, Express, Socket.io, MongoDB, Redis
- **Frontend**: Next.js 15, React, Zustand, TailwindCSS
- **Real-time**: Socket.io with Redis adapter for horizontal scaling
- **DevOps**: Docker, Nginx, GitHub Actions CI/CD

## Architecture

### Backend Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── database/        # MongoDB models and connection
│   │   └── models/      # User, Conversation, Message, Notification
│   ├── middlewares/     # Auth, error handling, validation
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication (JWT, OAuth)
│   │   ├── chat/        # Conversations
│   │   └── message/     # Messages
│   ├── sockets/         # Socket.io configuration
│   ├── utils/           # Redis, helpers
│   └── server.ts        # Main server file
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/             # Next.js 15 app directory
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API and Socket services
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 5+
- Redis 6+
- Docker (optional)

### Quick Start

1. **Run setup script:**
```bash
chmod +x setup.sh
./setup.sh
```

2. **Start services with Docker:**
```bash
docker-compose up -d
```

3. **Or start manually:**

Terminal 1 - Start databases:
```bash
docker-compose up -d mongodb redis
```

Terminal 2 - Backend:
```bash
cd backend
npm run dev
```

Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```

### Environment Setup

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Development Workflow

### Backend Development

1. **Create a new module:**
```bash
mkdir -p backend/src/modules/feature-name
cd backend/src/modules/feature-name
touch feature.service.ts feature.controller.ts feature.routes.ts
```

2. **Add model:**
```bash
touch backend/src/database/models/FeatureName.ts
```

3. **Run in development:**
```bash
cd backend
npm run dev  # Auto-reloads on changes
```

### Frontend Development

1. **Create component:**
```bash
mkdir -p frontend/src/components/FeatureName
touch frontend/src/components/FeatureName/index.tsx
```

2. **Add to store:**
```bash
touch frontend/src/store/featureStore.ts
```

3. **Run in development:**
```bash
cd frontend
npm run dev  # Hot reload enabled
```

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Chat Endpoints

#### Get Conversations
```http
GET /api/conversations
Authorization: Bearer <access_token>
```

#### Start Private Chat
```http
POST /api/conversations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "type": "private",
  "participantId": "user_id_here"
}
```

#### Create Group
```http
POST /api/groups
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Project Team",
  "participants": ["user_id_1", "user_id_2"]
}
```

### Message Endpoints

#### Get Messages
```http
GET /api/conversations/:conversationId/messages?page=1&limit=50
Authorization: Bearer <access_token>
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "conversationId": "conv_id",
  "content": "Hello!",
  "messageType": "text"
}
```

## WebSocket Events

### Client → Server

```javascript
// Join conversation
socket.emit('join_room', { conversationId: 'conv_id' });

// Start typing
socket.emit('typing', { conversationId: 'conv_id' });

// Stop typing
socket.emit('stop_typing', { conversationId: 'conv_id' });

// Mark as read
socket.emit('message_read', { 
  messageId: 'msg_id', 
  conversationId: 'conv_id' 
});
```

### Server → Client

```javascript
// New message
socket.on('receive_message', (data) => {
  console.log('New message:', data.message);
});

// User typing
socket.on('typing', (data) => {
  console.log(`${data.username} is typing...`);
});

// User status change
socket.on('user_status_change', (data) => {
  console.log(`User ${data.userId} is ${data.status}`);
});
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String (unique),
  passwordHash: String,
  avatarUrl: String,
  status: 'online' | 'offline',
  lastActive: Date,
  provider: 'local' | 'google' | 'github',
  refreshTokens: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Collection
```javascript
{
  _id: ObjectId,
  type: 'private' | 'group',
  participants: [ObjectId],
  groupName: String (for groups),
  groupAvatar: String (for groups),
  admins: [ObjectId] (for groups),
  lastMessage: ObjectId,
  lastMessageAt: Date,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Collection
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  content: String,
  messageType: 'text' | 'image' | 'file' | 'voice',
  attachments: [{
    url: String,
    fileType: String,
    fileName: String,
    fileSize: Number
  }],
  replyTo: ObjectId (optional),
  reactions: [{
    userId: ObjectId,
    emoji: String,
    createdAt: Date
  }],
  seenBy: [ObjectId],
  deliveredTo: [ObjectId],
  isEdited: Boolean,
  isDeleted: Boolean,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### E2E Tests
```bash
# Add Playwright or Cypress tests here
```

## Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

1. **Build backend:**
```bash
cd backend
npm run build
```

2. **Build frontend:**
```bash
cd frontend
npm run build
```

3. **Deploy with PM2:**
```bash
pm2 start ecosystem.config.js
```

### Environment Variables for Production

Ensure these are set:
- `NODE_ENV=production`
- `JWT_SECRET=<strong-secret>`
- `MONGODB_URI=<production-db-uri>`
- `REDIS_HOST=<production-redis-host>`

## Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:5000/health

# Response
{
  "status": "ok",
  "timestamp": "2025-11-11T10:00:00.000Z"
}
```

### Logs
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# PM2 logs
pm2 logs
```

## Troubleshooting

### Common Issues

1. **Socket connection fails:**
   - Check CORS settings in backend
   - Verify Socket.io URL in frontend .env

2. **Database connection error:**
   - Ensure MongoDB is running
   - Check connection string in .env

3. **Redis connection error:**
   - Verify Redis is running
   - Check Redis host and port

### Debug Mode

Enable debug logs:
```bash
# Backend
DEBUG=* npm run dev

# Frontend
NEXT_PUBLIC_DEBUG=true npm run dev
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests
4. Submit PR

## License

MIT
