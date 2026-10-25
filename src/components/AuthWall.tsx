import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Compass,
  Globe2,
  ShieldCheck,
  TrendingUp,
  Image as ImageIcon,
  X,
  Maximize2,
} from 'lucide-react';
import { AuthService, AuthSessionState } from '../services/authService';
import campusBg from '../assets/images/african_university_campus_1792084597873.jpg';
import { Footer } from './Footer';

interface AuthWallProps {
  onAuthenticated: (state: AuthSessionState) => void;
}

export const AuthWall: React.FC<AuthWallProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { state, confirmationRequired } = await AuthService.signUp(
          email,
          password,
          fullName
        );
        if (confirmationRequired) {
          setInfoMessage(
            'Account created! Please check your email inbox if verification is requested. Signing you in now...'
          );
        }
        onAuthenticated(state);
      } else {
        const state = await AuthService.signIn(email, password);
        onAuthenticated(state);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestEntry = () => {
    setIsLoading(true);
    try {
      const guestState = AuthService.signInAsGuest();
      onAuthenticated(guestState);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-slate-950 font-sans">
      {/* Background Image: Sunlit Modern African University Campus */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <img
          src={campusBg}
          alt="African University Campus"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.triedPublic1) {
              target.dataset.triedPublic1 = 'true';
              target.src = '/assets/images/african_university_campus_1792084597873.jpg';
            } else if (!target.dataset.triedPublic2) {
              target.dataset.triedPublic2 = 'true';
              target.src = '/assets/images/african_university_campus.jpg';
            }
          }}
        />
        {/* Balanced Cinematic Gradient Overlays: keeps university campus & students vivid while ensuring text readability */}
        <div className="absolute inset-0 bg-slate-950/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 py-10 sm:py-16">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Platform Branding & Mission */}
        <div className="lg:col-span-7 text-white space-y-6 pt-4 lg:pt-0">
          {/* Logo & Tag */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  ScholarHub
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Africa to Global
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Higher Education Funding & Scholarship Aggregator
              </p>
            </div>
          </div>

          {/* Value Prop Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Unlock scholarships tailored for{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                African scholars.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Connect directly with thousands of verified university grants, research fellowships,
              and funding opportunities tailored to your degree and academic journey.
            </p>
          </div>

          {/* Quick Metrics & Feature Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-lg sm:text-xl font-black text-emerald-400">5,000+</div>
              <div className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                Verified Programs
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-lg sm:text-xl font-black text-teal-300">Active</div>
              <div className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                Deadline Tracking
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-lg sm:text-xl font-black text-cyan-300">Smart</div>
              <div className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                GPA & Major Matching
              </div>
            </div>
          </div>

          {/* Testimonial / Community Quote */}
          <div className="hidden sm:flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-md max-w-lg">
            <div className="w-10 h-10 rounded-full bg-emerald-700/60 border border-emerald-400/40 flex items-center justify-center font-bold text-emerald-200 text-sm shrink-0">
              AK
            </div>
            <div className="text-xs text-slate-300">
              <p className="italic text-slate-200">
                &ldquo;ScholarHub helped our study cohort apply to verified international fellowships with zero spam.&rdquo;
              </p>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                Amina K. &bull; Engineering Scholar, Nairobi
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/30 text-slate-900">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Error & Info Banners */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {infoMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{infoMessage}</div>
              </div>
            )}

            {/* Authentication Form (Minimal Fields) */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Your Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Kwame Mensah"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium text-slate-900 bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <span className="text-[11px] text-slate-400">Min 6 characters</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium text-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Get Started Free' : 'Sign In to ScholarHub'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                  Or instant access
                </span>
              </div>
            </div>

            {/* Quick Guest Entry / Demo Action */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGuestEntry}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition-colors"
              >
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Explore as Guest / Instant Preview</span>
              </button>
            </div>

            {/* Footer Trust Note */}
            <p className="text-[11px] text-center text-slate-400 mt-5 leading-normal">
              By continuing, you agree to ScholarHub&apos;s educational platform guidelines. Sessions are saved securely on your device.
            </p>
          </div>
        </div>
      </div>
    </div>

      {/* Student-Facing Footer */}
      <div className="relative z-10 w-full">
        <Footer />
      </div>

      {/* Floating button to view full background photograph */}
      <button
        type="button"
        onClick={() => setShowPhotoModal(true)}
        className="fixed bottom-4 left-4 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs backdrop-blur-md transition-all shadow-lg hover:shadow-emerald-950/20 group cursor-pointer"
        title="View full African campus photograph"
      >
        <ImageIcon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span className="font-medium">View Campus Photograph</span>
        <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-white" />
      </button>

      {/* Full Photo Lightbox Modal */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowPhotoModal(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] bg-slate-900 rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-white/10 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Modern African University Campus
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Collaborative scholars in golden sunlight at the modern university library
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Image display */}
            <div className="p-2 sm:p-4 overflow-auto flex items-center justify-center bg-black/60">
              <img
                src={campusBg}
                alt="Modern African University Campus in golden sunlight"
                className="w-full max-h-[72vh] object-contain rounded-xl shadow-lg border border-white/5"
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/african_university_campus_1792084597873.jpg';
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 bg-slate-950/90 border-t border-white/10 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-400">
                Asset path:{' '}
                <code className="text-emerald-400 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-white/5">
                  src/assets/images/african_university_campus_1792084597873.jpg
                </code>
              </span>
              <a
                href={campusBg}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
              >
                <span>Open Raw Image</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
