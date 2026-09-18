import UserModel from './user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../utils/mailer.util.js';
import {otpTemplate} from '../templates/OTP.template.js';
import {generateOTP} from '../utils/generateOTP.util.js';
import {forgotPasswordTemplate} from '../templates/forgotPassword.template.js';

const createUser = async (req, res) => {
    try {
        const data = req.body;
        const user = new UserModel(data);
        await user.save();
        res.json({message: "User created successfully"});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
}

const sendOTPEMail = async (req, res) => {
    try {
        const {email} = req.body;
        const otp = generateOTP();
        const isUserExists = await UserModel.findOne({email});
        if(isUserExists) {
            res.status(400).json({message: "User already exists"});
            return;
        }
        const success = await sendMail(email, "OTP for Signup", otpTemplate(otp));
        if(!success) {
            res.status(500).json({message: "Failed to send OTP"});
        } else {
            res.json({message: "OTP sent successfully", otp: otp});
        }
    } catch(err) {
        res.status(500).json({message: err.message});
    }
}

const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        // find user by email
        const user = await UserModel.findOne({email});
        if(!user) {
            res.status(404).json({message: "User not found"});
            return;
        }

        // check if user is active
        if(!user.status) {
            res.status(403).json({message: "User is inactive. Please contact admin."});
            return;
        }
        
        // compare password
        const isLoggedIn = await bcrypt.compare(password, user.password);
        if(!isLoggedIn) {
            res.status(401).json({message: "Invalid credentials"});
            return;
        }

        const token = await createToken(user);
        res.cookie("authtoken", token, {
            path: "/", // cookie will be available for all routes
            maxAge: 24 * 60 * 60 * 1000, // cookie expiration in ms
            domain: process.env.ENVIRONMENT === "dev" ? "localhost" : process.env.DOMAIN || undefined,
            secure: process.env.ENVIRONMENT !== "dev", // only send cookie over https not the http
            httpOnly: true, // frontend cant read with JS, only backend can read it

            // During dev, front/backend are on same domain (localhost), different ports, so we can use "lax" or "strict" for sameSite.
            sameSite: process.env.ENVIRONMENT === "dev" ? "lax" : "none",
        });
        res.json({message: "Login successful", role: user.role});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
}

const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await UserModel.findOne({email});
        if(!user) {
            res.status(404).json({message: "User does not exist"});
            return;
        }

        const token = await jwt.sign({id: user._id, email: user.email}, process.env.FORGOT_PASSWORD_SECRET, {expiresIn: "10m"});
        const link = `${process.env.DOMAIN}/forgot-password?token=${token}`;
        const sent = await sendMail(email, "Password Reset Link", forgotPasswordTemplate(user.fullName, link));

        if(!sent) {
            res.status(500).json({message: "Failed to send password reset link"});
        } else {
            res.json({message: "Password reset link sent to your email"});
        }
    } catch(err) {
        res.status(500).json({message: err.message});
    }
}

const verifyToken = async (req, res) => {
    try {
        res.json({message: "Verification successful"});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
}

const changePassword = async (req, res) => {
    try {
        const {password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        await UserModel.findByIdAndUpdate(req.user.id, {password: hashedPassword});
        res.json({message: "Password changed successfully"});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
}

const logout = async (req, res) => {
    try {
        res.cookie("authtoken", null, {
            httpOnly: true,
            secure: process.env.ENVIRONMENT !== "dev",
            sameSite: process.env.ENVIRONMENT === "dev" ? "lax" : "none",
            path: "/",
            domain: process.env.ENVIRONMENT === "dev" ? "localhost" : process.env.DOMAIN || undefined,
            maxAge: 0
        });
        res.status(200).json({message: "Logout successful"});
    } catch(err) {
        res.status(401).json({message: err.message});
    }
}

// helper function
const createToken = async (user) => {
    // create a token
    const payload = {
        id: user._id,
        fullname: user.fullName,
        email: user.email,
        role: user.role
    }

    const token = jwt.sign(payload, process.env.AUTH_SECRET, {expiresIn: "1d"});
    return token;
}

const getAllUsers = async (req, res) => {
    try {
        const {page, limit} = req.query;
        const skip = (page - 1) * limit;
        const users = await UserModel.find().select("-password").sort({createdAt: -1}).lean().skip(skip).limit(limit);
        const totalUsers = await UserModel.countDocuments();

        if(!users) {
            res.status(404).json({message: "No users found"});
            return;
        }
        res.json({message: "Users fetched successfully", allUsers: users, totalUsers});
    } catch(err) {
        res.status(500).json({message: err.message || "Internal Server Error"});
    } 
}

const updateStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        const user = await UserModel.findByIdAndUpdate(id, {status}, {new: true});

        if(!user) {
            res.status(404).json({message: "User not found", user: null});
            return;
        }

        res.json({message: "User status updated successfully", user});
    } catch(err) {
        res.status(500).json({message: err.message || "Internal Server Error"});
    }
}

export {createUser, login, sendOTPEMail, forgotPassword, verifyToken, changePassword, logout, getAllUsers, updateStatus};