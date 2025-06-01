import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectToDatabase } from "./config/database"
import noteRoutes from "./routes/noteRoutes"
import { errorHandler } from "./middleware/errorHandler"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/notes", noteRoutes)

// Error handling middleware
app.use(errorHandler)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Notes API is running" })
})

// Start server
const startServer = async () => {
  try {
    await connectToDatabase()
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
