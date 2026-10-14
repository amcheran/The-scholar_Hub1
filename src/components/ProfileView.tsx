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
  BookOpen,
  DollarSign,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface ProfileViewProps {
  profile: UserProfile;
  opportunities: Opportunity[];
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onResetDatabase: () => void;
  onGoToExplore: () => void;
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

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  opportunities,
  onSaveProfile,
  onResetDatabase,
  onGoToExplore,
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
    onSaveProfile(formData);
    setIsDirty(false);
  };

  // Real-time recalculated preview scores with draft formData
  const simulatedMatches = opportunities
    .map((opp) => ({
      opp,
      match: calculateMatchScore(formData, opp),
    }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3);

  const averageSimulatedMatch =
    simulatedMatches.length > 0
      ? Math.round(simulatedMatches.reduce((acc, curr) => acc + curr.match.score, 0) / simulatedMatches.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Student Profile & Matching Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure your academic profile to power personalized match scores across scholarships and student loans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetDatabase}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Re-sync data directly from Supabase"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-sync Supabase</span>
          </button>
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
                    placeholder="Enter your name (e.g. Jordan Smith)"
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
                Current Education Level
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
                  {COMMON_MAJORS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Select your primary degree path. Matches STEM, healthcare, and discipline-specific funding programs.
                </p>
              </div>
            </div>

            {/* Current GPA Slider & Numeric Input */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Cumulative GPA (4.0 Scale)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Calculates eligibility for merit-based scholarships
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.0"
                    max="4.0"
                    value={formData.gpa}
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
                  value={formData.gpa}
                  onChange={(e) => handleChange('gpa', parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>2.0 (Min Standard)</span>
                  <span>3.0 (B Average)</span>
                  <span>3.5 (Dean's List)</span>
                  <span>4.0 (Perfect)</span>
                </div>
              </div>
            </div>

            {/* Financial Need Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Financial Need Status (FAFSA / Household Income)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'High', label: 'High Need', desc: 'Pell Grant Eligible' },
                  { id: 'Moderate', label: 'Moderate Need', desc: 'Partial Aid Recipient' },
                  { id: 'Low', label: 'Low / Merit Only', desc: 'Non-Need Dependent' },
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
                  First-Generation College Student
                </span>
                <span className="text-[11px] text-slate-500">
                  First in immediate family to attend an accredited 4-year university
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
                  <span>All credentials synchronized</span>
                )}
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Save & Recalculate Matches</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Matching Engine Preview Card */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold tracking-tight">Live Match Simulator</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                Real-Time
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Here is how your current inputs match our catalog before saving:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Simulated Avg Match</span>
                <span className="text-xl font-extrabold text-emerald-400">{averageSimulatedMatch}%</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Target Field</span>
                <span className="text-xs font-bold text-white truncate max-w-[120px] block">
                  {formData.major}
                </span>
              </div>
            </div>

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

            <button
              onClick={onGoToExplore}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>View Explore Feed</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              How ScholarHub Scores You
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Our algorithm weights GPA threshold fulfillment (35%), education stage (30%), field of study specialization (25%), and financial need criteria (10%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
