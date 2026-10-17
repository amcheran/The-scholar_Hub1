export type EducationLevel = 'High School' | 'Undergraduate' | 'Graduate' | 'Doctorate';

export type FinancialNeedLevel = 'High' | 'Moderate' | 'Low';

export type OpportunityType = 'Scholarship' | 'Grant' | 'Student Loan' | 'Fellowship';

export type ApplicationStatus = 'Saved' | 'In Progress' | 'Submitted';

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  gpa: number;
  major: string;
  educationLevel: EducationLevel;
  financialNeed: FinancialNeedLevel;
  isFirstGen: boolean;
  citizenship: string;
  targetCountry?: string;
  isConfigured?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  providerName: string;
  type: OpportunityType;
  amount: number;
  amountFormatted: string;
  deadline: string; // ISO date 'YYYY-MM-DD'
  gpaRequirement: number;
  majorTag: string; // 'Computer Science', 'STEM', 'Business', 'Healthcare', 'Arts & Humanities', 'All Majors'
  educationLevels: EducationLevel[];
  noEssay: boolean;
  needBased: boolean;
  description: string;
  eligibility: string[];
  requirements: string[];
  providerUrl: string;
  providerLogoBg: string;
  providerLogoColor: string;
  providerInitials: string;
  interestRate?: string;
  cosignerRequired?: boolean;
  featured?: boolean;
}

export interface ApplicationStep {
  id: string;
  label: string;
  done: boolean;
}

export interface SavedApplication {
  id: string;
  userId: string;
  opportunityId: string;
  status: ApplicationStatus;
  progress: number; // 0, 25, 50, 75, 100
  savedAt: string;
  updatedAt: string;
  notes: string;
  steps: ApplicationStep[];
}

export interface MatchScoreDetails {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'Fair';
  breakdown: {
    category: string;
    passed: boolean;
    points: number;
    description: string;
  }[];
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
