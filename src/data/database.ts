import { SavedApplication, UserProfile, ApplicationStatus } from '../types';
import { ProfileService, DEFAULT_EMPTY_PROFILE } from '../services/profileService';
import {
  fetchSavedOpportunitiesFromSupabase,
  saveOpportunityToSupabase,
  removeOpportunityFromSupabase,
  updateOpportunityStatusInSupabase,
} from '../services/savedOpportunitiesService';

/**
 * ScholarHubDatabase Bridge
 * All data persistence operations interact directly with live Supabase database tables:
 * - User Profiles -> live Supabase `public.profiles` table
 * - Saved Scholarships & Applications -> live Supabase `public.saved_applications` table
 */
export class ScholarHubDatabase {
  static async getProfile(userId?: string): Promise<UserProfile> {
    const live = await ProfileService.fetchUserProfile(userId);
    return live || DEFAULT_EMPTY_PROFILE;
  }

  static async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const result = await ProfileService.saveUserProfile(profile);
    return result.data || profile;
  }

  static async getSavedApplications(userId?: string): Promise<SavedApplication[]> {
    return fetchSavedOpportunitiesFromSupabase(userId);
  }

  static async addOrSaveApplication(
    opportunityId: string,
    initialStatus: ApplicationStatus = 'Saved',
    userId?: string
  ): Promise<void> {
    await saveOpportunityToSupabase(userId, opportunityId, initialStatus);
  }

  static async updateApplicationStatus(
    appId: string,
    status: ApplicationStatus,
    opportunityId?: string,
    userId?: string
  ): Promise<void> {
    if (opportunityId) {
      await updateOpportunityStatusInSupabase(userId, opportunityId, status);
    }
  }

  static async removeByOpportunityId(opportunityId: string, userId?: string): Promise<void> {
    await removeOpportunityFromSupabase(userId, opportunityId);
  }
}
