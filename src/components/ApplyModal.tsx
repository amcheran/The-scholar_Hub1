import React, { useState } from 'react';
import { Opportunity, UserProfile } from '../types';
import { formatDeadlineCountdown } from '../utils/matchingEngine';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Calendar,
  DollarSign,
  ShieldCheck,
  FileText,
  Clock,
  BookmarkPlus,
  Percent,
} from 'lucide-react';

interface ApplyModalProps {
  opportunity: Opportunity | null;
  profile: UserProfile;
  isAlreadyTracked: boolean;
  onClose: () => void;
  onTrackApplication: (oppId: string, status: 'In Progress') => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  opportunity,
  profile,
  isAlreadyTracked,
  onClose,
  onTrackApplication,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [redirecting, setRedirecting] = useState(false);

  if (!opportunity) return null;

  const deadlineInfo = formatDeadlineCountdown(opportunity.deadline);

  const toggleCheck = (idx: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleExternalApply = () => {
    setRedirecting(true);
    setTimeout(() => {
      window.open(opportunity.providerUrl, '_blank', 'noopener,noreferrer');
      setRedirecting(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0 ${opportunity.providerLogoBg} ${opportunity.providerLogoColor}`}
            >
              {opportunity.providerInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {opportunity.providerName}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Program
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg leading-snug mt-0.5">
                {opportunity.title}
              </h3>
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
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Key Facts Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-medium text-slate-500 block">Award Amount</span>
              <div className="text-base sm:text-lg font-extrabold text-emerald-600 mt-0.5">
                {opportunity.amountFormatted}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-medium text-slate-500 block">Deadline</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {deadlineInfo.formattedDate}
                </span>
              </div>
              <span className={`text-[10px] font-semibold ${deadlineInfo.isUrgent ? 'text-amber-600' : 'text-slate-500'}`}>
                {deadlineInfo.label}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-slate-500 block">Minimum GPA</span>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                {opportunity.gpaRequirement.toFixed(1)} Cumulative
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">
                Your GPA: {profile.gpa.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Loan special rate badge if applicable */}
          {opportunity.interestRate && (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">Interest Rate:</span>
                <span>{opportunity.interestRate}</span>
              </div>
              <span className="text-[11px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                No Cosigner Required
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Program Description
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
              {opportunity.description}
            </p>
          </div>

          {/* Eligibility Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Eligibility Self-Check
              </h4>
              <span className="text-[11px] text-slate-400">Tick to verify yourself</span>
            </div>
            <div className="space-y-2">
              {opportunity.eligibility.map((crit, idx) => {
                const isChecked = !!checkedItems[`elig_${idx}`];
                return (
                  <label
                    key={idx}
                    onClick={() => toggleCheck(`elig_${idx}`)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs leading-relaxed font-medium">{crit}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Application Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Required Application Materials
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {opportunity.requirements.map((req, idx) => (
                <li
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/50 text-xs text-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Redirects directly to verified provider application page.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isAlreadyTracked ? (
              <button
                onClick={() => {
                  onTrackApplication(opportunity.id, 'In Progress');
                  onClose();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <BookmarkPlus className="w-4 h-4 text-emerald-600" />
                Track as In-Progress
              </button>
            ) : (
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tracked in Hub
              </div>
            )}

            <button
              onClick={handleExternalApply}
              disabled={redirecting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {redirecting ? (
                <span>Redirecting...</span>
              ) : (
                <>
                  <span>Open Application</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
