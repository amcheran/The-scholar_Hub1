import React from 'react';
import { Compass, CheckSquare, User, GraduationCap, Bookmark, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

export type NavTab = 'explore' | 'tracker' | 'profile';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  savedCount: number;
  profile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  savedCount,
  profile,
}) => {
  return (
    <>
      {/* Desktop Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => onTabChange('explore')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:bg-slate-800 transition-colors">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">ScholarHub</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Aggregator
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
              onClick={() => onTabChange('explore')}
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
              onClick={() => onTabChange('tracker')}
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
              onClick={() => onTabChange('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'profile'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              Profile
            </button>
          </nav>

          {/* Right Action: PWA Install, Saved Items counter button & Mini Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton variant="nav" />

            <button
              onClick={() => onTabChange('tracker')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
              title="View Tracker & Saved Applications"
            >
              <Bookmark className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Saved</span>
              <span className="font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-xs">
                {savedCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('profile')}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              title="Manage matching attributes & GPA"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-emerald-400 font-bold text-xs flex items-center justify-center">
                {profile.fullName.substring(0, 1)}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[100px]">
                  {profile.fullName}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                  GPA: {profile.gpa.toFixed(2)}
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Visible only on small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 pb-safe">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Tab 1: Explore */}
          <button
            onClick={() => onTabChange('explore')}
            className={`flex flex-col items-center justify-center min-w-[64px] py-1 transition-colors ${
              currentTab === 'explore' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                currentTab === 'explore' ? 'bg-slate-900 text-emerald-400 shadow-sm' : ''
              }`}
            >
              <Compass className="w-5 h-5" />
            </div>
            <span
              className={`text-[11px] font-semibold mt-0.5 ${
                currentTab === 'explore' ? 'text-slate-900 font-bold' : ''
              }`}
            >
              Explore
            </span>
          </button>

          {/* Tab 2: Tracker */}
          <button
            onClick={() => onTabChange('tracker')}
            className={`flex flex-col items-center justify-center min-w-[64px] py-1 transition-colors relative ${
              currentTab === 'tracker' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  currentTab === 'tracker' ? 'bg-slate-900 text-emerald-400 shadow-sm' : ''
                }`}
              >
                <CheckSquare className="w-5 h-5" />
              </div>
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {savedCount}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] font-semibold mt-0.5 ${
                currentTab === 'tracker' ? 'text-slate-900 font-bold' : ''
              }`}
            >
              Tracker
            </span>
          </button>

          {/* Tab 3: Profile */}
          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center justify-center min-w-[64px] py-1 transition-colors ${
              currentTab === 'profile' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                currentTab === 'profile' ? 'bg-slate-900 text-emerald-400 shadow-sm' : ''
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <span
              className={`text-[11px] font-semibold mt-0.5 ${
                currentTab === 'profile' ? 'text-slate-900 font-bold' : ''
              }`}
            >
              Profile
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
