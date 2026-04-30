<div align="center">
  <h1>Ethara.AI</h1>
  <p><b>Team Project & Task Management System</b></p>
  <p>A production-ready, full-stack web application with Role-Based Access Control (RBAC) designed to streamline project management, task assignment, and progress tracking within teams.</p>
</div>

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [How It Works (System Workflow)](#-how-it-works-system-workflow)
- [User Roles & Permissions](#-user-roles--permissions)
- [Data Models & Relationships](#-data-models--relationships)
- [Technology Stack](#%EF%B8%8F-technology-stack)
- [Core Features](#-core-features)
- [Installation & Setup](#-installation--setup)

---

## 🚀 Project Overview

Ethara.AI is a modern, responsive platform built to help teams collaborate effectively. It provides a centralized dashboard where administrators can oversee multiple projects and tasks, while team members can focus on their specific assignments. The system is built with security and user experience in mind, featuring JWT-based authentication, a sleek dark-mode UI, and real-time analytics.

---

## ⚙️ How It Works (System Workflow)

The platform operates on a hierarchical delegation model driven by Role-Based Access Control (RBAC):

1. **Authentication:** Users log securely into the system. The backend issues a JWT (JSON Web Token) which determines their identity and role.
2. **Project Initialization:** An `Admin` creates a new Project and assigns existing `Users` (Members) to it.
3. **Task Delegation:** The `Admin` creates Tasks under a specific Project. These tasks are assigned to the Members who are part of that Project. Tasks are given priorities (Low, Medium, High) and deadlines.
4. **Execution & Tracking:** `Members` log in and see a personalized dashboard. They can only view the projects they are a part of and the tasks assigned to them.
5. **Status Updates:** As members work on their assignments, they update the task status (`To Do` ➔ `In Progress` ➔ `Done`).
6. **Analytics:** The Dashboard aggregates these statuses in real-time, providing Admins with a bird's-eye view of project health through visual charts (Recharts).

---

## 👥 User Roles & Permissions

Ethara.AI strictly enforces permissions based on two primary user roles:

### 👑 Admin
- **Users:** Can view the team directory.
- **Projects:** Full CRUD (Create, Read, Update, Delete) access. Can add or remove members from projects.
- **Tasks:** Full CRUD access across all tasks in all projects. Can reassign tasks and change priorities.
- **Dashboard:** Views global analytics across all projects and team members.

### 👤 Member
- **Users:** Can view the team directory (read-only).
- **Projects:** Can only **view** projects they have been explicitly added to. Cannot create or edit projects.
- **Tasks:** Can only **view** tasks assigned to them. Can only **update the status** of their assigned tasks. Cannot edit titles, descriptions, or delete tasks.
- **Dashboard:** Views personalized analytics based on their own assigned tasks.

---

## 🔗 Data Models & Relationships

The database architecture is designed using MongoDB (via Mongoose) with the following relational flow:

- **User**: Represents individuals in the system. Has a distinct `role` (Admin/Member).
- **Project**: Represents a high-level goal or workspace. 
  - `createdBy`: References a single User (Admin).
  - `members`: An array referencing multiple Users (Many-to-Many).
- **Task**: Represents an actionable item.
  - `projectId`: References the parent Project (One-to-Many).
  - `assignedTo`: References a single User.
  - *Attributes*: Status, Priority, Due Date.

---

## 🛠️ Technology Stack

Ethara.AI leverages a modern, robust JavaScript/TypeScript ecosystem.

### Frontend
- **Framework:** React 19 (via Vite 8)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **Form Management & Validation:** React Hook Form + Zod
- **Data Visualization:** Recharts
- **Icons & UI Utilities:** Lucide React, React Hot Toast
- **API Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing
- **Security & Validation:** Helmet, CORS, Zod (for request payload validation)

---

## ✨ Core Features

- **Robust Security**: API endpoints are protected by authentication middlewares. Passwords are mathematically hashed using bcrypt.
- **Data Validation**: End-to-end type safety and validation using Zod on both the client and server sides.
- **Modern UI/UX**: Fully responsive interface featuring glassmorphism, dynamic dark mode, and micro-animations for a premium feel.
- **Dashboard Analytics**: Visual representations of task distributions and project progress.
- **RESTful API**: Clean, well-documented backend architecture following MVC patterns.

---

## 💻 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI.

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database with demo users and tasks:
   ```bash
   npm run seed
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 🔑 Demo Accounts (Created by Seed Script)
- **Admin Role**: `admin@etharaai.com` | Password: `admin123`
- **Member Role**: `jordan@etharaai.com` | Password: `member123`

---

