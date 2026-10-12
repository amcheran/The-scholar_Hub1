import { Opportunity, SavedApplication, UserProfile, ApplicationStatus } from '../types';
import { INITIAL_USER_PROFILE, SEED_OPPORTUNITIES } from './seedOpportunities';

const STORAGE_KEYS = {
  PROFILE: 'scholarhub_table_profiles',
  OPPORTUNITIES: 'scholarhub_table_opportunities',
  SAVED_APPLICATIONS: 'scholarhub_table_saved_applications',
};

// Initial default tracker items so user immediately sees rich data on load
const INITIAL_SAVED_APPLICATIONS: SavedApplication[] = [
  {
    id: 'app_saved_01',
    userId: 'usr_default_01',
    opportunityId: 'opp_google_tech_2026',
    status: 'In Progress',
    progress: 50,
    savedAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-11T14:30:00Z',
    notes: 'Drafted 2 out of 3 technical essay responses. Need recommendation from Prof. Henderson.',
    steps: [
      { id: 'step_1', label: 'Verify minimum GPA & eligibility criteria', done: true },
      { id: 'step_2', label: 'Prepare technical resume & project portfolio', done: true },
      { id: 'step_3', label: 'Complete 3 diversity & leadership essays', done: false },
      { id: 'step_4', label: 'Request official faculty recommendation', done: false },
    ],
  },
  {
    id: 'app_saved_02',
    userId: 'usr_default_01',
    opportunityId: 'opp_coca_cola_scholars',
    status: 'Saved',
    progress: 0,
    savedAt: '2026-10-10T16:20:00Z',
    updatedAt: '2026-10-10T16:20:00Z',
    notes: 'Due end of month. No essay required for Phase 1. Need to log community service hours.',
    steps: [
      { id: 'step_1', label: 'Verify minimum GPA & eligibility criteria', done: true },
      { id: 'step_2', label: 'Gather documented community service hours', done: false },
      { id: 'step_3', label: 'Submit Phase 1 digital questionnaire', done: false },
    ],
  },
  {
    id: 'app_saved_03',
    userId: 'usr_default_01',
    opportunityId: 'opp_amazon_engineer_2026',
    status: 'Submitted',
    progress: 100,
    savedAt: '2026-10-01T09:15:00Z',
    updatedAt: '2026-10-09T18:00:00Z',
    notes: 'Submitted on Oct 9. Confirmation #AFE-882910. Decision anticipated early December.',
    steps: [
      { id: 'step_1', label: 'Verify minimum GPA & eligibility criteria', done: true },
      { id: 'step_2', label: 'Upload transcript and FAFSA verification', done: true },
      { id: 'step_3', label: 'Submit personal statement & faculty reference', done: true },
      { id: 'step_4', label: 'Confirm submission receipt & portal login', done: true },
    ],
  },
];

