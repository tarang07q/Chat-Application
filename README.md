# Real-Time Chat Application (Slack/Messenger Clone)

A production-ready real-time messaging platform with advanced features including 1:1 chats, group messaging, file sharing, and real-time presence tracking.

##  Features

### Core Chat Features
-  1:1 Private Chats
-  Group Chats with Admin Controls
-  Real-time Messaging with Socket.io
-  Typing Indicators
-  Online/Offline Status
-  Read Receipts & Delivery Status
-  Message History with Infinite Scroll

### Advanced Features
-  File Sharing (Images, Documents, Audio)
-  Message Reactions
-  Reply to Messages (Threading)
-  Edit & Delete Messages
-  Push Notifications
-  Full-Text Search
-  Dark/Light Mode
-  @Mentions in Groups
-  Pinned Messages

### Security & Scale
-  JWT Authentication + Refresh Tokens
-  OAuth (Google, GitHub)
-  Redis Pub/Sub for Horizontal Scaling
-  Rate Limiting
-  Message Encryption (Optional)

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: MongoDB
- **Cache/Pub-Sub**: Redis
- **Storage**: AWS S3 / Appwrite
- **Auth**: JWT, Passport.js

### Frontend
- **Framework**: Next.js 15 (React)
- **State Management**: Zustand
- **Styling**: TailwindCSS + Shadcn UI
- **Real-time**: Socket.io Client
- **Data Fetching**: React Query
- **Notifications**: Service Workers

### DevOps
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
chat-application/
├── backend/                 # Node.js Backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── chat/
│   │   │   ├── group/
│   │   │   ├── message/
│   │   │   └── notification/
│   │   ├── sockets/        # Socket.io handlers
│   │   ├── database/       # DB models & config
│   │   ├── middlewares/    # Auth, validation, etc.
│   │   ├── utils/          # Helpers
│   │   └── config/         # App configuration
│   ├── package.json
│   └── Dockerfile
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # Next.js 15 app directory
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Zustand stores
│   │   ├── services/      # API services
│   │   ├── utils/         # Helpers
│   │   └── types/         # TypeScript types
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## 🏗 Architecture

```
Client (Next.js)
      ↓ WebSocket + REST API
API Gateway (Express)
      ↓
Socket.io Server  ←→ Redis (Pub/Sub)
      ↓
MongoDB Database
      ↓
AWS S3 (File Storage)
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Redis
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd chat-application
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

4. **Using Docker (Recommended)**
```bash
docker-compose up -d
```

##  Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chat-app
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

##  API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Chat
- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Start new conversation
- `GET /api/conversations/:id/messages` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

### Groups
- `POST /api/groups` - Create group
- `PUT /api/groups/:id` - Update group
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:userId` - Remove member

## 🔌 WebSocket Events

### Client → Server
- `connection` - Connect to socket
- `join_room` - Join conversation room
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `send_message` - Send new message
- `message_read` - Mark message as read

### Server → Client
- `receive_message` - New message received
- `typing` - Someone is typing
- `stop_typing` - Typing stopped
- `message_delivered` - Message delivered
- `message_read` - Message read
- `online_users` - Online users list
- `user_status_change` - User online/offline

## 🗄 Database Schema

### User
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  avatarUrl: String,
  status: 'online' | 'offline',
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation
```javascript
{
  _id: ObjectId,
  type: 'private' | 'group',
  participants: [ObjectId],
  groupName: String,
  groupAvatar: String,
  admins: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  content: String,
  messageType: 'text' | 'image' | 'file' | 'voice',
  attachments: [{url: String, fileType: String}],
  replyTo: ObjectId,
  reactions: [{userId: ObjectId, emoji: String}],
  seenBy: [ObjectId],
  deliveredTo: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

##  Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

##  Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

