# Coworking Platform - Express + MongoDB Backend

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/coworking-platform
JWT_SECRET=your-super-secret-key-change-this-in-production
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

3. **Start MongoDB** (if using local):
```bash
mongod
```

4. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start
```

## 📋 API Endpoints

### Authentication
- **POST /api/auth/login** - Login user
- **POST /api/auth/register** - Register new user
- **GET /api/auth/me** - Get current user (requires token)

### Users
- **GET /api/users** - Get all users
- **GET /api/health** - Health check

## 🔧 Default Users (Auto-created)
- **admin@example.com** / admin123 (admin role)
- **staff@example.com** / staff123 (staff role)
- **member@example.com** / member123 (member role)

## 🌐 Deployment Options

### 1. Render (Free)
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set environment variables in dashboard
5. Deploy!

### 2. MongoDB Atlas (Production DB)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 3. Railway
1. Install Railway CLI: `npm i -g @railway/cli`
2. `railway login`
3. `railway init`
4. `railway up`

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123","name":"New User"}'
```

## 📦 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (when added)

## 🛠️ Tech Stack

- **Backend:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT tokens
- **Password Hashing:** bcryptjs
- **CORS:** Enabled for frontend integration

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS configured for frontend URL
- Environment variables for secrets
- MongoDB connection security

## 🚀 Ready to Deploy!

Your Express + MongoDB backend is complete and ready for production deployment!
