
import express from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  verifyOTP, 
  resetPassword 
} from '../controllers/authController.js';
import { 
  validateRegister, 
  validateLogin, 
  validateEmail, 
  validateOTP, 
  validateResetPassword 
} from '../middleware/authValidation.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateEmail, forgotPassword);
router.post('/verify-otp', validateOTP, verifyOTP);
router.post('/reset-password', validateResetPassword, resetPassword);

export default router;
