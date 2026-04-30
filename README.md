# Ethara.AI — Team Project & Task Management System

A production-ready, full-stack web application with Role-Based Access Control (RBAC) to manage projects, assign tasks, and track progress within a team.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Recharts, React Hook Form, Zod.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (via Mongoose).
- **Authentication**: JWT, bcryptjs.

## Features
- **Role-Based Access Control**: Admins can manage projects, users, and all tasks. Members can only view assigned projects and update statuses of their assigned tasks.
- **Dashboard Analytics**: Real-time charts of task status and priority distributions.
- **Secure Authentication**: JWT-based auth with HTTP-only compatible interception and bcrypt hashing.
- **Modern UI**: Fully responsive interface with glassmorphism, dark mode, micro-animations, and toasts.

## Running Locally

### 1. Backend Setup
1. Open terminal and navigate to `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Ensure you have MongoDB running locally at `mongodb://localhost:27017`
4. Seed the database with demo users/tasks: `npm run seed`
5. Start the server: `npm run dev`

### 2. Frontend Setup
1. Open terminal and navigate to `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

### Demo Accounts (Created by Seed Script)
- **Admin**: `admin@etharaai.com` | `admin123`
- **Member**: `jordan@etharaai.com` | `member123`

## Deployment Guide

### Backend Deployment (Railway)
1. Push this repository to GitHub.
2. Go to [Railway.app](https://railway.app/) and create a new project from your GitHub repo.
3. Select the `backend` folder as the root directory (or configure Railway to run `cd backend && npm install && npm start`).
4. Provision a **MongoDB** plugin within Railway and copy the connection string.
5. In your Railway backend service, set the Environment Variables:
   - `PORT=5000`
   - `MONGODB_URI=<your-railway-mongo-url>`
   - `JWT_SECRET=<generate-a-strong-secret>`
   - `FRONTEND_URL=<your-vercel-url>`

### Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com/) and import the same GitHub repository.
2. Select the `frontend` folder as the Root Directory.
3. Vercel will automatically detect Vite. Set the Environment Variables:
   - `VITE_API_URL=<your-railway-backend-url>` (e.g., `https://etharaai-api.up.railway.app`)
4. Click **Deploy**.

*Note: Ensure you update CORS settings in the backend environment to allow your newly generated Vercel frontend URL.*
