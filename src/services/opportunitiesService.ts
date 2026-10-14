import { supabase } from '../lib/supabase';
import { Opportunity, OpportunityType, EducationLevel } from '../types';

export interface SupabaseOpportunityRow {
  id: string;
  title: string;
  provider_name: string;
  type: string;
  award_summary: string | null;
  deadline: string | null;
  gpa_requirement: number | null;
  major_tags: string[] | null;
  external_url: string | null;
  is_sponsored: boolean | null;
  is_verified: boolean | null;
  created_at: string;
}

const LOGO_BG_COLORS = [
  'bg-emerald-700',
  'bg-blue-600',
  'bg-indigo-900',
  'bg-teal-700',
  'bg-amber-600',
  'bg-cyan-700',
  'bg-purple-700',
  'bg-slate-900',
];

function getProviderInitials(name: string): string {
  if (!name) return 'SH';
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

function getProviderBg(name: string): string {
  if (!name) return 'bg-slate-900';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % LOGO_BG_COLORS.length;
  return LOGO_BG_COLORS[index];
}

function parseType(rawType: string): OpportunityType {
  const lower = (rawType || '').toLowerCase();
  if (lower.includes('loan')) return 'Student Loan';
  if (lower.includes('grant')) return 'Grant';
  if (lower.includes('fellowship')) return 'Fellowship';
  return 'Scholarship';
}

function parseAmount(summary: string | null): number {
  if (!summary) return 0;
  // Match currency amounts like $20,000 or numerical figures
  const match = summary.match(/\$?([0-9]{1,3}(?:,[0-9]{3})+|\b[0-9]{4,6}\b)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
  if (summary.toLowerCase().includes('100%') || summary.toLowerCase().includes('full tuition')) {
    return 25000;
  }
  if (summary.toLowerCase().includes('partial')) {
    return 10000;
  }
  return 5000;
}

function formatDeadline(rawDeadline: string | null): string {
  if (!rawDeadline) return '2026-12-31';
  // If ISO string like 2026-10-30T00:00:00+00:00
  return rawDeadline.split('T')[0];
}

function deriveEducationLevels(title: string, summary: string | null): EducationLevel[] {
  const combined = `${title} ${summary || ''}`.toLowerCase();
  if (combined.includes('postgraduate') || combined.includes('master') || combined.includes('phd')) {
    return ['Graduate', 'Doctorate'];
  }
  if (combined.includes('undergraduate') || combined.includes('bachelor')) {
    return ['Undergraduate'];
  }
  if (combined.includes('high school')) {
    return ['High School', 'Undergraduate'];
  }
  return ['Undergraduate', 'Graduate'];
}

export function mapSupabaseToOpportunity(row: SupabaseOpportunityRow): Opportunity {
  const type = parseType(row.type);
  const providerName = row.provider_name || 'Scholarship Provider';
  const majorTags = Array.isArray(row.major_tags) && row.major_tags.length > 0 ? row.major_tags : ['All Majors'];
  const majorTag = majorTags[0];
  const gpa = row.gpa_requirement != null ? Number(row.gpa_requirement) : 2.5;
  const awardFormatted = row.award_summary || (type === 'Student Loan' ? 'Tuition & Living Loan' : 'Full / Partial Tuition');
  const amount = parseAmount(row.award_summary);
  const deadline = formatDeadline(row.deadline);
  const educationLevels = deriveEducationLevels(row.title, row.award_summary);

  const eligibility = [
    `Eligible for ${educationLevels.join(' or ')} candidates`,
    majorTags.length > 0 && majorTags[0] !== 'All Majors'
      ? `Priority fields: ${majorTags.slice(0, 4).join(', ')}`
      : 'Open to applicants across all fields of study',
    row.gpa_requirement ? `Minimum GPA of ${gpa.toFixed(1)} required` : 'Good academic standing required',
  ];

  const requirements = [
    'Completed online applicant portal form',
    'Official academic transcript / qualification certificate',
    'Proof of university admission or student ID',
    type === 'Scholarship' ? 'Personal statement / motivation statement' : 'Financial aid loan declaration form',
  ];

  return {
    id: row.id,
    title: row.title,
    providerName,
    type,
    amount,
    amountFormatted: awardFormatted,
    deadline,
    gpaRequirement: gpa,
    majorTag,
    educationLevels,
    noEssay: type === 'Student Loan',
    needBased: type === 'Student Loan' || awardFormatted.toLowerCase().includes('need') || awardFormatted.toLowerCase().includes('allowance'),
    description: row.award_summary || `${providerName} opportunity for ${majorTag} students.`,
    eligibility,
    requirements,
    providerUrl: row.external_url || 'https://helsb.gov.zm/',
    providerLogoBg: getProviderBg(providerName),
    providerLogoColor: 'text-white',
    providerInitials: getProviderInitials(providerName),
    featured: row.is_sponsored || false,
    interestRate: type === 'Student Loan' ? 'Low-interest student revolving fund' : undefined,
    cosignerRequired: false,
  };
}

export async function fetchOpportunitiesFromSupabase(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((row) => mapSupabaseToOpportunity(row as SupabaseOpportunityRow));
}
