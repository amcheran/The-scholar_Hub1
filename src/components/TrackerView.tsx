import React, { useState, useMemo } from 'react';
import {
  Opportunity,
  SavedApplication,
  ApplicationStatus,
  UserProfile,
} from '../types';
import { formatDeadlineCountdown } from '../utils/matchingEngine';
import {
  Bookmark,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronDown,
  PlusCircle,
  FileEdit,
  DollarSign,
  AlertCircle,
  Compass,
  Check,
} from 'lucide-react';

interface TrackerViewProps {
  applications: SavedApplication[];
  opportunities: Opportunity[];
  profile: UserProfile;
  onUpdateStatus: (appId: string, status: ApplicationStatus) => void;
  onUpdateProgress: (appId: string, progress: number) => void;
  onToggleStep: (appId: string, stepId: string) => void;
  onUpdateNotes: (appId: string, notes: string) => void;
  onRemoveApplication: (appId: string) => void;
  onApplyClick: (opportunity: Opportunity) => void;
  onGoToExplore: () => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  applications,
  opportunities,
  profile,
  onUpdateStatus,
  onUpdateProgress,
  onToggleStep,
  onUpdateNotes,
  onRemoveApplication,
  onApplyClick,
  onGoToExplore,
}) => {
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('Saved');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  // Map of opportunities by ID
  const oppMap = useMemo(() => {
    const map = new Map<string, Opportunity>();
    opportunities.forEach((o) => map.set(o.id, o));
    return map;
  }, [opportunities]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      Saved: applications.filter((a) => a.status === 'Saved').length,
      'In Progress': applications.filter((a) => a.status === 'In Progress').length,
      Submitted: applications.filter((a) => a.status === 'Submitted').length,
    };
  }, [applications]);

  // Financial aid sum tracked
  const totalTrackedAmount = useMemo(() => {
    return applications.reduce((sum, app) => {
      const opp = oppMap.get(app.opportunityId);
      return opp ? sum + opp.amount : sum;
    }, 0);
  }, [applications, oppMap]);

  // Next upcoming deadline among tracked apps
  const nextDeadlineInfo = useMemo(() => {
    const activeApps = applications.filter((a) => a.status !== 'Submitted');
    if (activeApps.length === 0) return null;

    let nearestOpp: Opportunity | null = null;
    let minDays = Infinity;

    for (const app of activeApps) {
      const opp = oppMap.get(app.opportunityId);
      if (opp) {
        const { daysLeft } = formatDeadlineCountdown(opp.deadline);
        if (daysLeft >= 0 && daysLeft < minDays) {
          minDays = daysLeft;
          nearestOpp = opp;
        }
      }
    }

    return nearestOpp ? { opp: nearestOpp, days: minDays } : null;
  }, [applications, oppMap]);

  // Filtered applications by active tab
  const currentTabApplications = useMemo(() => {
    return applications.filter((app) => app.status === activeTab);
  }, [applications, activeTab]);

  const handleStartEditNotes = (app: SavedApplication) => {
    setEditingNotesId(app.id);
    setTempNotes(app.notes || '');
  };

  const handleSaveNotes = (appId: string) => {
    onUpdateNotes(appId, tempNotes);
    setEditingNotesId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize deadlines, multi-step progress, and submission receipts in one place.
          </p>
        </div>

        <button
          onClick={onGoToExplore}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-2 shadow-xs transition-colors"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Explore More Awards</span>
        </button>
      </div>

      {/* Tracker Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Potential Aid Tracked
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 tracking-tight">
            ${totalTrackedAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Across {applications.length} active programs
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            In-Progress Pipeline
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            {counts['In Progress']} Applications
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {counts.Submitted} already submitted
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Next Urgent Deadline
          </div>
          {nextDeadlineInfo ? (
            <div>
              <div className="text-base sm:text-lg font-bold text-amber-600 mt-1 truncate">
                {nextDeadlineInfo.days} days left
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {nextDeadlineInfo.opp.title}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-base font-bold text-slate-700 mt-1">No urgent deadlines</div>
              <div className="text-[11px] text-slate-400">All submissions up to date</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabbed Workflow Segmented Navigation */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between sm:justify-start gap-1">
        {(['Saved', 'In Progress', 'Submitted'] as ApplicationStatus[]).map((tab) => {
          const isActive = activeTab === tab;
          const count = counts[tab];

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {currentTabApplications.length > 0 ? (
        <div className="space-y-4">
          {currentTabApplications.map((app) => {
            const opp = oppMap.get(app.opportunityId);
            if (!opp) return null;

            const deadlineInfo = formatDeadlineCountdown(opp.deadline);
            const isEditingThisNote = editingNotesId === app.id;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-5 sm:p-6 shadow-xs transition-all space-y-4"
              >
                {/* Header: Provider, Title, Status selector, Delete action */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0 ${opp.providerLogoBg} ${opp.providerLogoColor}`}
                    >
                      {opp.providerInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {opp.providerName}
                        </span>
                        <span className="text-[11px] text-slate-400">· {opp.type}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug mt-0.5">
                        {opp.title}
                      </h3>
                    </div>
                  </div>

                  {/* Actions: Interactive Status Dropdown & Remove Button */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={app.status}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl border appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors ${
                          app.status === 'Submitted'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : app.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Saved">Saved</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Submitted">Submitted</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveApplication(app.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
                      title="Remove from tracker"
                      aria-label="Remove application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Award Amount & Deadline Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Award Amount
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-emerald-600">
                        {opp.amountFormatted}
                      </span>
                    </div>

                    <div className="h-7 w-px bg-slate-200" />

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Deadline
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Clock
                          className={`w-3.5 h-3.5 ${
                            deadlineInfo.isUrgent ? 'text-amber-500' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {deadlineInfo.formattedDate}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            deadlineInfo.isUrgent ? 'text-amber-600' : 'text-slate-500'
                          }`}
                        >
                          ({deadlineInfo.label})
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onApplyClick(opp)}
                    className="text-xs font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1 py-1"
                  >
                    <span>View Requirements</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Visual Multi-Step Progress Bar Component */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      Application Progress
                      <span className="text-slate-400 font-normal">
                        ({app.steps.filter((s) => s.done).length} of {app.steps.length} steps)
                      </span>
                    </span>
                    <span className="text-slate-900 font-extrabold">{app.progress}%</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        app.progress === 100
                          ? 'bg-emerald-500'
                          : app.progress >= 50
                          ? 'bg-emerald-600'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(5, app.progress)}%` }}
                    />
                  </div>

                  {/* Stage Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[
                      { label: '0%', val: 0 },
                      { label: '33%', val: 33 },
                      { label: '66%', val: 66 },
                      { label: '100%', val: 100 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        onClick={() => onUpdateProgress(app.id, preset.val)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                          app.progress === preset.val
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1">or check steps below:</span>
                  </div>
                </div>

                {/* Multi-Step Checklist */}
                <div className="space-y-1.5 pt-1">
                  {app.steps.map((st) => (
                    <label
                      key={st.id}
                      onClick={() => onToggleStep(app.id, st.id)}
                      className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs select-none ${
                        st.done
                          ? 'bg-emerald-50/50 text-emerald-950 font-medium'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={st.done}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className={st.done ? 'line-through opacity-80' : ''}>
                        {st.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Personal Notes Section */}
                <div className="pt-2 border-t border-slate-100">
                  {isEditingThisNote ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Add reminders, confirmation numbers, or essay notes..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                        rows={3}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNotes(app.id)}
                          className="px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-slate-600 truncate max-w-[80%]">
                        {app.notes ? (
                          <span className="italic">"{app.notes}"</span>
                        ) : (
                          <span className="text-slate-400">No notes added yet</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleStartEditNotes(app)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 shrink-0"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>{app.notes ? 'Edit' : 'Add Note'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            No applications in "{activeTab}"
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
            {activeTab === 'Saved'
              ? 'Bookmark scholarships from the Explore discovery feed to start tracking your eligibility and deadlines.'
              : activeTab === 'In Progress'
              ? 'Move saved applications to In-Progress once you begin assembling essays, transcripts, and recommendations.'
              : 'Keep pushing! Completed applications will be cataloged here once you submit them.'}
          </p>
          <button
            onClick={onGoToExplore}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
          >
            Explore Scholarships
          </button>
        </div>
      )}
    </div>
  );
};
