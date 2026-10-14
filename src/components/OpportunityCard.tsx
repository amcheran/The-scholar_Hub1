import React from 'react';
import { Opportunity, UserProfile } from '../types';
import { calculateMatchScore, formatDeadlineCountdown } from '../utils/matchingEngine';
import { Bookmark, Clock, Sparkles, ChevronRight } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  profile: UserProfile;
  isSaved: boolean;
  onToggleSave: (opportunityId: string) => void;
  onApplyClick: (opportunity: Opportunity) => void;
  onMatchClick: (opportunity: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  profile,
  isSaved,
  onToggleSave,
  onApplyClick,
  onMatchClick,
}) => {
  const matchData = calculateMatchScore(profile, opportunity);
  const deadlineInfo = formatDeadlineCountdown(opportunity.deadline);

  // Match badge styling
  let matchBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
  if (matchData.score < 80) {
    matchBadgeColor = 'bg-blue-50 text-blue-800 border-blue-200/80';
  }

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 w-full max-w-full overflow-hidden flex flex-col justify-between relative box-border">
      {/* Top row: Provider info, Match Score, Bookmark action */}
      <div className="w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 w-full">
          {/* Provider Logo, Name & Type in a flex item with min-w-0 flex-1 truncate */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs flex-shrink-0 ${opportunity.providerLogoBg} ${opportunity.providerLogoColor}`}
            >
              {opportunity.providerInitials}
            </div>
            <div className="min-w-0 flex-1 truncate">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
                {opportunity.providerName}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                {opportunity.type}
              </span>
            </div>
          </div>

          {/* Grouped inline container with flex-shrink-0 for Match Badge & Bookmark Button */}
          <div className="inline-flex items-center gap-1.5 flex-shrink-0">
            {/* Dynamic Match Score Badge */}
            <button
              onClick={() => onMatchClick(opportunity)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors hover:brightness-95 flex-shrink-0 ${matchBadgeColor}`}
              title="Click to view match score calculation breakdown"
            >
              <Sparkles className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span className="whitespace-nowrap">{matchData.score}% Match</span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={() => onToggleSave(opportunity.id)}
              className={`p-2 rounded-xl border transition-all flex-shrink-0 ${
                isSaved
                  ? 'bg-slate-900 text-emerald-400 border-slate-900 shadow-xs'
                  : 'bg-white text-slate-400 hover:text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
              title={isSaved ? 'Saved in Tracker' : 'Save to Tracker'}
            >
              <Bookmark className={`w-4 h-4 flex-shrink-0 ${isSaved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title: line-clamp-2 and break-words */}
        <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug tracking-tight mb-2 line-clamp-2 break-words group-hover:text-slate-950 transition-colors">
          {opportunity.title}
        </h3>

        {/* Metadata items in flex wrapper with flex-wrap gap-2 text-xs text-slate-500 */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3 font-medium">
          <span className="whitespace-nowrap">Min GPA {opportunity.gpaRequirement.toFixed(1)}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="break-words">{opportunity.majorTag}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="break-words">{opportunity.educationLevels.join('/')}</span>
          {opportunity.noEssay && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-emerald-700 font-semibold whitespace-nowrap">No Essay</span>
            </>
          )}
        </div>

        {/* Short description excerpt */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 break-words mb-4">
          {opportunity.description}
        </p>
      </div>

      {/* Bottom row: Award Amount, Deadline countdown & Apply button */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mt-auto w-full min-w-0">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">
            {opportunity.type === 'Student Loan' ? 'Borrowing Limit' : 'Award Amount'}
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-600 tracking-tight truncate">
            {opportunity.amountFormatted}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
            <Clock className={`w-3 h-3 flex-shrink-0 ${deadlineInfo.isUrgent ? 'text-amber-500' : 'text-slate-400'}`} />
            <span
              className={`font-semibold truncate ${
                deadlineInfo.isUrgent ? 'text-amber-600' : 'text-slate-500'
              }`}
            >
              {deadlineInfo.label}
            </span>
          </div>
        </div>

        <button
          onClick={() => onApplyClick(opportunity)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all group/btn flex-shrink-0"
        >
          <span>Apply Now</span>
          <ChevronRight className="w-4 h-4 text-emerald-400 group-hover/btn:translate-x-0.5 transition-transform flex-shrink-0" />
        </button>
      </div>
    </div>
  );
};
