# 📚 Bookstore Backend

This is the backend API for the Bookstore web application, built with **Node.js**, **Express**, and **MongoDB**.

## 🔧 Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (4-digit email verification)
- Bcrypt for password hashing

## 📁 Structure

- `routes/` – API route definitions  
- `controllers/` – Logic for each endpoint  
- `models/` – Mongoose schemas  
- `middleware/` – Auth & error handling  
- `utils/` – Helpers (e.g., email sender)

## 🚀 Main Features

- User auth (Register, Login, Email Verification)
- Profile & role management
- Book CRUD operations
- Cart & Wishlist
- Order system
- Admin routes

## 📦 Getting Started

```bash
npm install
npm run dev
````

Create a `.env` file with:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## 🔗 Frontend

Connects to: [bookstore-client](https://github.com/furyinc/bookstore_frontend)
