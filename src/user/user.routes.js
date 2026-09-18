import {Router} from 'express';
import {createUser, login, sendOTPEMail, forgotPassword, verifyToken, changePassword, logout, getAllUsers, updateStatus} from './user.controller.js';
import {verifyTokenGuard, adminUserGuard, adminGuard} from '../middlewares/authGuard.middleware.js';

const userRouter = Router();

userRouter.post('/signup', createUser);
userRouter.post('/login', login);
userRouter.post('/sendOTP', sendOTPEMail);
userRouter.post('/forgot-password', forgotPassword);

// authenticated routes
userRouter.post('/verify-token', verifyTokenGuard, verifyToken);
userRouter.put('/change-password', verifyTokenGuard, changePassword);
userRouter.get('/session', adminUserGuard, (req, res) => {
    res.json({message: "Success", userInfo: req.user});
    return;
});
userRouter.get('/logout', logout);

// admin route
userRouter.get('/getUsers', adminGuard, getAllUsers);
userRouter.put('/status/:id', adminGuard, updateStatus);

export default userRouter;