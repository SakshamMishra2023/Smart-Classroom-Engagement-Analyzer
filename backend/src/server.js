require('dotenv').config()

const app = require('./app')
const connectDatabase = require('./config/db')

const port = process.env.PORT || 5000

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend API running on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start backend:', error.message)
    process.exit(1)
  })
