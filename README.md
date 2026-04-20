# Telangana/AP EAMCET CBT Simulator (Full Stack)

Production-ready full-stack web app that simulates a real EAMCET computer-based test experience using previous-year style questions.

## Tech Stack

- Frontend: React (Vite) + Tailwind CSS + Axios
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: Google Identity Services + backend token verification (`google-auth-library`)
- Session/Auth: JWT in `httpOnly` cookie (+ localStorage fallback token)

## Project Structure

```text
EAPCET/
  backend/
    src/
      app.js
      server.js
      config/db.js
      controllers/
        authController.js
        examController.js
        adminController.js
      middleware/
        authMiddleware.js
      models/
        User.js
        Question.js
        Exam.js
        Attempt.js
      routes/
        authRoutes.js
        examRoutes.js
        adminRoutes.js
      utils/jwt.js
    scripts/seedData.js
    .env.example
    package.json
  frontend/
    src/
      api/
      components/
      context/
      pages/
      utils/
      App.jsx
      main.jsx
      index.css
    .env.example
    package.json
  README.md
```

## Implemented Features

### Authentication and Security

- Google login flow (`POST /api/auth/google`)
- User auto-create on first login with default role `student`
- JWT generation on login
- JWT verification middleware `verifyToken`
- Admin-only middleware `isAdmin`
- Current user endpoint (`GET /api/auth/me`)
- Logout endpoint (`POST /api/auth/logout`)

### Role-Based Access

- Student:
  - View exams
  - Take full/subject tests
  - View own attempts and results
- Admin:
  - Add/edit/delete questions
  - Bulk upload questions via JSON
  - Create exams
  - View all user attempts

### Real Exam Simulation UI

- 180-minute exam timer (configurable per exam)
- Auto-submit when timer hits zero
- Last 10-minute warning banner
- Question palette with CBT states:
  - Not Visited
  - Not Answered
  - Answered
  - Marked for Review
- Controls:
  - Save & Next
  - Previous
  - Mark for Review
  - Clear Response
  - Submit Exam
- Fullscreen mode button
- Navigation warning popup
- Prevent accidental refresh (`beforeunload`)
- LocalStorage auto-save and restore
- Randomized question order support

### Result System

- Score
- Accuracy
- Subject-wise performance
- Incorrect questions review with correct answers

## API Endpoints

### Auth

- `POST /api/auth/google`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Exam

- `GET /api/exam/list`
- `GET /api/exam/questions`
- `POST /api/exam/submit`
- `GET /api/exam/attempts`
- `GET /api/exam/attempt/:attemptId`

### Admin

- `POST /api/admin/question`
- `PUT /api/admin/question/:id`
- `DELETE /api/admin/question/:id`
- `POST /api/admin/questions/bulk`
- `GET /api/admin/questions`
- `POST /api/admin/exam`
- `GET /api/admin/attempts`

## Setup Instructions

### 1. Google OAuth configuration

1. Open Google Cloud Console.
2. Create/select a project.
3. Configure OAuth consent screen.
4. Create OAuth 2.0 Client ID (Web).
5. Add authorized JavaScript origins:
   - `http://localhost:5173`
6. Copy the generated client ID.

### 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Update `.env`:

- `MONGO_URI`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `ADMIN_EMAIL` (must match your Google account email to access admin panel)

Then:

```bash
npm install
npm run seed
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
```

Update `.env`:

- `VITE_API_BASE_URL=http://localhost:5000/api`
- `VITE_GOOGLE_CLIENT_ID=<same Google client id>`

Then:

```bash
npm install
npm run dev
```

### 4. Run app

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

Login with Google account:

- `ADMIN_EMAIL` account gets admin role.
- Other users default to student role.

## Bulk Upload JSON Format

```json
[
  {
    "question": "What is 2 + 2?",
    "options": ["1", "2", "4", "5"],
    "answer": 2,
    "subject": "Mathematics",
    "year": 2024
  }
]
```
