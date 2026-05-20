# University Connect

Full-stack academic networking and doubt resolution system for college students, faculty, and admins.

## Tech Stack
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- Database: Firebase Firestore
- Authentication: JWT

## Setup

### Backend
```bash
cd server
npm install
cp .env.example .env
# Update FIREBASE_PROJECT_ID, JWT_SECRET, COLLEGE_DOMAIN
# Download serviceAccountKey.json from Firebase Console and place in server/
npm run dev
```

### Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Firebase Setup
1. Create project at console.firebase.google.com
2. Enable Firestore Database
3. Go to Project Settings → Service Accounts → Generate new private key
4. Download JSON, rename to serviceAccountKey.json, place in server/
5. Add FIREBASE_PROJECT_ID to server/.env

## API Endpoints
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/questions?search=&department=&subject=&unanswered=true`
- POST `/api/questions`
- GET `/api/questions/:id`
- POST `/api/questions/:id/answers`
- PUT `/api/answers/:id/upvote`
- PUT `/api/answers/:id/verify`
- GET `/api/users/faculty`
- GET `/api/admin/users`
- PUT `/api/admin/users/:id/role`
