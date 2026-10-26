import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  Mail,
  FileText,
  Lock,
  ChevronRight,
  X,
  Compass,
  CheckSquare,
  User,
  CheckCircle2,
  ExternalLink,
  Send,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface FooterProps {
  onNavigate?: (tab: NavTab) => void;
}

type ModalType = 'faq' | 'contact' | 'privacy' | 'terms' | null;

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Verification',
    question: 'How are scholarships and opportunities verified?',
    answer:
      'Every scholarship, grant, and loan listed on ScholarHub undergoes an editorial check against official university, philanthropic foundation, or government listings. We verify eligibility criteria, deadlines, and official direct application URLs to protect students from predatory scams.',
  },
  {
    category: 'Matching',
    question: 'How does the matchmaking engine work?',
    answer:
      'Our matchmaking engine privately compares your student profile—including your GPA, field of study, degree level, and home country—against each program’s prerequisites. Opportunities are automatically ordered on your feed so your most relevant and eligible scholarships appear first.',
  },
  {
    category: 'Costs & Fees',
    question: 'Does ScholarHub charge any application fees?',
    answer:
      'No. ScholarHub is 100% free for all students. Legitimate scholarships and educational grants never charge application or processing fees. If any provider asks you for an upfront fee, do not proceed and please report it to our team immediately.',
  },
  {
    category: 'Applications',
    question: 'How does the Application Tracker help me?',
    answer:
      'The Application Tracker lets you save opportunities, set custom checklist steps (e.g., transcripts, recommendation letters, essay drafts), log deadline reminders, and maintain personal notes throughout your application cycle.',
  },
  {
    category: 'Updates',
    question: 'How often is the opportunity database refreshed?',
    answer:
      'Our catalog is actively maintained and updated with new funding rounds, deadline extensions, and upcoming scholarship cycles so you never miss an opening.',
  },
];

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState('Scholarship Question');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // FAQ accordion state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const handleCloseModal = () => {
    setActiveModal(null);
    setContactSubmitted(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
    setContactSubmitted(true);
  };

  return (
    <>
      <footer id="scholarhub-footer" className="w-full bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {/* Column 1: Brand & Mission */}
            <div className="space-y-4 lg:col-span-1">
              <div
                onClick={() => onNavigate?.('explore')}
                className="flex items-center gap-2.5 cursor-pointer group inline-flex"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-white shadow-sm group-hover:border-emerald-500/50 transition-colors">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-extrabold text-xl text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                  ScholarHub
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Empowering scholars with direct access to verified global scholarships, educational grants, and student financing opportunities.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Free • Verified Opportunities</span>
              </div>
            </div>

            {/* Column 2: Quick Platform Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() => onNavigate?.('explore')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-left cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>Explore Opportunities</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.('tracker')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-left cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>Application Tracker</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.('profile')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>Student Profile & Matching</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate?.('about')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-left cursor-pointer"
                  >
                    <Info className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>About Us & Partnerships</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Help & Support Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                Help & Resources
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() => setActiveModal('faq')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-left cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>Frequently Asked Questions</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('contact')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-left cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>Support & Contact Desk</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('privacy')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-left cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('terms')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>Terms of Service</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Student Protection Notice */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                Student Safety
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs leading-relaxed text-slate-300">
                <p className="font-medium text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  Free & Open Access
                </p>
                <p className="text-slate-400">
                  ScholarHub never requests payment or banking credentials from applicants. Never pay any fee to apply for legitimate scholarships.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Legal */}
          <div className="border-t border-slate-800 pt-8 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 ScholarHub. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
              <button
                onClick={() => onNavigate?.('about')}
                className="hover:text-white text-slate-400 transition-colors cursor-pointer"
              >
                About Us
              </button>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setActiveModal('contact')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Support / Contact
              </button>
              <button
                onClick={() => setActiveModal('faq')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                FAQs
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* FAQs Modal */}
      {activeModal === 'faq' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Frequently Asked Questions</h3>
                  <p className="text-xs text-slate-500">Everything you need to know about ScholarHub</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100">
              {FAQS.map((faq, index) => {
                const isOpen = expandedFaqIndex === index;
                return (
                  <div key={index} className={index === 0 ? '' : 'pt-3'}>
                    <button
                      onClick={() => setExpandedFaqIndex(isOpen ? null : index)}
                      className="w-full text-left flex items-start justify-between gap-4 group cursor-pointer py-1"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                          {faq.category}
                        </span>
                        <span className="font-semibold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                          {faq.question}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform shrink-0 mt-1 ${
                          isOpen ? 'rotate-90 text-emerald-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 pl-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-l-2 border-emerald-500 py-1 bg-slate-50/60 rounded-r-lg px-3">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Have more questions?</span>
              <button
                onClick={() => setActiveModal('contact')}
                className="font-semibold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
              >
                Contact Support Desk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support & Contact Modal */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Support & Contact Desk</h3>
                  <p className="text-xs text-slate-500">We typically respond to student inquiries within 24 hours</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {contactSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-900">Message Received!</h4>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto">
                      Thank you, <span className="font-semibold">{contactName}</span>. Our student advisory team has received your inquiry and will follow up at <span className="font-semibold">{contactEmail}</span>.
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amara Okafor"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@university.edu"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      value={contactCategory}
                      onChange={(e) => setContactCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    >
                      <option value="Scholarship Question">Scholarship Information / Deadlines</option>
                      <option value="Broken Link">Report Broken Link or Outdated Info</option>
                      <option value="Account Help">Profile or Account Assistance</option>
                      <option value="Feedback">Feedback or New Feature Suggestion</option>
                      <option value="Other">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe your question or the scholarship you are inquiring about..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Privacy Policy</h3>
                  <p className="text-xs text-slate-500">Effective Date: January 1, 2026</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">1. Commitment to Student Privacy</h4>
                <p>
                  ScholarHub is dedicated to safeguarding the privacy and personal data of students. We believe academic opportunities should be accessible without sacrificing personal information.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">2. Data We Collect & How It Is Used</h4>
                <p>
                  We only store the information you choose to enter into your profile—such as your degree level, GPA, field of study, country of citizenship, and saved applications. This data is exclusively used to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                  <li>Personalize your opportunities feed with high-compatibility scholarships and grants.</li>
                  <li>Enable application tracking, checklist management, and deadline notifications.</li>
                  <li>Sync your saved opportunities securely across your authenticated devices.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">3. We Never Sell Your Data</h4>
                <p>
                  ScholarHub does not sell, rent, or trade student profiles, email addresses, or academic records to third-party advertisers, data brokers, or commercial entities under any circumstances.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">4. Offline Storage & Caching</h4>
                <p>
                  As a Progressive Web App (PWA), ScholarHub may cache your preferences and offline-enabled opportunities locally on your device using secure browser storage (LocalStorage / IndexedDB) so you can review deadlines when offline.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">5. Your Control & Account Rights</h4>
                <p>
                  You retain complete ownership over your data. You may modify or delete your profile information, saved applications, and account at any time directly through the Profile tab.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Terms of Service</h3>
                  <p className="text-xs text-slate-500">Effective Date: January 1, 2026</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">1. Educational Information Platform</h4>
                <p>
                  ScholarHub operates as an informational directory and application tracker designed to connect students with educational funding. ScholarHub does not directly award scholarships or determine program winners unless explicitly specified.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">2. Verification & External Providers</h4>
                <p>
                  While ScholarHub makes every reasonable effort to verify the accuracy of eligibility criteria, deadlines, and links, scholarship sponsors may modify their terms or close application windows without advance notice. Students are encouraged to review the official provider terms prior to submission.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">3. Zero-Fee Guarantee</h4>
                <p>
                  ScholarHub is freely available to all prospective and current students. We do not broker paid applications or endorse any service requiring payment to submit scholarship applications.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">4. Acceptable Use</h4>
                <p>
                  Users agree to use ScholarHub solely for personal, non-commercial educational purposes. Automated scraping, data harvesting, or interfering with platform operations is strictly prohibited.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
