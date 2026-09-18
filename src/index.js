import express from "express";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Initialize mongoose connection
import mongoose from "mongoose";
mongoose.connect(process.env.DB_URL)
.then(() => console.log("Connected to MongoDB"))
.catch(() => console.log("Error connecting to MongoDB"));

// Middleware - cookie parser/cors
import cookieParser from "cookie-parser";
import cors from "cors";
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(cookieParser());


// Middleware - app level middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Middleware - route level
// Routes
app.get("/", (req, res) => res.json({ message: "Hello from the backend!" }));

// User routes
import userRouter from "./user/user.routes.js";
import transactionRouter from "./transaction/transaction.routes.js";
import DashboardRouter from "./dashboard/dashboard.routes.js";
app.use("/api/user", userRouter);
app.use("/api/dashboard", DashboardRouter);
app.use("/api/transaction", transactionRouter);