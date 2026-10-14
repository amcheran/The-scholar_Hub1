import React, { useState, useMemo } from 'react';
import { Opportunity, UserProfile, SavedApplication } from '../types';
import { OpportunityCard } from './OpportunityCard';
import { calculateMatchScore, formatDeadlineCountdown } from '../utils/matchingEngine';
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  TrendingUp,
  DollarSign,
  GraduationCap,
  ArrowUpDown,
} from 'lucide-react';

interface ExploreViewProps {
  opportunities: Opportunity[];
  profile: UserProfile;
  savedApplications: SavedApplication[];
  onToggleSave: (opportunityId: string) => void;
  onApplyClick: (opportunity: Opportunity) => void;
  onMatchClick: (opportunity: Opportunity) => void;
  onGoToProfile: () => void;
}

type FilterPill = 'all' | 'due_soon' | 'no_essay' | 'high_award' | 'undergraduate' | 'graduate';
type SortOption = 'match' | 'amount_desc' | 'deadline_soon' | 'gpa_asc';

export const ExploreView: React.FC<ExploreViewProps> = ({
  opportunities,
  profile,
  savedApplications,
  onToggleSave,
  onApplyClick,
  onMatchClick,
  onGoToProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePill, setActivePill] = useState<FilterPill>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('match');

  // Compute set of saved opportunity IDs for instant lookup
  const savedOppIds = useMemo(() => {
    return new Set(savedApplications.map((app) => app.opportunityId));
  }, [savedApplications]);

  // Total available funding
  const totalFunding = useMemo(() => {
    return opportunities.reduce((acc, curr) => acc + curr.amount, 0);
  }, [opportunities]);

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
          return scoreB - scoreA;
        }
        if (sortBy === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'deadline_soon') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'gpa_asc') {
          return a.gpaRequirement - b.gpaRequirement;
        }
        return 0;
      });
  }, [opportunities, searchQuery, activePill, selectedType, sortBy, profile]);

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Welcome Greeting Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-20 -mb-10 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Matching Engine Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Welcome back, {profile.fullName.split(' ')[0]}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed max-w-2xl">
            We’ve personalized <strong className="text-white font-semibold">{opportunities.length} opportunities</strong> matching your{' '}
            <strong className="text-emerald-300 font-semibold">{profile.major}</strong> degree and{' '}
            <strong className="text-emerald-300 font-semibold">{profile.gpa.toFixed(2)} GPA</strong>.
          </p>

          {/* Quick Metrics Strip */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Total Program Funding:</span>
              <span className="font-extrabold text-emerald-400 text-base">
                ${(totalFunding).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Your Top Match:</span>
              <span className="font-extrabold text-emerald-400 text-base">
                {Math.max(...opportunities.map((o) => calculateMatchScore(profile, o).score))}%
              </span>
            </div>
            <button
              onClick={onGoToProfile}
              className="text-xs text-slate-300 hover:text-white underline underline-offset-4 font-medium transition-colors"
            >
              Update Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Search & Instant Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships, grants, loans by name, field, or provider..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
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
              { id: 'grant', label: 'Grants' },
              { id: 'student loan', label: 'Student Loans' },
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
              <option value="match">Highest Match %</option>
              <option value="amount_desc">Largest Award</option>
              <option value="deadline_soon">Deadline (Soonest)</option>
              <option value="gpa_asc">Lowest GPA Requirement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{filteredOpportunities.length}</span>{' '}
          {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
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

      {/* Opportunities Card Grid */}
      {filteredOpportunities.length > 0 ? (
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
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No matches found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
            We couldn't find any opportunities matching your current filters. Try relaxing your search criteria or updating your profile.
          </p>
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
        </div>
      )}
    </div>
  );
};
