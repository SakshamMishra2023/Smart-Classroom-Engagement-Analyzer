function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || res.statusCode

  if (!statusCode || statusCode < 400) {
    statusCode = 500
  }

  if (error.name === 'CastError') {
    statusCode = 404
  }

  if (error.code === 11000) {
    statusCode = 409
  }

  if (error.name === 'MulterError') {
    statusCode = 400
  }

  res.status(statusCode).json({
    message:
      error.code === 11000
        ? 'A record with these unique details already exists.'
        : error.message || 'Server error',
  })
}

module.exports = { notFound, errorHandler }
