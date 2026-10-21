import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  EducationLevel,
  FinancialNeedLevel,
  Opportunity,
} from '../types';
import { calculateMatchScore } from '../utils/matchingEngine';
import {
  User,
  GraduationCap,
  Target,
  Save,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Globe,
  LogOut,
  Check,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface ProfileViewProps {
  profile: UserProfile;
  opportunities: Opportunity[];
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onResetDatabase: () => void;
  onGoToExplore: () => void;
  onSignOut?: () => void;
}

const COMMON_MAJORS = [
  'General Studies',
  'STEM',
  'Computer Science',
  'Software Engineering',
  'Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Medicine',
  'Nursing & Healthcare',
  'Biology / Pre-Med',
  'Agriculture',
  'Development Studies',
  'Education',
  'Business Administration',
  'Finance & Accounting',
  'All Majors / Undeclared',
];

export const TARGET_COUNTRIES = [
  'All Countries / Worldwide',
  'South Africa',
  'Kenya',
  'Nigeria',
  'Ghana',
  'Rwanda',
  'Egypt',
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'France',
  'Netherlands',
  'Australia',
  'Japan',
  'China',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  opportunities,
  onSaveProfile,
  onResetDatabase,
  onGoToExplore,
  onSignOut,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData(profile);
    setIsDirty(false);
  }, [profile]);

  const handleChange = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  const handleGpaNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0.0;
    val = Math.min(4.0, Math.max(0.0, parseFloat(val.toFixed(2))));
    handleChange('gpa', val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const configuredProfile: UserProfile = {
      ...formData,
      isConfigured: true,
    };
    onSaveProfile(configuredProfile);
    setIsDirty(false);
  };

  // Progressive Profiling Checkpoints
  const completionItems = [
    {
      id: 'basic',
      name: 'Account & Name',
      isComplete: Boolean(formData.fullName?.trim() && formData.fullName !== 'Guest Scholar'),
      weight: 20,
      description: 'Personalized identity in applications',
    },
    {
      id: 'degree',
      name: 'Degree Stage',
      isComplete: Boolean(formData.educationLevel),
      weight: 20,
      description: 'Filters undergraduate vs graduate programs',
    },
    {
      id: 'major',
      name: 'Field of Study',
      isComplete: Boolean(formData.major && formData.major.trim()),
      weight: 20,
      description: 'Unlocks +25% discipline matching criteria',
    },
    {
      id: 'gpa',
      name: 'Cumulative GPA',
      isComplete: typeof formData.gpa === 'number' && formData.gpa > 0,
      weight: 20,
      description: 'Unlocks +35% merit threshold calculation',
    },
    {
      id: 'country',
      name: 'Destination Country',
      isComplete: Boolean(formData.targetCountry && formData.targetCountry.trim()),
      weight: 20,
      description: 'Aligns bilateral grants and international awards',
    },
  ];

  const profileCompletionPercentage = completionItems.reduce(
    (acc, curr) => (curr.isComplete ? acc + curr.weight : acc),
    0
  );

  const hasDraftPrefs =
    (formData.gpa > 0 && Boolean(formData.major && formData.major.trim())) ||
    formData.isConfigured === true;

  // Real-time recalculated preview scores with draft formData
  const simulatedMatches = hasDraftPrefs
    ? opportunities
        .map((opp) => ({
          opp,
          match: calculateMatchScore(formData, opp),
        }))
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 3)
    : [];

  const averageSimulatedMatch =
    simulatedMatches.length > 0
      ? Math.round(
          simulatedMatches.reduce((acc, curr) => acc + curr.match.score, 0) /
            simulatedMatches.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Student Profile & Academic Preferences
            </h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                profileCompletionPercentage === 100
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {profileCompletionPercentage}% Complete
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure your academic profile to unlock personalized scholarship recommendations across 5,000+ verified opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetDatabase}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh latest scholarship listings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Sign out of ScholarHub"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Progressive Profiling Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-bold text-white">
                {profileCompletionPercentage === 100
                  ? 'Academic Profile Complete'
                  : 'Profile Preferences: Unlock Personalized Matches'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              {profileCompletionPercentage === 100
                ? 'Your full academic profile is active. Opportunities are dynamically ranked by GPA threshold, degree level, target country, and study field.'
                : 'Complete the remaining preference checkpoints below to activate tailored eligibility calculations and 90%+ match scoring.'}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-emerald-400">
              {profileCompletionPercentage}%
            </div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Profile Strength
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${profileCompletionPercentage}%` }}
            />
          </div>
        </div>

        {/* Checkpoint Indicators */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {completionItems.map((item) => (
            <div
              key={item.id}
              className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                item.isComplete
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  item.isComplete ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
                }`}
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <div className="truncate text-[11px] font-semibold">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PWA Install Promotion Card */}
      <PWAInstallButton variant="card" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container (2 columns on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Enter your name (e.g. Kwame Mensah)"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Student Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Education Level Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Current Degree / Education Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['High School', 'Undergraduate', 'Graduate', 'Doctorate'] as EducationLevel[]).map(
                  (lvl) => {
                    const isSelected = formData.educationLevel === lvl;
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => handleChange('educationLevel', lvl)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Major / Field of Study */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Major / Field of Study
              </label>
              <div className="space-y-2">
                <select
                  value={formData.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium text-slate-900 bg-white"
                >
                  <option value="">-- Select your field of study / major --</option>
                  {COMMON_MAJORS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Select your primary discipline. Unlocks discipline-specific STEM, healthcare, and humanitarian funding programs.
                </p>
              </div>
            </div>

            {/* Target Destination Country of Study */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Country of Study (Destination)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={formData.targetCountry || ''}
                  onChange={(e) => handleChange('targetCountry', e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium text-slate-900 bg-white"
                >
                  <option value="">-- Select preferred destination country --</option>
                  {TARGET_COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Filter and align awards with regional bilateral grants (e.g. South Africa, Kenya, Nigeria, US, UK, Canada, Germany).
              </p>
            </div>

            {/* Current GPA Slider & Numeric Input */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Cumulative GPA (4.0 Scale)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Required for merit-based scholarships and fellowship eligibility thresholds
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.0"
                    max="4.0"
                    value={formData.gpa > 0 ? formData.gpa : ''}
                    placeholder="0.00"
                    onChange={handleGpaNumberChange}
                    className="w-20 text-center font-extrabold text-lg text-emerald-600 bg-white border border-slate-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="2.0"
                  max="4.0"
                  step="0.05"
                  value={formData.gpa > 0 ? formData.gpa : 3.0}
                  onChange={(e) => handleChange('gpa', parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>2.0 (Standard)</span>
                  <span>3.0 (B Average)</span>
                  <span>3.5 (Honors)</span>
                  <span>4.0 (Perfect)</span>
                </div>
              </div>
            </div>

            {/* Financial Need Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Financial Need Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'High', label: 'High Need', desc: 'Full Aid / Need-Based' },
                  { id: 'Moderate', label: 'Moderate Need', desc: 'Partial Aid' },
                  { id: 'Low', label: 'Low / Merit Only', desc: 'Merit Dependent' },
                ].map((item) => {
                  const isSelected = formData.financialNeed === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleChange('financialNeed', item.id as FinancialNeedLevel)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isSelected ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* First Generation Toggle */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  First-Generation Higher Education Student
                </span>
                <span className="text-[11px] text-slate-500">
                  First in your immediate family to attend university (matches equity fellowships)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('isFirstGen', !formData.isFirstGen)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isFirstGen ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isFirstGen ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {isDirty ? (
                  <span className="text-amber-600 font-medium">Unsaved changes will alter match %</span>
                ) : (
                  <span>Preferences saved & recommendations updated</span>
                )}
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Save & Update Recommendations</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Matching Engine Preview Card */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold tracking-tight">Academic Match Preview</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                Real-Time
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Here is how your inputs score against our scholarship catalog before saving:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Simulated Avg Match</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {hasDraftPrefs && averageSimulatedMatch > 0 ? `${averageSimulatedMatch}%` : '--'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Target Field</span>
                <span className="text-xs font-bold text-white truncate max-w-[120px] block">
                  {formData.major || 'All Fields'}
                </span>
              </div>
            </div>

            {hasDraftPrefs && simulatedMatches.length > 0 ? (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Top Compatible Programs
                </div>
                {simulatedMatches.map(({ opp, match }) => (
                  <div
                    key={opp.id}
                    className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-white truncate max-w-[160px]">
                        {opp.title}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold">
                        {opp.amountFormatted}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-emerald-400 text-sm">
                        {match.score}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">Match</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">No Preferences Set</p>
                <p className="text-[11px]">Select your major and set your GPA above to view real-time match scores.</p>
              </div>
            )}

            <button
              onClick={onGoToExplore}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Explore Matching Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              How ScholarHub Scores You
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Our evaluation considers GPA threshold fulfillment (35%), education stage (30%), field of study specialization (25%), and country alignment & financial need criteria (10%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
