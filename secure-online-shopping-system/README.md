# Secure Online Shopping System (Level 6 Project)

## Project Overview
This project is a secure, scalable e-commerce application developed as part of the SEC6201 coursework. It demonstrates advanced security practices, including Role-Based Access Control (RBAC), server-side validation, and secure cloud functions.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, Context API.
- **Backend**: Firebase Cloud Functions, Firestore.
- **Security**: Firebase Auth, Custom Security Rules, Server-side logic.

## Security Features
1. **Server-Side Price Authority**: The `placeOrder` Cloud Function recalculates all prices servers-side. Client-side prices are ignored.
2. **RBAC**: strict Firestore rules ensure only Admins can modify products.
3. **Data Protection**: Users can only access their own orders.
4. **HTTPS Enforcement**: All operations occur over secure HTTPS channels via Firebase.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase Project with Auth and Firestore enabled.

### Installation

1. **Clone/Navigate** to project:
   ```bash
   cd secure-online-shopping-system
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   # Create .env.local with your Firebase Config
   npm run dev
   ```

3. **Backend Setup**:
   ```bash
   cd ../backend/functions
   npm install
   # Deploy
   firebase deploy --only functions
   firebase deploy --only firestore:rules
   ```

## Admin Bootstrap
To create an admin:
1. Register a user via the UI.
2. Go to Firestore Console > `users` collection.
3. Manually change the `role` field from `"user"` to `"admin"`.
