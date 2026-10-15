import React from 'react';
import { Opportunity, UserProfile } from '../types';
import { calculateMatchScore, hasUserPreferences } from '../utils/matchingEngine';
import { X, CheckCircle2, AlertCircle, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

interface MatchBreakdownModalProps {
  opportunity: Opportunity | null;
  profile: UserProfile;
  onClose: () => void;
  onGoToProfile: () => void;
}

export const MatchBreakdownModal: React.FC<MatchBreakdownModalProps> = ({
  opportunity,
  profile,
  onClose,
  onGoToProfile,
}) => {
  if (!opportunity) return null;

  const hasPrefs = hasUserPreferences(profile);
  const matchData = hasPrefs ? calculateMatchScore(profile, opportunity) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 font-extrabold flex flex-col items-center justify-center shadow-inner">
              <span className="text-sm">{hasPrefs && matchData ? `${matchData.score}%` : '--'}</span>
              <span className="text-[10px] text-slate-300 font-normal">Score</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Match Breakdown</h3>
                {hasPrefs && matchData ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Grade {matchData.grade}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    Preferences Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[280px]">
                {opportunity.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {hasPrefs && matchData ? (
            <>
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed">
                  ScholarHub's matching engine scored this opportunity at{' '}
                  <strong className="font-semibold text-emerald-900">{matchData.score}% compatibility</strong> based on your academic credentials and financial profile.
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Scoring Factors
                </h4>
                {matchData.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          {item.category}
                          <span className="text-[10px] font-medium text-slate-400">
                            (+{item.points} pts)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Configure Profile to Unlock Matches</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                You are currently browsing as a Guest. Set your cumulative GPA and field of study in your profile to compute precise eligibility and match percentages for this opportunity.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onGoToProfile();
                }}
                className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Set Profile Preferences</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          )}

          {hasPrefs && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Need to update your profile?</span>
                <p className="text-[11px] text-slate-500">Edit GPA, field of study, or degree level.</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onGoToProfile();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1 shrink-0"
              >
                Edit Profile <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
