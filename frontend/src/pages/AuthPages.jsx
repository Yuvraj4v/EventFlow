// ============================================================
// Auth Pages — Login, Register, ForgotPassword, ResetPassword
// ============================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import useAuthStore from '../context/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Shared layout ────────────────────────────────────────────
function AuthLayout({ children, title, subtitle, side }) {
  return (
    <div className="min-h-screen flex pt-16">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-950 via-primary-950/40 to-gray-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-violet-600/15 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center text-white max-w-sm">
          <Link to="/" className="flex items-center gap-2 justify-center mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">EventFlow</span>
          </Link>
          {side}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">EventFlow</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

function PasswordInput({ label, registration, error, placeholder = 'Enter password' }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type={show ? 'text' : 'password'} placeholder={placeholder}
          {...registration}
          className={`input pl-10 pr-10 ${error ? 'border-red-400 focus:ring-red-400' : ''}`} />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────
export function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) navigate(result.user.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Sign in to your EventFlow account"
      side={<>
        <h2 className="text-3xl font-bold mb-4">Discover Amazing Events</h2>
        <p className="text-gray-300 leading-relaxed">Join millions of people experiencing life's best moments through EventFlow.</p>
        <div className="mt-8 space-y-3">
          {['Free to join', 'QR code tickets', 'Instant confirmations'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-emerald-400" />{f}</div>
          ))}
        </div>
      </>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
              className={`input pl-10 ${errors.email ? 'border-red-400' : ''}`} />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <PasswordInput label="Password" registration={register('password', { required: 'Password is required' })} error={errors.password} />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input type="checkbox" className="rounded" /> Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</Link>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
          <div className="relative text-center"><span className="px-3 bg-white dark:bg-gray-950 text-xs text-gray-400">or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {['Google', 'GitHub'].map(p => (
            <button key={p} type="button" onClick={() => toast.error(`${p} OAuth: Add in production`)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {p}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign up free</Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mb-1">🧪 Demo Credentials</p>
          <p className="text-xs text-amber-600 dark:text-amber-500">Admin: admin@eventflow.com / Admin@123456</p>
          <p className="text-xs text-amber-600 dark:text-amber-500">User: user@eventflow.com / Password123</p>
        </div>
      </form>
    </AuthLayout>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────
export function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    const result = await registerUser({ name: data.name, email: data.email, password: data.password });
    if (result.success) navigate('/dashboard');
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join EventFlow and start discovering events"
      side={<>
        <h2 className="text-3xl font-bold mb-4">Start Your Journey</h2>
        <p className="text-gray-300 leading-relaxed mb-8">Create a free account and discover thousands of events near you.</p>
        {['No credit card required', 'Instant QR tickets', 'Cancel anytime', 'Email confirmations'].map(f => (
          <div key={f} className="flex items-center gap-2 text-sm mb-2"><CheckCircle className="w-4 h-4 text-emerald-400" />{f}</div>
        ))}
      </>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="John Doe"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
              className={`input pl-10 ${errors.name ? 'border-red-400' : ''}`} />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" placeholder="you@example.com"
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
              className={`input pl-10 ${errors.email ? 'border-red-400' : ''}`} />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <PasswordInput
          label="Password"
          registration={register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
          error={errors.password}
          placeholder="Create a password"
        />

        <PasswordInput
          label="Confirm Password"
          registration={register('confirmPassword', { required: 'Please confirm password', validate: v => v === password || 'Passwords do not match' })}
          error={errors.confirmPassword}
          placeholder="Repeat your password"
        />

        <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input type="checkbox" className="rounded mt-0.5" {...register('terms', { required: 'Please accept terms' })} />
          <span>I agree to the <a href="#" className="text-primary-600">Terms of Service</a> and <a href="#" className="text-primary-600">Privacy Policy</a></span>
        </label>
        {errors.terms && <p className="text-red-500 text-xs">{errors.terms.message}</p>}

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
          {isLoading ? 'Creating account...' : 'Create Free Account'}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────
export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (e) {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your email and we'll send a reset link" side={<><h2 className="text-3xl font-bold mb-4">Password Recovery</h2><p className="text-gray-300">We'll send a secure link to reset your password.</p></>}>
      {sent ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Email Sent!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Check your inbox for a password reset link (valid 10 min).</p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
                className={`input pl-10 ${errors.email ? 'border-red-400' : ''}`} />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Sending...' : 'Send Reset Link'}</button>
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}

// ─── RESET PASSWORD ───────────────────────────────────────────
export function ResetPasswordPage() {
  const { token } = { token: '' }; // handled by standalone ResetPasswordPage.jsx
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async ({ password: pwd }) => {
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password: pwd });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reset failed. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password for your account" side={<h2 className="text-3xl font-bold">Almost there!</h2>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PasswordInput
          label="New Password"
          registration={register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
          error={errors.password}
          placeholder="Create new password"
        />
        <PasswordInput
          label="Confirm New Password"
          registration={register('confirm', { required: 'Please confirm', validate: v => v === password || 'Passwords do not match' })}
          error={errors.confirm}
          placeholder="Repeat new password"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Resetting...' : 'Reset Password'}</button>
      </form>
    </AuthLayout>
  );
}
