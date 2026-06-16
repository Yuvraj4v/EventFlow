// ============================================================
// Auth Controller - Handles all authentication logic
// ============================================================
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// Helper: send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();

  // Don't send password in response
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    }
  });
};

// ─── @POST /api/auth/register ────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Only allow admin/organizer role if explicitly set and authorized
    const userRole = (role === 'admin' || role === 'organizer') ? 'user' : (role || 'user');

    const user = await User.create({ name, email, password, role: userRole });

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 201, res, 'Registration successful! Welcome to EventFlow.');
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/auth/login ───────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful! Welcome back.');
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/auth/me ───────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedEvents', 'title coverImage startDate location');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/auth/forgot-password ────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.json({
        success: true,
        message: 'If that email is registered, a reset link has been sent.'
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'EventFlow - Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Reset Your Password</h2>
            <p>Hi ${user.name},</p>
            <p>You requested a password reset for your EventFlow account.</p>
            <p>Click the button below to reset your password (valid for 10 minutes):</p>
            <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
              Reset Password
            </a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>— The EventFlow Team</p>
          </div>
        `
      });

      res.json({ success: true, message: 'Password reset email sent successfully.' });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent. Try again later.' });
    }
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/auth/reset-password/:token ───────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    // Hash token to compare with DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful!');
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/auth/update-password ─────────────────────────
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully!');
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/auth/logout ──────────────────────────────────
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
