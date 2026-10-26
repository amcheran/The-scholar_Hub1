import React, { useState, useMemo, useEffect } from 'react';
import { Opportunity, UserProfile, SavedApplication } from '../types';
import { OpportunityCard } from './OpportunityCard';
import { calculateMatchScore, formatDeadlineCountdown, hasUserPreferences } from '../utils/matchingEngine';
import campusBg from '../assets/images/african_university_campus_1792084597873.jpg';
import {
  Search,
  X,
  ArrowUpDown,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Loader2,
  ArrowRight,
  GraduationCap,
  Award,
  Megaphone,
  Star,
  Building2,
  CheckCircle2,
  Send,
  Info,
} from 'lucide-react';

interface ExploreViewProps {
  opportunities: Opportunity[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  profile: UserProfile;
  savedApplications: SavedApplication[];
  onToggleSave: (opportunityId: string) => void;
  onApplyClick: (opportunity: Opportunity) => void;
  onMatchClick: (opportunity: Opportunity) => void;
  onGoToProfile: () => void;
  onGoToAbout?: () => void;
}

type FilterPill = 'all' | 'due_soon' | 'no_essay' | 'high_award' | 'undergraduate' | 'graduate';
type SortOption = 'match' | 'amount_desc' | 'deadline_soon' | 'newest' | 'gpa_asc';

export const ExploreView: React.FC<ExploreViewProps> = ({
  opportunities,
  isLoading = false,
  error = null,
  onRetry,
  profile,
  savedApplications,
  onToggleSave,
  onApplyClick,
  onMatchClick,
  onGoToProfile,
  onGoToAbout,
}) => {
  const hasPrefs = hasUserPreferences(profile);

  // Carousel & Sponsor Modal state
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showPartnerModal, setShowPartnerModal] = useState<boolean>(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState<boolean>(false);
  const [partnerOrg, setPartnerOrg] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [partnerEmail, setPartnerEmail] = useState<string>('');
  const [partnerAwardType, setPartnerAwardType] = useState<string>('Scholarship');
  const [partnerDetails, setPartnerDetails] = useState<string>('');

  // Auto-play timer for carousel with pause-on-hover (6 seconds per slide)
  useEffect(() => {
    if (isPaused || showPartnerModal) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, showPartnerModal]);

  // Touch swipe support for smooth mobile gestures between slides
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX !== null && touchEndX !== null) {
      const distance = touchStartX - touchEndX;
      const minSwipeDistance = 45;
      if (distance > minSwipeDistance) {
        // Swiped left -> advance to next slide
        setCurrentSlide((prev) => (prev + 1) % 3);
      } else if (distance < -minSwipeDistance) {
        // Swiped right -> go to previous slide
        setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1));
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activePill, setActivePill] = useState<FilterPill>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  // Default sorting to "Best Match" so opportunities are automatically sorted from best match to lowest match
  const [sortBy, setSortBy] = useState<SortOption>('match');

  // Compute set of saved opportunity IDs for instant lookup
  const savedOppIds = useMemo(() => {
    return new Set(savedApplications.map((app) => app.opportunityId));
  }, [savedApplications]);

  // Total available funding calculated dynamically from live Supabase opportunities
  const totalFunding = useMemo(() => {
    if (!opportunities || opportunities.length === 0) return 0;
    return opportunities.reduce((acc, curr) => {
      const val = Number(curr.amount);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }, [opportunities]);

  // Dynamic user greeting: gracefully treats unconfigured user as Guest
  const userGreetingName = useMemo(() => {
    const rawName = profile?.fullName?.trim();
    if (!rawName) return 'Guest';
    const firstName = rawName.split(/\s+/)[0];
    return firstName || 'Guest';
  }, [profile?.fullName]);

  // Dynamic search placeholder safely guarded against any 'nan' concatenation bug
  const searchPlaceholder = useMemo(() => {
    if (selectedType && selectedType !== 'all') {
      const cleanType = String(selectedType).trim();
      const lowerType = cleanType.toLowerCase();
      if (cleanType && lowerType !== 'nan' && lowerType !== 'undefined' && lowerType !== 'null') {
        return `Search ${cleanType}s by name, field, or provider...`;
      }
    }

    if (activePill && activePill !== 'all') {
      const pillMap: Record<string, string> = {
        due_soon: 'urgent opportunities',
        no_essay: 'no-essay awards',
        high_award: '$5k+ opportunities',
        undergraduate: 'undergraduate awards',
        graduate: 'graduate awards',
      };
      const category = pillMap[activePill];
      if (category && !category.toLowerCase().includes('nan')) {
        return `Search ${category} by name, field, or provider...`;
      }
    }

    return 'Search scholarships, grants, loans by name, field, or provider...';
  }, [selectedType, activePill]);

  // Filter & sort logic
  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = opp.title.toLowerCase().includes(q);
          const matchProvider = opp.providerName.toLowerCase().includes(q);
          const matchMajor = opp.majorTag.toLowerCase().includes(q);
          const matchDesc = opp.description.toLowerCase().includes(q);
          if (!matchTitle && !matchProvider && !matchMajor && !matchDesc) {
            return false;
          }
        }

        // Type filter
        if (selectedType !== 'all') {
          if (opp.type.toLowerCase() !== selectedType.toLowerCase()) {
            return false;
          }
        }

        // Instant Filter Pills
        if (activePill === 'due_soon') {
          const { daysLeft } = formatDeadlineCountdown(opp.deadline);
          if (daysLeft > 25 || daysLeft < 0) return false;
        } else if (activePill === 'no_essay') {
          if (!opp.noEssay) return false;
        } else if (activePill === 'high_award') {
          if (opp.amount < 5000) return false;
        } else if (activePill === 'undergraduate') {
          if (!opp.educationLevels.includes('Undergraduate')) return false;
        } else if (activePill === 'graduate') {
          if (!opp.educationLevels.includes('Graduate')) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          const scoreA = calculateMatchScore(profile, a).score;
          const scoreB = calculateMatchScore(profile, b).score;
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
          // Secondary tie-breaker: soonest upcoming deadline
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'deadline_soon') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'newest') {
          return b.id.localeCompare(a.id);
        }
        if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'gpa_asc') {
          return a.gpaRequirement - b.gpaRequirement;
        }
        return 0;
      });
  }, [opportunities, searchQuery, activePill, selectedType, sortBy, profile, hasPrefs]);

  return (
    <div className="w-full max-w-full">
      {/* Hero Carousel Banner (Full horizontal bleed edge-to-edge directly beneath the header with sharp rectangular edges) */}
      <div
        className="w-full mb-6 rounded-none border-b border-slate-800/80 shadow-md bg-slate-950 text-white min-h-[340px] sm:min-h-[300px] flex flex-col justify-between overflow-hidden relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide 0: Personalized Student Opportunities (Image-backed with African University Campus) */}
        {currentSlide === 0 && (
          <div className="relative p-6 sm:p-8 flex-1 flex flex-col justify-between z-10 animate-in fade-in duration-300">
            {/* Campus Background Image with dark cinematic overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
              <img
                src={campusBg}
                alt="African University Campus"
                className="w-full h-full object-cover object-center scale-105 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = 'true';
                    target.src = '/assets/images/african_university_campus_1792084597873.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-slate-950/75 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
            </div>

            <div className="max-w-2xl relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/85 border border-emerald-700/70 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{hasPrefs ? 'Academic Recommendations Active' : 'Student Opportunity Discovery'}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 border border-slate-700/80 text-emerald-400 text-xs font-semibold backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Funding</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Welcome back, {userGreetingName}
              </h1>

              <p className="text-slate-200 text-sm sm:text-base mt-2 leading-relaxed max-w-xl">
                {isLoading ? (
                  <span>Discovering verified scholarship and funding opportunities...</span>
                ) : hasPrefs ? (
                  <>
                    Explore <strong className="text-white font-semibold">{opportunities.length} verified {opportunities.length === 1 ? 'opportunity' : 'opportunities'}</strong> tailored for your{' '}
                    <strong className="text-emerald-300 font-semibold">{profile.major}</strong> degree path.
                  </>
                ) : (
                  <>
                    Explore <strong className="text-white font-semibold">{opportunities.length} verified scholarship and loan {opportunities.length === 1 ? 'opportunity' : 'opportunities'}</strong> across{' '}
                    <strong className="text-emerald-300 font-semibold">all fields of study</strong>. Set your profile preferences to view tailored recommendations.
                  </>
                )}
              </p>
            </div>

            {/* Quick Metrics Strip (pr-24/pr-28 ensures text and actions never overlap with floating dots) */}
            <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm relative z-10 pr-24 sm:pr-28">
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Total Program Funding:</span>
                <span className="font-extrabold text-emerald-400 text-base">
                  {isLoading ? (
                    <span className="text-slate-400 font-normal">Loading...</span>
                  ) : totalFunding > 0 ? (
                    `$${totalFunding.toLocaleString()}`
                  ) : (
                    'Tuition & Living'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Feed Order:</span>
                <span className="font-extrabold text-emerald-400 text-base">
                  Best Match
                </span>
              </div>
              <button
                onClick={onGoToProfile}
                className="text-xs text-emerald-300 hover:text-white underline underline-offset-4 font-semibold transition-colors"
              >
                {hasPrefs ? 'Update Preferences' : 'Set Profile & Preferences'}
              </button>

              {onGoToAbout && (
                <button
                  onClick={onGoToAbout}
                  className="text-xs text-slate-300 hover:text-white underline underline-offset-4 font-semibold transition-colors flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>How Matching Works (About Us)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Slide 1: Featured & Sponsored Scholarship Spotlight */}
        {currentSlide === 1 && (
          <div className="relative p-6 sm:p-8 flex-1 flex flex-col justify-between z-10 animate-in fade-in duration-300 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950">
            {/* Ambient decorative lighting */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/3 -mb-10 w-60 h-60 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

            <div className="max-w-2xl relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-xs">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Featured Program Spotlight</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sponsored Full-Ride Grants</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Pan-African & Global STEM Fellowships 2025/2026
              </h2>

              <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed max-w-xl">
                High-value undergraduate and postgraduate awards offering full tuition coverage, living allowances up to $30,000, and academic mentorship for African scholars.
              </p>
            </div>

            {/* Quick Action & Criteria Pills (pr-24/pr-28 ensures text and actions never overlap with floating dots) */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 relative z-10 pr-24 sm:pr-28">
              <button
                onClick={() => {
                  setActivePill('high_award');
                  const el = document.getElementById('catalog-search-bar');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>View $5,000+ High-Award Programs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                  Open to All African Nationalities
                </span>
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                  Zero Application Fee
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Slide 2: Partner With ScholarHub / Sponsor or Advertise a Program */}
        {currentSlide === 2 && (
          <div className="relative p-6 sm:p-8 flex-1 flex flex-col justify-between z-10 animate-in fade-in duration-300 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950">
            {/* Ambient decorative lighting */}
            <div className="absolute top-0 right-10 -mt-10 w-64 h-64 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 -mb-10 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

            <div className="max-w-2xl relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold backdrop-blur-xs">
                  <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sponsor & Partner Opportunities</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-teal-300 text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Universities & Foundations</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Advertise or Sponsor a Scholarship Program
              </h2>

              <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed max-w-xl">
                Are you an educational institution, endowment trust, or foundation? Feature your funding programs directly to thousands of qualified, ambitious African students.
              </p>
            </div>

            {/* Quick Action Strip (pr-24/pr-28 ensures text and actions never overlap with floating dots) */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 relative z-10 pr-24 sm:pr-28">
              <button
                onClick={() => setShowPartnerModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Feature Your Program / Partner With Us</span>
              </button>

              {onGoToAbout && (
                <button
                  onClick={onGoToAbout}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>About Us & Scope</span>
                </button>
              )}

              <a
                href="mailto:partnerships@scholarhub.org?subject=Scholarship%20Sponsorship%20Inquiry"
                className="text-xs text-slate-300 hover:text-white underline underline-offset-4 font-medium transition-colors"
              >
                Contact: partnerships@scholarhub.org
              </a>
            </div>
          </div>
        )}

        {/* Carousel Controls: 3 Simple Standalone Floating Pagination Dots (No Outer Capsule) */}
        <div className="absolute bottom-4 right-5 sm:bottom-5 sm:right-8 z-30 flex items-center gap-2 pointer-events-auto">
          {[0, 1, 2].map((idx) => {
            const isActive = currentSlide === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 focus:outline-none ${
                  isActive
                    ? 'w-6 h-2 bg-emerald-400 rounded-full'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80 rounded-full'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                title={
                  idx === 0
                    ? 'Tailored Opportunities'
                    : idx === 1
                    ? 'Featured & Sponsored Programs'
                    : 'Sponsor & Partner Opportunities'
                }
              />
            );
          })}
        </div>
      </div>

      {/* Main Explore Content Stream (Padded with clean breathing room below banner) */}
      <div className="px-4 sm:px-6 space-y-6">
        {/* Progressive Profiling Quick Action Callout when user has not yet set preferences */}
      {!hasPrefs && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Unlock Personalized Scholarship Matches
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                You are currently in guest exploration mode. Set your GPA, degree level, and destination country to unlock real-time match scores and tailored recommendations.
              </p>
            </div>
          </div>
          <button
            onClick={onGoToProfile}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 shadow-xs transition-all"
          >
            <span>Enhance Profile Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      )}

      {/* About ScholarHub Quick Banner */}
      <div className="mx-4 sm:mx-6 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
            <Info className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>About ScholarHub</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                100% Free & Transparent
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Read our vision, 3-step transparent matching process, and student & institutional collaboration desk.
            </div>
          </div>
        </div>
        {onGoToAbout && (
          <button
            onClick={onGoToAbout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer self-stretch sm:self-auto justify-center"
          >
            <span>Read About Us</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        )}
      </div>

      {/* Search & Instant Filter Bar */}
      <div id="catalog-search-bar" className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Instant Filter Pills Row */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Quick Filters
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'All Opportunities' },
              { id: 'due_soon', label: 'Due Soon (≤ 25 Days)' },
              { id: 'no_essay', label: 'No Essay Required' },
              { id: 'high_award', label: '$5k+ Award' },
              { id: 'undergraduate', label: 'Undergraduate' },
              { id: 'graduate', label: 'Graduate' },
            ].map((pill) => {
              const isActive = activePill === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setActivePill(pill.id as FilterPill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Filters: Type & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Opportunity Type segmented buttons */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Types' },
              { id: 'scholarship', label: 'Scholarships' },
              { id: 'student loan', label: 'Student Loans' },
              { id: 'grant', label: 'Grants' },
              { id: 'fellowship', label: 'Fellowships' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedType === t.id
                    ? 'text-slate-900 font-bold bg-slate-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="match">Best Match (Default)</option>
              <option value="deadline_soon">Deadline (Soonest)</option>
              <option value="newest">Newest Added</option>
              <option value="amount_desc">Largest Award</option>
              <option value="gpa_asc">Lowest GPA Requirement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-semibold text-slate-500">
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              Loading verified opportunities...
            </span>
          ) : (
            <>
              Showing <span className="text-slate-900 font-bold">{filteredOpportunities.length}</span>{' '}
              {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
            </>
          )}
        </div>
        {(searchQuery || activePill !== 'all' || selectedType !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActivePill('all');
              setSelectedType('all');
            }}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="font-bold text-red-900 text-sm">Unable to load opportunities</h3>
          <p className="text-xs text-red-700 mt-1 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full max-w-full">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  <div className="space-y-1.5">
                    <div className="w-24 h-3 bg-slate-200 rounded" />
                    <div className="w-16 h-2.5 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="w-20 h-6 bg-slate-200 rounded-lg" />
              </div>
              <div className="w-3/4 h-5 bg-slate-200 rounded" />
              <div className="w-full h-12 bg-slate-100 rounded-xl" />
              <div className="flex justify-between items-center pt-2">
                <div className="w-20 h-4 bg-slate-200 rounded" />
                <div className="w-24 h-8 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Opportunities Card Grid */}
      {!isLoading && !error && filteredOpportunities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full max-w-full">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              profile={profile}
              isSaved={savedOppIds.has(opp.id)}
              onToggleSave={onToggleSave}
              onApplyClick={onApplyClick}
              onMatchClick={onMatchClick}
            />
          ))}
        </div>
      )}

      {/* Visual Bridge to Footer at End of Feed */}
      {!isLoading && !error && filteredOpportunities.length > 0 && (
        <div className="pt-8 pb-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Viewing all {filteredOpportunities.length}{' '}
              {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'} matching your filters.
            </span>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById('scholarhub-footer')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs"
          >
            <span>Explore FAQs, Support & Legal Footer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredOpportunities.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No opportunities found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
            {searchQuery || activePill !== 'all' || selectedType !== 'all'
              ? 'No matching listings found for your current filter criteria.'
              : 'No scholarship or loan opportunities currently match your search.'}
          </p>
          {(searchQuery || activePill !== 'all' || selectedType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActivePill('all');
                setSelectedType('all');
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
      </div>

      {/* Sponsor / Partner Inquiry Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => {
                setShowPartnerModal(false);
                setPartnerSubmitted(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {partnerSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Sponsorship Inquiry Received!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you for supporting African scholars. Our institutional partnerships team will review your scholarship program details and reach out within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowPartnerModal(false);
                    setPartnerSubmitted(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Return to Explore
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPartnerSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold mb-2">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Scholarship Provider Portal</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Feature Your Scholarship on ScholarHub
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Connect your scholarship, fellowship, or student grant with thousands of qualified, high-achieving African scholars.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Organization / University / Foundation Name
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerOrg}
                      onChange={(e) => setPartnerOrg(e.target.value)}
                      placeholder="e.g. Beit Trust / University of Cape Town"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        required
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="e.g. Dr. Jane Mwangi"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Institutional Email
                      </label>
                      <input
                        type="email"
                        required
                        value={partnerEmail}
                        onChange={(e) => setPartnerEmail(e.target.value)}
                        placeholder="partnerships@institution.org"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Program Type
                    </label>
                    <select
                      value={partnerAwardType}
                      onChange={(e) => setPartnerAwardType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="Scholarship">Merit / Need-Based Scholarship</option>
                      <option value="Fellowship">Postgraduate / Research Fellowship</option>
                      <option value="Grant">Undergraduate / Community Grant</option>
                      <option value="Loan">Low-Interest Educational Loan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Brief Program Details or Website Link
                    </label>
                    <textarea
                      rows={2}
                      value={partnerDetails}
                      onChange={(e) => setPartnerDetails(e.target.value)}
                      placeholder="e.g. Annual full-ride award for 20 STEM undergraduate students from Sub-Saharan Africa..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPartnerModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-teal-400" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
