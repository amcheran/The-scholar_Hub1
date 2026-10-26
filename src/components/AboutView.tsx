import React, { useState } from 'react';
import {
  GraduationCap,
  Target,
  Globe2,
  BookOpen,
  Award,
  CheckCircle2,
  ArrowRight,
  Send,
  Building2,
  Users2,
  Sparkles,
  HelpCircle,
  FileCheck,
  Shield,
  Layers,
  Sliders,
  Filter,
  Check,
  Compass,
} from 'lucide-react';
import { useToast } from './Toast';

interface AboutViewProps {
  onGoToExplore: () => void;
  onGoToProfile: () => void;
}

type InquiryType =
  | 'student_support'
  | 'broken_link'
  | 'institution_partner'
  | 'sponsor_grant'
  | 'general_feedback';

export const AboutView: React.FC<AboutViewProps> = ({
  onGoToExplore,
  onGoToProfile,
}) => {
  const { showToast } = useToast();

  // Contact / Collaboration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [inquiryType, setInquiryType] = useState<InquiryType>('student_support');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Missing Fields', 'Please fill in your name, email, and message.', 'warning');
      return;
    }

    setIsSubmitting(true);
    // Simulate swift network dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast(
        'Inquiry Transmitted',
        'Thank you! Your message has been received by the ScholarHub team.',
        'success'
      );
    }, 450);
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setOrganization('');
    setInquiryType('student_support');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-300">
      {/* Hero Banner: Vision Statement */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 md:p-14 shadow-xl border border-slate-800">
        {/* Subtle decorative glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide uppercase">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Empowering Global & African Scholars</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Transparent, Verified Higher Education Funding for Every Student.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
            ScholarHub is an open student platform created to bridge the information gap in higher education financing. We curate, verify, and match students with authentic scholarships, educational grants, and non-predatory student loans—free of application paywalls and hidden fees.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onGoToExplore}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-900/30 active:scale-95 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Opportunities</span>
            </button>

            <button
              onClick={onGoToProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700 active:scale-95 cursor-pointer"
            >
              <span>Configure Your Matching Profile</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Highlight Grid inside Hero */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-8 border-t border-slate-800/80 text-left">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">100%</div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">Free for Students</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">Undergrad → PhD</div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">All Degree Levels</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">Pan-African & Global</div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">Local & International</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">Verified Direct</div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">Zero Scam Tolerance</div>
          </div>
        </div>
      </section>

      {/* SECTION 1: OUR VISION & SCOPE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Section 1</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Our Vision & Scope
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Unlocking university and post-graduate accessibility through authenticated educational financing.
          </p>
        </div>

        {/* Narrative & Mission Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Mission Narrative Card */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <BookOpen className="w-5 h-5" />
              </span>
              The Mission Behind ScholarHub
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Countless students around the world—especially across Africa and developing regions—possess extraordinary academic promise, yet face insurmountable tuition hurdles or fall prey to deceptive third-party scholarship scams that charge illicit fees.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              ScholarHub was established to overturn this dynamic. We provide a clean, centralized, and verified clearinghouse where every listed opportunity connects directly to the official university, philanthropic foundation, or accredited student lender. We never sell student data, we never charge application commissions, and we provide students with practical tools to monitor deadlines and manage application requirements.
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Zero Predatory Fees:</span> Legitimate scholarships are always 100% free to apply to.
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Editorial Verification:</span> Every deadline and URL is validated against primary institutional records.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Scope Breakdown */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Geographic & Academic Reach</span>
              </div>
              <h3 className="text-lg font-bold text-white">Broad Scope, Universal Inclusivity</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                ScholarHub actively tracks higher education opportunities that cater to domestic learners in African universities as well as global outbound scholars aiming for international research hubs.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <span className="text-slate-300">African Hubs</span>
                <span className="font-semibold text-emerald-400">South Africa, Kenya, Nigeria, Ghana, Rwanda</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <span className="text-slate-300">Global Destinations</span>
                <span className="font-semibold text-emerald-400">USA, UK, Canada, Germany, Australia, Japan</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <span className="text-slate-300">Field Spectrum</span>
                <span className="font-semibold text-emerald-400">STEM, Medicine, Humanities, Arts & Business</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Scope Dimension Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Undergraduate to Doctorate</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              From incoming college freshmen and Bachelor's degrees to specialized Master’s research, PhD dissertations, and post-doc fellowships.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Globe2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Local & Global Footprint</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Curated opportunities covering domestic study inside national African universities alongside prestigious outbound international awards.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">All Fields of Study</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tailored criteria spanning Software Engineering, Climate Science, Health Sciences, Economics, Law, Agriculture, and Fine Arts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Diverse Funding Formats</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Merit-based scholarships, need-based financial aid, academic research grants, living stipends, and fair-rate student loans.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW SCHOLARHUB WORKS (TRANSPARENT PROCESS) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Section 2</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How ScholarHub Works
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            A 100% transparent 3-step evaluation process without opaque black boxes or artificial jargon.
          </p>
        </div>

        {/* 3 Clear Transparent Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="relative p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5 group hover:border-emerald-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  1
                </span>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full">
                  Step One
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  Profile Customization
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Students define their academic parameters
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You configure your academic profile in under a minute by selecting your current or anticipated GPA, specific field of study, current degree level, citizenship, and preferred destination.
              </p>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
                <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                  Inputs Evaluated:
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>GPA (0.0 - 4.0)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Academic Major</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Degree Level</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Target Region</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onGoToProfile}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Setup Your Profile</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5 group hover:border-emerald-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  2
                </span>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full">
                  Step Two
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  Criterion Matching
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Rule-based qualification analysis
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ScholarHub evaluates your profile inputs directly against the official eligibility rules and entry minimums cataloged for each program. There is no guessing or arbitrary filtering.
              </p>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
                <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                  Verification Criteria:
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>GPA Threshold Matching</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Department & Major Alignment</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Citizenship & Regional Directives</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-2.5 px-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-800 text-[11px] font-medium text-center">
              Clear Pass/Fail Check per Criteria
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5 group hover:border-emerald-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  3
                </span>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full">
                  Step Three
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  Sorted Opportunities
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ranked by highest eligibility fit
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your opportunity feed automatically ranks programs by total compatibility score so you immediately see the grants and scholarships where your profile is most competitive.
              </p>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
                <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                  Feed Organization:
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Top Fits (Grade A+ & 90%+)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Direct Official Application URLs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Save to Application Tracker</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onGoToExplore}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <span>View Ranked Feed</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: GET IN TOUCH & COLLABORATE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Users2 className="w-4 h-4 text-emerald-600" />
              <span>Section 3</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Get in Touch & Collaborate
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Whether you are a student navigating applications or a university partner offering funding, we are here to assist.
          </p>
        </div>

        {/* Dual Audience Information Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* For Students Box */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">For Students & Applicants</h3>
                <p className="text-xs text-slate-500">Free student assistance & verification support</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Have questions regarding eligibility requirements, deadline extensions, or need to flag an expired program? Our student advisory desk is ready to help you navigate application cycles smoothly.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Clarification on GPA conversions and eligibility criteria.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Assistance utilizing the PWA offline tracker.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reporting broken external links or outdated criteria.</span>
              </li>
            </ul>
          </div>

          {/* For Institutions & Sponsors Box */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">For Institutions & Sponsors</h3>
                <p className="text-xs text-slate-500">Program listings, grants & university partnerships</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We collaborate with universities, philanthropic foundations, and educational endowments to feature genuine scholarships and connect them directly with high-achieving, eligible candidates.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>List your verified undergraduate or graduate grant opportunity.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Promote research fellowships and departmental endowments.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Partner on student financing and ethical educational aid initiatives.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact & Collaboration Form */}
        <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Send an Inquiry or Collaboration Request
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Submit the form below and our team will get back to you within 24 business hours.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-900">Message Successfully Sent!</h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                    Thank you for reaching out, <span className="font-semibold text-slate-900">{name}</span>. Our team will review your inquiry and follow up at <span className="font-semibold text-slate-900">{email}</span> shortly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name / Contact Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tendai Moyo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Inquiry Type / Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject / Inquiry Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value as InquiryType)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    >
                      <optgroup label="Student Inquiries">
                        <option value="student_support">Student: General Application Support</option>
                        <option value="broken_link">Student: Report Broken Link or Expired Program</option>
                      </optgroup>
                      <optgroup label="Institutions & Sponsors">
                        <option value="institution_partner">Institution: University / College Partnership</option>
                        <option value="sponsor_grant">Sponsor: Grant Listing & Program Sponsorship</option>
                      </optgroup>
                      <optgroup label="General">
                        <option value="general_feedback">General Feedback & Suggestions</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Organization (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Institution / Organization <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. University of Cape Town / Foundation"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder={
                      inquiryType.includes('sponsor') || inquiryType.includes('partner')
                        ? 'Please describe your institution, funding program details, eligibility criteria, and proposed partnership...'
                        : 'Describe your question, the scholarship name if applicable, or how we can assist you...'
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 text-center sm:text-left">
                    Protected by student privacy standards. No marketing spam.
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
