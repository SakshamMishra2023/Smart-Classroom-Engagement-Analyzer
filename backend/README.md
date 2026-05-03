# Classroom Vision Backend

Express + MongoDB backend for teacher auth, course and lecture storage, and Mode A video analysis.

## Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Set `MONGODB_URI`, `JWT_SECRET`, and `ROBOFLOW_API_KEY` in `backend/.env`.

## Main Routes

- `POST /api/signup`
- `POST /api/signin`
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/courses`
- `POST /api/courses`
- `GET /api/courses/:courseId`
- `GET /api/courses/:courseId/lectures`
- `GET /api/courses/:courseId/lectures/:lectureId`
- `POST /api/mode-a/courses/:courseId/lectures/analyze-video`
- `GET /api/mode-b/simulation/stream?token=<jwt>`

Authenticated routes require:

```http
Authorization: Bearer <jwt>
```

The Mode A route expects `multipart/form-data` with a `video` file and optional fields:
`title`, `lectureDate`, `section`, and `notes`.

Mode B live simulation reads `backend/simulation/mode-b-video.mp4` by default. Put your
simulation video there, then open Mode B in the frontend. The stream sends an alert when
Roboflow detects class `4`.
