# 🏘️ Smart Community Service & Local Marketplace Platform

> A full-stack web application that connects communities by enabling users to discover trusted service providers, hire freelancers, buy and sell products, and communicate securely in real-time.

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=vercel)](https://smart-community-platform.vercel.app)
[![API Status](https://img.shields.io/badge/API-Online-brightgreen?style=for-the-badge&logo=railway)](https://smart-community-platform.up.railway.app/health)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 📋 **Table of Contents**

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 **Overview**

The **Smart Community Service & Local Marketplace Platform** is a production-ready web application designed to foster community engagement by providing a centralized platform for:

- **Service Discovery** - Find and hire local service providers
- **Product Marketplace** - Buy and sell products within your community
- **Real-Time Communication** - Instant messaging between users
- **Booking Management** - Schedule and manage service appointments
- **Secure Authentication** - JWT-based authentication with role-based access control

This project was developed as part of the **Teyzix Core Internship Program (FSWD-3)** and demonstrates industry-standard full-stack development practices.

---

## ✨ **Features**

### 🔐 **Authentication & Security**
- ✅ User Registration & Login with JWT
- ✅ Password Hashing (BCrypt)
- ✅ Email Verification
- ✅ Forgot Password / Reset Password
- ✅ Role-Based Access Control (Client, Provider, Admin)
- ✅ Protected Routes & API Endpoints

### 👤 **User Profiles**
- ✅ Profile Picture Upload
- ✅ Bio, Location, Contact Information
- ✅ Skills & Services
- ✅ Active Listings
- ✅ Reviews & Ratings

### 🛍️ **Product Marketplace**
- ✅ Create, Edit, Delete Product Listings
- ✅ Multiple Image Upload
- ✅ Search Products
- ✅ Filter by Category & Price
- ✅ Save Favorite Listings

### 🛠️ **Service Marketplace**
- ✅ Create Service Listings
- ✅ Pricing & Delivery Time
- ✅ Portfolio Images
- ✅ Service Categories
- ✅ Availability Management

### 📅 **Booking System**
- ✅ Request a Service
- ✅ Select Date & Time
- ✅ Track Booking Status (Pending, Confirmed, Completed, Cancelled)
- ✅ Accept / Reject Requests
- ✅ Booking History

### 💬 **Real-Time Messaging**
- ✅ Instant Messaging
- ✅ Typing Indicators
- ✅ Read Receipts
- ✅ Online Status

### ⭐ **Reviews & Ratings**
- ✅ Submit Reviews
- ✅ Star Ratings (1-5)
- ✅ View Seller Reputation
- ✅ Admin Review Moderation

### 📊 **Dashboards**
- ✅ **Client Dashboard** - Active bookings, favorites, notifications
- ✅ **Provider Dashboard** - Service requests, earnings, listings
- ✅ **Admin Dashboard** - User management, platform statistics, content moderation

### 🔔 **Notifications**
- ✅ In-App Notifications
- ✅ Booking Request Alerts
- ✅ New Message Alerts
- ✅ Review Notifications

---

## 🛠️ **Tech Stack**

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 14.x | React Framework |
| [React](https://reactjs.org/) | 18.x | UI Library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type Safety |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | Styling |
| [Socket.IO Client](https://socket.io/) | 4.x | Real-Time Communication |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| [Node.js](https://nodejs.org/) | 18.x | Runtime |
| [Express](https://expressjs.com/) | 4.x | Web Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type Safety |
| [Prisma](https://www.prisma.io/) | 5.x | ORM |
| [PostgreSQL](https://www.postgresql.org/) | 15.x | Database |
| [Socket.IO](https://socket.io/) | 4.x | Real-Time Communication |
| [JWT](https://jwt.io/) | 9.x | Authentication |

### **Deployment**
| Service | Purpose |
|---------|---------|
| [Railway](https://railway.app/) | Backend Hosting |
| [Vercel](https://vercel.com/) | Frontend Hosting |
| [Neon](https://neon.tech/) | PostgreSQL Database |
| [Cloudinary](https://cloudinary.com/) | Image Storage |

---

## 📁 **Project Structure**

Smart-community-platform/
├── backend/ # Backend API Server
│ ├── src/
│ │ ├── config/ # Configuration files
│ │ ├── controllers/ # Request handlers
│ │ ├── middlewares/ # Express middlewares
│ │ ├── models/ # Prisma models
│ │ ├── routes/ # API routes
│ │ ├── services/ # Business logic
│ │ ├── sockets/ # Socket.IO handlers
│ │ ├── utils/ # Utility functions
│ │ ├── validators/ # Input validation
│ │ ├── app.ts # Express app setup
│ │ └── server.ts # Server entry point
│ ├── prisma/
│ │ ├── schema.prisma # Database schema
│ │ └── seed.ts # Seed data
│ ├── .env.example # Environment variables template
│ └── package.json
│
├── frontend/ # Next.js Frontend
│ ├── src/
│ │ ├── app/ # Next.js App Router
│ │ │ ├── (auth)/ # Authentication pages
│ │ │ ├── (dashboard)/ # Dashboard pages
│ │ │ ├── (marketplace)/ # Marketplace pages
│ │ │ ├── admin/ # Admin pages
│ │ │ └── api/ # API routes
│ │ ├── components/ # Reusable components
│ │ ├── context/ # React Context providers
│ │ ├── hooks/ # Custom React hooks
│ │ ├── services/ # API services
│ │ ├── styles/ # Global styles
│ │ ├── types/ # TypeScript types
│ │ └── utils/ # Utility functions
│ ├── .env.example # Environment variables template
│ └── package.json
│
├── docker/ # Docker configuration
├── docs/ # Documentation
├── scripts/ # Utility scripts
├── .gitignore
├── LICENSE
└── README.md


---

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+
- npm 8+
- PostgreSQL 15+ (or Neon account)
- Git

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/yourusername/smart-community-platform.git
cd smart-community-platform

# Navigate to backend
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev

# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Update .env.local with your API URL
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start development server
npm run dev



🗄️ Database Schema
The database schema includes the following main models:

User - Authentication and profile information

Product - Product listings for marketplace

Service - Service listings with pricing

Booking - Service appointments and scheduling

Message - Real-time chat messages

Review - User ratings and feedback

Favorite - Saved listings

Notification - In-app notifications

View full database schema →

📡 API Documentation
Authentication Endpoints
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
POST	/api/auth/logout	Logout user
POST	/api/auth/forgot-password	Send reset password email
POST	/api/auth/reset-password	Reset password
GET	/api/auth/me	Get current user

📡 User Endpoints
Method	Endpoint	Description
GET	/api/users/profile	Get user profile
PUT	/api/users/profile	Update user profile
GET	/api/users/profile/stats	Get user statistics
GET	/api/users/profile/listings	Get user listings

📡 Product Endpoints
Method	Endpoint	Description
GET	/api/products	Get all products
POST	/api/products	Create product
GET	/api/products/:id	Get product details
PUT	/api/products/:id	Update product
DELETE	/api/products/:id	Delete product

📡 Service Endpoints
Method	Endpoint	Description
GET	/api/services	Get all services
POST	/api/services	Create service
GET	/api/services/:id	Get service details
PUT	/api/services/:id	Update service
DELETE	/api/services/:id	Delete service

📡 Booking Endpoints
Method	Endpoint	Description
GET	/api/bookings	Get all bookings
POST	/api/bookings	Create booking
GET	/api/bookings/:id	Get booking details
PUT	/api/bookings/:id	Update booking
DELETE	/api/bookings/:id	Cancel booking

📡 Message Endpoints
Method	Endpoint	Description
GET	/api/messages/conversations	Get all conversations
GET	/api/messages/:userId	Get messages with user
POST	/api/messages	Send message
PUT	/api/messages/read/:userId	Mark messages as read

📡 Review Endpoints
Method	Endpoint	Description
GET	/api/reviews	Get all reviews
POST	/api/reviews	Create review
GET	/api/reviews/:id	Get review details
PUT	/api/reviews/:id	Update review

📡 Admin Endpoints
Method	Endpoint	Description
GET	/api/admin/stats	Platform statistics
GET	/api/admin/users	List all users
PUT	/api/admin/users/:id	Update user
GET	/api/admin/listings	List all listings
PUT	/api/admin/listings/:id	Approve/reject listing

🚀 Deployment
Backend (Railway)
Push code to GitHub

Go to railway.app

Create new project → Deploy from GitHub

Set root directory to /backend

Add environment variables

Deploy

Frontend (Vercel)
Push code to GitHub

Go to vercel.com

Import project

Set root directory to /frontend

Add environment variables

Deploy

🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

Commit Convention
text
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code style update
refactor: Code refactoring
test: Test updates
chore: Build/package 

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

📧 Contact
Project Maintainer: Sami Abid
Email: samirao9372@gmail.com

🙏 Acknowledgments
Teyzix Core - Internship Program

Next.js - React Framework

Railway - Backend Hosting

Vercel - Frontend Hosting

Neon - PostgreSQL Database

⭐ Support
If you find this project useful, please give it a ⭐ on GitHub!

Built with ❤️ by Sami Abid