import { SavedApplication, UserProfile, ApplicationStatus } from '../types';
import { INITIAL_USER_PROFILE } from './seedOpportunities';

const STORAGE_KEYS = {
  PROFILE: 'scholarhub_table_profiles',
  SAVED_APPLICATIONS: 'scholarhub_table_saved_applications',
};

export class ScholarHubDatabase {
  static getProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Clear any legacy hardcoded Alex mock profile so user sees clean dynamic profile
        if (parsed.fullName === 'Alex Morgan') {
          parsed.fullName = '';
          parsed.email = '';
          this.saveProfile(parsed);
        }
        return parsed;
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

  static getSavedApplications(): SavedApplication[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_APPLICATIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return [];
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
      { id: 'step_2', label: 'Prepare required documents (Transcripts/Certificates)', done: initialStatus !== 'Saved' },
      { id: 'step_3', label: 'Complete written application and declarations', done: initialStatus === 'Submitted' },
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
    localStorage.removeItem(STORAGE_KEYS.SAVED_APPLICATIONS);
    localStorage.removeItem('scholarhub_table_opportunities');
    this.saveProfile(INITIAL_USER_PROFILE);
    this.saveApplications([]);
  }
}
