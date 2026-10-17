import { supabase } from '../lib/supabase';
import { UserProfile, EducationLevel, FinancialNeedLevel } from '../types';

export interface SupabaseProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  gpa: number | null;
  major: string | null;
  education_level: string | null;
  updated_at: string | null;
}

export const DEFAULT_EMPTY_PROFILE: UserProfile = {
  userId: '',
  fullName: '',
  email: '',
  gpa: 0,
  major: '',
  educationLevel: 'Undergraduate',
  financialNeed: 'Moderate',
  isFirstGen: false,
  citizenship: '',
  targetCountry: '',
  isConfigured: false,
};

export class ProfileService {
  /**
   * Fetches the user profile directly from the live Supabase `public.profiles` table.
   * If the authenticated user does not have a profile row yet, it provisions one.
   */
  static async fetchUserProfile(explicitUserId?: string): Promise<UserProfile | null> {
    try {
      // 1. Resolve authenticated user ID from Supabase Auth
      let userId = explicitUserId;
      let authUserEmail = '';
      let authUserFullName = '';

      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        userId = authData.user.id;
        authUserEmail = authData.user.email || '';
        authUserFullName =
          authData.user.user_metadata?.full_name ||
          authData.user.user_metadata?.name ||
          authData.user.email?.split('@')[0] ||
          'Scholar';
      }

      if (!userId) {
        return null;
      }

      // 2. Query live Supabase `public.profiles` table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile from Supabase:', error.message);
      }

      // 3. If found, return mapped profile
      if (data) {
        const row = data as SupabaseProfileRow;
        return {
          userId: row.id,
          fullName: row.full_name || authUserFullName || 'Scholar',
          email: row.email || authUserEmail,
          gpa: row.gpa != null ? Number(row.gpa) : 0,
          major: row.major || '',
          educationLevel: (row.education_level as EducationLevel) || 'Undergraduate',
          financialNeed: 'Moderate',
          isFirstGen: false,
          citizenship: '',
          targetCountry: '',
          isConfigured: Boolean((row.major && row.major.trim().length > 0) || (row.gpa && Number(row.gpa) > 0)),
        };
      }

      // 4. If row doesn't exist yet, insert initial profile row for this authenticated user
      const initialRow: Partial<SupabaseProfileRow> = {
        id: userId,
        email: authUserEmail,
        full_name: authUserFullName || 'Scholar',
        gpa: 0,
        major: '',
        education_level: 'Undergraduate',
        updated_at: new Date().toISOString(),
      };

      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert([initialRow])
        .select()
        .maybeSingle();

      if (insertError) {
        console.warn('Could not auto-insert initial profile in Supabase:', insertError.message);
      }

      const createdRow = (created as SupabaseProfileRow) || initialRow;
      return {
        userId,
        fullName: createdRow.full_name || authUserFullName || 'Scholar',
        email: createdRow.email || authUserEmail,
        gpa: createdRow.gpa != null ? Number(createdRow.gpa) : 0,
        major: createdRow.major || '',
        educationLevel: (createdRow.education_level as EducationLevel) || 'Undergraduate',
        financialNeed: 'Moderate',
        isFirstGen: false,
        citizenship: '',
        targetCountry: '',
        isConfigured: false,
      };
    } catch (err) {
      console.error('ProfileService.fetchUserProfile exception:', err);
      return null;
    }
  }

  /**
   * Saves or updates the user profile directly in the live Supabase `public.profiles` table.
   */
  static async saveUserProfile(
    profile: UserProfile
  ): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
    try {
      // Resolve user ID directly from supabase.auth.getUser()
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id || profile.userId;

      if (!currentUserId) {
        return { success: false, error: 'User is not authenticated.' };
      }

      const now = new Date().toISOString();
      const payload: SupabaseProfileRow = {
        id: currentUserId,
        email: profile.email || authData?.user?.email || null,
        full_name: profile.fullName || authData?.user?.user_metadata?.full_name || null,
        gpa: typeof profile.gpa === 'number' ? profile.gpa : 0,
        major: profile.major || '',
        education_level: profile.educationLevel || 'Undergraduate',
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload)
        .select()
        .single();

      if (error) {
        console.error('Supabase profile upsert error:', error.message);
        return { success: false, error: error.message };
      }

      const updatedRow = data as SupabaseProfileRow;
      const updatedProfile: UserProfile = {
        userId: updatedRow.id,
        fullName: updatedRow.full_name || profile.fullName,
        email: updatedRow.email || profile.email,
        gpa: updatedRow.gpa != null ? Number(updatedRow.gpa) : profile.gpa,
        major: updatedRow.major || profile.major,
        educationLevel: (updatedRow.education_level as EducationLevel) || profile.educationLevel,
        financialNeed: profile.financialNeed || 'Moderate',
        isFirstGen: profile.isFirstGen || false,
        citizenship: profile.citizenship || '',
        targetCountry: profile.targetCountry || '',
        isConfigured: true,
      };

      return { success: true, data: updatedProfile };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      console.error('ProfileService.saveUserProfile exception:', message);
      return { success: false, error: message };
    }
  }
}
