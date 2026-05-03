const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const courseRoutes = require('./routes/courseRoutes')
const modeARoutes = require('./routes/modeARoutes')
const modeBRoutes = require('./routes/modeBRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  'http://127.0.0.1:5173',
]

function isAllowedDevOrigin(origin) {
  if (!origin) return true

  try {
    const url = new URL(origin)
    const isLocalHost =
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname.startsWith('192.168.') ||
      url.hostname.startsWith('10.')

    return isLocalHost && url.port === '5173'
  } catch {
    return false
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (allowedOrigins.includes(origin) || isAllowedDevOrigin(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/mode-a', modeARoutes)
app.use('/api/mode-b', modeBRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
