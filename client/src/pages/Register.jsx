import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiUser, HiAcademicCap, HiEye, HiEyeOff } from 'react-icons/hi';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', year: 1, language: 'English' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, year: parseInt(form.year), role: 'student', consentAnonymousData: true });
      toast.success('Account created! Welcome to MindMate 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8 gradient-bg">
      <div className="absolute top-20 right-10 w-72 h-72 bg-mint-500/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float-fast" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-mint-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/25">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-dark-500 dark:text-dark-400 mt-1">Start your mental health journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="reg-name">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input id="reg-name" name="name" value={form.name} onChange={handleChange} className="input-field !pl-10" placeholder="Your name" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="reg-email">College Email</label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} className="input-field !pl-10" placeholder="you@college.edu" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="reg-password">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input id="reg-password" name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange} className="input-field !pl-10 !pr-10" placeholder="Min 6 characters" required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                  {showPw ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="reg-college">College</label>
                <div className="relative">
                  <HiAcademicCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input id="reg-college" name="college" value={form.college} onChange={handleChange} className="input-field !pl-10" placeholder="College name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="reg-year">Year</label>
                <select id="reg-year" name="year" value={form.year} onChange={handleChange} className="input-field">
                  {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="reg-lang">Preferred Language</label>
              <select id="reg-lang" name="language" value={form.language} onChange={handleChange} className="input-field">
                {['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="flex items-start gap-2 p-3 bg-mint-50 dark:bg-mint-900/20 rounded-xl">
              <input type="checkbox" id="consent" className="mt-1 accent-primary-500" required />
              <label htmlFor="consent" className="text-xs text-dark-600 dark:text-dark-400">
                I consent to anonymous data collection to improve mental health services. My identity remains private.
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3 disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-dark-500 dark:text-dark-400">
            Already have an account? <Link to="/login" className="text-primary-500 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
