import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckSquare,
  User,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bookmark,
  HelpCircle,
  Info,
} from 'lucide-react';
import { UserProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

export type NavTab = 'explore' | 'tracker' | 'profile' | 'about';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  savedCount: number;
  profile: UserProfile;
  onSignOut?: () => void;
  isAuthenticated?: boolean;
  onSignIn?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  savedCount,
  profile,
  onSignOut,
  isAuthenticated = true,
  onSignIn,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu automatically on tab selection
  const handleNavSelect = (tab: NavTab) => {
    setIsMenuOpen(false);
    onTabChange(tab);
  };

  // Close menu and trigger sign out
  const handleLogout = () => {
    setIsMenuOpen(false);
    if (onSignOut) {
      onSignOut();
    }
  };

  // Handle Escape key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const userInitial = profile?.fullName?.trim() ? profile.fullName.trim()[0].toUpperCase() : 'S';

  return (
    <>
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNavSelect('explore')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:bg-slate-800 transition-colors">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  ScholarHub
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Scholarships, Grants & Student Loans
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => handleNavSelect('explore')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'explore'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Explore
            </button>

            <button
              onClick={() => handleNavSelect('tracker')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                currentTab === 'tracker'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              Tracker
              {savedCount > 0 && (
                <span className="ml-1 text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavSelect('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'profile'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              Profile
            </button>

            <button
              onClick={() => handleNavSelect('about')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'about'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Info className="w-4 h-4 text-emerald-600" />
              About Us
            </button>
          </nav>

          {/* Right Action Controls: Profile Pill, Install, and Hamburger Drawer Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <PWAInstallButton variant="nav" />

            {/* Profile or Sign-In button */}
            {!isAuthenticated ? (
              <button
                onClick={onSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sign In</span>
              </button>
            ) : (
              <>
                {/* Dark Pill: Avatar & Profile Indicator */}
                <button
                  onClick={() => handleNavSelect('profile')}
                  className="flex items-center gap-2 pl-1.5 pr-2 sm:pr-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white shadow-sm transition-all group"
                  title="View & Edit Profile"
                >
                  <div className="relative">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                      {userInitial}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-slate-100 leading-none truncate max-w-[85px] group-hover:text-emerald-300 transition-colors">
                      {profile?.fullName?.trim() || 'Scholar'}
                    </div>
                    <div className="text-[9px] text-emerald-400/90 font-medium tracking-wide mt-0.5">
                      {profile?.isConfigured && typeof profile?.gpa === 'number' && profile.gpa > 0
                        ? `GPA ${profile.gpa.toFixed(2)}`
                        : 'Profile'}
                    </div>
                  </div>
                </button>

                {/* Desktop Logout Button */}
                {onSignOut && (
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow-sm transition-all text-[11px] font-bold tracking-wider uppercase active:scale-95 group"
                    title="Sign out of ScholarHub"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition-colors" />
                    <span className="text-[11px] font-bold tracking-wider">Logout</span>
                  </button>
                )}
              </>
            )}

            {/* Hamburger Side Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition-colors flex items-center justify-center shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Out Side Menu (Drawer Navigation) */}
      {/* 1. Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* 2. Slide-out Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-84 max-w-[85vw] bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="ScholarHub Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-extrabold text-base text-slate-900 tracking-tight leading-none">
                ScholarHub
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                Menu & Navigation
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User Profile Summary Card */}
          <div
            onClick={() => handleNavSelect('profile')}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <div className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                    {profile?.fullName?.trim() || 'Scholar User'}
                  </div>
                  <div className="text-xs text-slate-500 font-medium truncate">
                    {profile?.isConfigured && typeof profile?.gpa === 'number' && profile.gpa > 0
                      ? `GPA ${profile.gpa.toFixed(2)} · ${profile.major || 'Undergraduate'}`
                      : 'Configure Profile & Matches'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </div>
          </div>

          {/* Navigation Links List */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
              Main Views
            </div>

            {/* 1. Explore */}
            <button
              type="button"
              onClick={() => handleNavSelect('explore')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left group ${
                currentTab === 'explore'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    currentTab === 'explore'
                      ? 'bg-white/10 text-emerald-400'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                  }`}
                >
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold leading-snug">Explore Opportunities</div>
                  <div
                    className={`text-xs ${
                      currentTab === 'explore' ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    Verified scholarships & loans
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                  currentTab === 'explore' ? 'text-slate-400' : 'text-slate-300'
                }`}
              />
            </button>

            {/* 2. Tracker & Saved Applications */}
            <button
              type="button"
              onClick={() => handleNavSelect('tracker')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left group ${
                currentTab === 'tracker'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    currentTab === 'tracker'
                      ? 'bg-white/10 text-emerald-400'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                  }`}
                >
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold leading-snug flex items-center gap-2">
                    <span>Application Tracker</span>
                    {savedCount > 0 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                        {savedCount}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-xs ${
                      currentTab === 'tracker' ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    Saved applications & progress
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                  currentTab === 'tracker' ? 'text-slate-400' : 'text-slate-300'
                }`}
              />
            </button>

            {/* 3. Profile & Preferences */}
            <button
              type="button"
              onClick={() => handleNavSelect('profile')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left group ${
                currentTab === 'profile'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    currentTab === 'profile'
                      ? 'bg-white/10 text-emerald-400'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold leading-snug">My Profile & Matches</div>
                  <div
                    className={`text-xs ${
                      currentTab === 'profile' ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    GPA, Major & academic settings
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                  currentTab === 'profile' ? 'text-slate-400' : 'text-slate-300'
                }`}
              />
            </button>

            {/* 4. About Us */}
            <button
              type="button"
              onClick={() => handleNavSelect('about')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left group ${
                currentTab === 'about'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    currentTab === 'about'
                      ? 'bg-white/10 text-emerald-400'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                  }`}
                >
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold leading-snug">About ScholarHub</div>
                  <div
                    className={`text-xs ${
                      currentTab === 'about' ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    Vision, 3-step process & partnerships
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                  currentTab === 'about' ? 'text-slate-400' : 'text-slate-300'
                }`}
              />
            </button>
          </div>

          {/* Quick PWA Info / Features Pill */}
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 text-emerald-900">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold">Academic Recommendations Active</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              ScholarHub scores verified international & local African university opportunities against your profile.
            </p>
          </div>

          {/* Help & Information / Quick Footer Link */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setTimeout(() => {
                  document.getElementById('scholarhub-footer')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white text-emerald-600 shadow-2xs group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Help, FAQs & Legal</div>
                  <div className="text-[10px] text-slate-400 font-medium">Terms, Privacy & Contact Support</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          {onSignOut && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all shadow-2xs group"
            >
              <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-700 transition-colors" />
              <span>Log Out of ScholarHub</span>
            </button>
          )}

          <div className="text-center text-[10px] text-slate-400 pt-1">
            ScholarHub Progressive Web App · v2.1
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => handleNavSelect('explore')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'explore'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <Compass className={`w-5 h-5 ${currentTab === 'explore' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Explore</span>
        </button>

        <button
          onClick={() => handleNavSelect('tracker')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
            currentTab === 'tracker'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <CheckSquare className={`w-5 h-5 ${currentTab === 'tracker' ? 'text-emerald-600' : 'text-slate-400'}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-600 text-white leading-none">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Tracker</span>
        </button>

        <button
          onClick={() => handleNavSelect('profile')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'profile'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>

        <button
          onClick={() => handleNavSelect('about')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'about'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          <Info className={`w-5 h-5 ${currentTab === 'about' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">About Us</span>
        </button>
      </nav>
    </>
  );
};