export class ScholarHubDatabase {
  static getProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    this.saveProfile(INITIAL_USER_PROFILE);
    return INITIAL_USER_PROFILE;
  }

  static saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  }

  static getOpportunities(): Opportunity[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    this.saveOpportunities(SEED_OPPORTUNITIES);
    return SEED_OPPORTUNITIES;
  }

  static saveOpportunities(opps: Opportunity[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(opps));
    } catch (e) {
      console.error('Failed to save opportunities', e);
    }
  }

  static getSavedApplications(): SavedApplication[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_APPLICATIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    this.saveApplications(INITIAL_SAVED_APPLICATIONS);
    return INITIAL_SAVED_APPLICATIONS;
  }

  static saveApplications(apps: SavedApplication[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_APPLICATIONS, JSON.stringify(apps));
    } catch (e) {
      console.error('Failed to save applications', e);
    }
  }

  static addOrSaveApplication(opportunityId: string, initialStatus: ApplicationStatus = 'Saved'): SavedApplication {
    const apps = this.getSavedApplications();
    const existingIndex = apps.findIndex((a) => a.opportunityId === opportunityId);

    if (existingIndex >= 0) {
      const existing = apps[existingIndex];
      const updated: SavedApplication = {
        ...existing,
        status: initialStatus,
        progress: initialStatus === 'Submitted' ? 100 : initialStatus === 'In Progress' ? Math.max(existing.progress, 33) : existing.progress,
        updatedAt: new Date().toISOString(),
      };
      apps[existingIndex] = updated;
      this.saveApplications(apps);
      return updated;
    }

    const defaultSteps = [
      { id: 'step_1', label: 'Verify minimum GPA & eligibility requirements', done: true },
      { id: 'step_2', label: 'Prepare required documents (Transcripts/FAFSA)', done: initialStatus !== 'Saved' },
      { id: 'step_3', label: 'Complete written application and statements', done: initialStatus === 'Submitted' },
      { id: 'step_4', label: 'Final review and application submission', done: initialStatus === 'Submitted' },
    ];

    const progressValue = initialStatus === 'Submitted' ? 100 : initialStatus === 'In Progress' ? 33 : 0;

    const newApp: SavedApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: 'usr_default_01',
      opportunityId,
      status: initialStatus,
      progress: progressValue,
      savedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '',
      steps: defaultSteps,
    };

    apps.unshift(newApp);
    this.saveApplications(apps);
    return newApp;
  }

  static updateApplicationStatus(appId: string, status: ApplicationStatus): SavedApplication | null {
    const apps = this.getSavedApplications();
    const index = apps.findIndex((a) => a.id === appId);
    if (index === -1) return null;

    let newProgress = apps[index].progress;
    if (status === 'Submitted') newProgress = 100;
    else if (status === 'Saved' && newProgress === 100) newProgress = 0;
    else if (status === 'In Progress' && newProgress === 0) newProgress = 33;

    // sync steps if marked submitted
    const updatedSteps = apps[index].steps.map((st) => ({
      ...st,
      done: status === 'Submitted' ? true : st.done,
    }));

    apps[index] = {
      ...apps[index],
      status,
      progress: newProgress,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    this.saveApplications(apps);
    return apps[index];
  }

  static updateApplicationProgress(appId: string, progress: number): SavedApplication | null {
    const apps = this.getSavedApplications();
    const index = apps.findIndex((a) => a.id === appId);
    if (index === -1) return null;

    let derivedStatus = apps[index].status;
    if (progress === 100) derivedStatus = 'Submitted';
    else if (progress > 0 && derivedStatus === 'Saved') derivedStatus = 'In Progress';
    else if (progress === 0 && derivedStatus === 'In Progress') derivedStatus = 'Saved';

    apps[index] = {
      ...apps[index],
      progress,
      status: derivedStatus,
      updatedAt: new Date().toISOString(),
    };

    this.saveApplications(apps);
    return apps[index];
  }

  static toggleStep(appId: string, stepId: string): SavedApplication | null {
    const apps = this.getSavedApplications();
    const index = apps.findIndex((a) => a.id === appId);
    if (index === -1) return null;

    const updatedSteps = apps[index].steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s));
    const completedCount = updatedSteps.filter((s) => s.done).length;
    const totalCount = updatedSteps.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    let status = apps[index].status;
    if (progressPercent === 100) status = 'Submitted';
    else if (progressPercent > 0 && status === 'Saved') status = 'In Progress';
    else if (progressPercent === 0 && status === 'Submitted') status = 'In Progress';

    apps[index] = {
      ...apps[index],
      steps: updatedSteps,
      progress: progressPercent,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.saveApplications(apps);
    return apps[index];
  }

  static updateNotes(appId: string, notes: string): SavedApplication | null {
    const apps = this.getSavedApplications();
    const index = apps.findIndex((a) => a.id === appId);
    if (index === -1) return null;

    apps[index] = {
      ...apps[index],
      notes,
      updatedAt: new Date().toISOString(),
    };

    this.saveApplications(apps);
    return apps[index];
  }

  static removeApplication(appId: string): boolean {
    const apps = this.getSavedApplications();
    const filtered = apps.filter((a) => a.id !== appId);
    if (filtered.length !== apps.length) {
      this.saveApplications(filtered);
      return true;
    }
    return false;
  }

  static removeByOpportunityId(opportunityId: string): boolean {
    const apps = this.getSavedApplications();
    const filtered = apps.filter((a) => a.opportunityId !== opportunityId);
    if (filtered.length !== apps.length) {
      this.saveApplications(filtered);
      return true;
    }
    return false;
  }

  static resetDatabase(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.OPPORTUNITIES);
    localStorage.removeItem(STORAGE_KEYS.SAVED_APPLICATIONS);
    this.saveProfile(INITIAL_USER_PROFILE);
    this.saveOpportunities(SEED_OPPORTUNITIES);
    this.saveApplications(INITIAL_SAVED_APPLICATIONS);
  }
}
