import React, { useState, useMemo } from 'react';
import { Opportunity, UserProfile, SavedApplication } from '../types';
import { OpportunityCard } from './OpportunityCard';
import { calculateMatchScore, formatDeadlineCountdown, hasUserPreferences } from '../utils/matchingEngine';
import {
  Search,
  X,
  Sparkles,
  ArrowUpDown,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Loader2,
  ArrowRight,
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
}) => {
  const hasPrefs = hasUserPreferences(profile);

  const [searchQuery, setSearchQuery] = useState('');
  const [activePill, setActivePill] = useState<FilterPill>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  // Default sorting to "Deadline (Soonest)" or "Newest" when no user profile is set
  const [sortBy, setSortBy] = useState<SortOption>(() => (hasUserPreferences(profile) ? 'match' : 'deadline_soon'));

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

  // Highest match score for the user's active preferences (only evaluated when user has set preferences)
  const topMatchScore = useMemo(() => {
    if (!hasPrefs || !opportunities || opportunities.length === 0) return 0;
    const scores = opportunities
      .map((o) => calculateMatchScore(profile, o).score)
      .filter((s) => !isNaN(s));
    return scores.length > 0 ? Math.max(...scores) : 0;
  }, [hasPrefs, opportunities, profile]);

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
          if (!hasPrefs) {
            // When no profile is set, fall back to deadline
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          }
          const scoreA = calculateMatchScore(profile, a).score;
          const scoreB = calculateMatchScore(profile, b).score;
          return scoreB - scoreA;
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
    <div className="space-y-6 w-full max-w-full">
      {/* Welcome Greeting Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-20 -mb-10 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasPrefs ? 'AI Matching Engine Active' : 'Explore Mode'}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Funding</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Welcome back, {userGreetingName}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed max-w-2xl">
            {isLoading ? (
              <span>Discovering verified scholarship and funding opportunities...</span>
            ) : hasPrefs ? (
              <>
                Explore <strong className="text-white font-semibold">{opportunities.length} verified {opportunities.length === 1 ? 'opportunity' : 'opportunities'}</strong> tailored for your{' '}
                <strong className="text-emerald-300 font-semibold">{profile.major}</strong> degree.
              </>
            ) : (
              <>
                Explore <strong className="text-white font-semibold">{opportunities.length} verified scholarship and loan {opportunities.length === 1 ? 'opportunity' : 'opportunities'}</strong> across{' '}
                <strong className="text-emerald-300 font-semibold">all fields of study</strong>. Set your profile preferences to see tailored match scores.
              </>
            )}
          </p>

          {/* Quick Metrics Strip */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Total Program Funding:</span>
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
              <span className="text-slate-400">Your Top Match:</span>
              <span className="font-extrabold text-emerald-400 text-base">
                {isLoading ? '...' : hasPrefs && topMatchScore > 0 ? `${topMatchScore}%` : '--'}
              </span>
            </div>
            <button
              onClick={onGoToProfile}
              className="text-xs text-slate-300 hover:text-white underline underline-offset-4 font-medium transition-colors"
            >
              {hasPrefs ? 'Update Preferences' : 'Set Profile & Preferences'}
            </button>
          </div>
        </div>
      </div>

      {/* Progressive Profiling Quick Action Callout when user has not yet set preferences */}
      {!hasPrefs && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Unlock Accurate AI Scholarship Matches
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

      {/* Search & Instant Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
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
              <option value="deadline_soon">Deadline (Soonest)</option>
              <option value="newest">Newest Added</option>
              {hasPrefs ? (
                <option value="match">Highest Match %</option>
              ) : (
                <option value="match" disabled>
                  Highest Match % (Set profile first)
                </option>
              )}
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
  );
};
