# Real Estate Backend API 

A professional RESTful API for property management and real estate listings, built using **Node.js, Express, and MongoDB**.

##  Core Features
- **User Authentication:** Secure Login/Register using JWT & Bcrypt.
- **Property Management:** Full CRUD operations with Image Upload support.
- **Advanced Search:** Flexible keyword search (Regex) and smart filtering (Price, Location, Type).
- **Review System:** Users can leave ratings and comments on properties.
- **Booking Inquiry:** Professional visit request system with date validation and anti-spam logic.
- **Role-Based Access:** Protected routes for Admin (manage properties) and Users (booking & reviews).

##  Tech Stack
- **Backend:** Node.js & Express.js
- **Database:** MongoDB & Mongoose
- **Security:** JWT (JsonWebToken) & Bcrypt
- **Files:** Multer (Image handling)
- **Environment:** Dotenv for sensitive data

##  Getting Started

### 1. Prerequisites
- Node.js installed
- MongoDB Atlas account or local MongoDB

### 2. Installation
```bash
npm install