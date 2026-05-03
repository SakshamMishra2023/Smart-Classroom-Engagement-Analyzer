# Smart Classroom Analyzer

Smart Classroom Analyzer is a full-stack classroom monitoring project with:

- a React + Vite frontend
- an Express + MongoDB backend
- Roboflow-powered video analysis
- two operating modes for classroom review and exam monitoring

## Project Overview

The project is designed for teachers.

### Mode A: Concentration Analysis

Mode A lets a teacher:

- sign in to the dashboard
- select a course
- upload a recorded classroom video
- send that video to the backend for processing
- store lecture-level results in MongoDB
- view detection totals by class in charts and summary cards

The backend samples video frames, sends them to the Roboflow model, and stores compact totals such as:

```json
{
  "classCounts": {
    "8": 12,
    "4": 3,
    "3": 7
  },
  "totalDetections": 22,
  "frameCount": 15
}
```

### Mode B: Live Exam Simulation

Mode B simulates live exam monitoring.

The backend:

- reads a simulation video from the backend folder
- samples frames over time
- checks Roboflow predictions
- treats class `4` as cheating for now
- sends live alerts to the frontend through Server-Sent Events (SSE)
- sends a zoomed-in crop of the detected person along with the alert

The frontend then shows:

- live alert notifications
- alert evidence images
- simulation status

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Multer for uploads
- ffmpeg for frame extraction and alert image crops
- Roboflow inference API

## Project Structure

```text
frontend/
  src/                  React frontend
  public/               Static frontend assets
  backend/              Express backend
    src/
    simulation/         Mode B simulation video folder
    uploads/            Temporary uploaded files
    tmp/                Temporary extracted frames
```

## Authentication

Teachers can:

- sign up with name, email, and password
- sign in with email and password

The backend returns a JWT token, and the frontend stores it for authenticated API calls.

## Main Features

- teacher signup and signin
- MongoDB-backed course storage
- MongoDB-backed lecture storage
- Mode A video upload and analysis
- saved class totals for each uploaded lecture
- Mode B live cheating alert simulation
- cropped evidence image for cheating alerts

## Backend Routes

Base URL:

```text
http://localhost:5000
```

### Public Routes

- `GET /api/health`
- `POST /api/signup`
- `POST /api/signin`
- `POST /api/auth/signup`
- `POST /api/auth/signin`

### Protected Routes

Use:

```http
Authorization: Bearer <jwt>
```

- `GET /api/courses`
- `POST /api/courses`
- `GET /api/courses/:courseId`
- `GET /api/courses/:courseId/lectures`
- `POST /api/courses/:courseId/lectures`
- `GET /api/courses/:courseId/lectures/:lectureId`
- `POST /api/mode-a/courses/:courseId/lectures/analyze-video`
- `GET /api/mode-b/simulation/stream?token=<jwt>`

## Setup

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create:

```text
backend/.env
```

Use `backend/.env.example` as a reference.

Important values:

- `MONGODB_URI`
- `JWT_SECRET`
- `ROBOFLOW_API_KEY`
- `ROBOFLOW_MODEL_URL`
- `MODE_B_VIDEO_PATH`

### 4. Add the Mode B simulation video

Put your video here:

```text
backend/simulation/mode-b-video.mp4
```

Or point `MODE_B_VIDEO_PATH` to a different file in `backend/.env`.

### 5. Run the backend

From the project root:

```bash
npm run backend:dev
```

### 6. Run the frontend

From the project root:

```bash
npm run dev
```

## Useful Scripts

From the project root:

```bash
npm run dev
npm run build
npm run lint
npm run backend:dev
npm run backend:start
npm run backend:check
```

## Current Behavior Summary

- Mode A stores compact lecture totals by detection class
- Mode B streams class `4` cheating alerts live
- frontend and backend are already integrated for auth, Mode A, and Mode B simulation

## Notes

- Mode A currently stores totals, not every individual detection box
- Mode B currently treats class `4` as the cheating signal
- Mode B is a simulation driven by a backend video file, not a webcam stream yet

## Backend Details

For more backend-specific notes, see:

[backend/README.md](/c:/Users/anant/Code/College/CV/Project/frontend/backend/README.md)
