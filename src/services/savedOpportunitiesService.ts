import { supabase } from '../lib/supabase';
import { SavedApplication, ApplicationStatus } from '../types';

export interface SupabaseSavedApplicationRow {
  id?: string;
  user_id: string;
  opportunity_id: string;
  status?: string;
  notes?: string | null;
  updated_at?: string;
  created_at?: string;
}

const DEFAULT_APPLICATION_STEPS = [
  { id: 'step_1', label: 'Verify minimum GPA & eligibility requirements', done: true },
  { id: 'step_2', label: 'Prepare required documents (Transcripts/Certificates)', done: false },
  { id: 'step_3', label: 'Complete written application and declarations', done: false },
  { id: 'step_4', label: 'Final review and application submission', done: false },
];

/**
 * Resolve current authenticated user from Supabase Auth
 */
async function getAuthenticatedUser(explicitUserId?: string) {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.warn('supabase.auth.getUser() warning:', error.message);
    }
    if (data?.user) {
      return data.user;
    }
  } catch (err) {
    console.warn('Error resolving authenticated user from Supabase:', err);
  }

  // Fallback: if explicitUserId is provided and looks like a valid UUID
  if (explicitUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(explicitUserId)) {
    return { id: explicitUserId };
  }

  return null;
}

/**
 * Fetch saved opportunities and bookmarks directly from live Supabase `public.saved_applications` table.
 */
export async function fetchSavedOpportunitiesFromSupabase(
  explicitUserId?: string
): Promise<SavedApplication[]> {
  const user = await getAuthenticatedUser(explicitUserId);
  if (!user || !user.id) {
    console.log('[savedOpportunitiesService] No authenticated Supabase user found, returning 0 saved items.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('saved_applications')
      .select('id, user_id, opportunity_id, status, notes, updated_at')
      .eq('user_id', user.id);

    if (error) {
      console.error('[savedOpportunitiesService] Supabase FETCH error from saved_applications:', error);
      console.error('[savedOpportunitiesService] Fetch details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return [];
    }

    if (!Array.isArray(data)) {
      return [];
    }

    console.log(`[savedOpportunitiesService] Successfully fetched ${data.length} live saved application(s) from Supabase for user ${user.id}`);

    return data.map((row: SupabaseSavedApplicationRow): SavedApplication => {
      const rawStatus = row.status || 'Saved';
      const status: ApplicationStatus =
        rawStatus === 'Submitted'
          ? 'Submitted'
          : rawStatus === 'In Progress'
          ? 'In Progress'
          : 'Saved';

      const progress = status === 'Submitted' ? 100 : status === 'In Progress' ? 33 : 0;
      const steps = DEFAULT_APPLICATION_STEPS.map((st) => ({
        ...st,
        done: status === 'Submitted' ? true : st.id === 'step_1' ? true : false,
      }));

      return {
        id: row.id || `app_sb_${row.opportunity_id}`,
        userId: row.user_id,
        opportunityId: row.opportunity_id,
        status,
        progress,
        savedAt: row.updated_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
        notes: row.notes || '',
        steps,
      };
    });
  } catch (err) {
    console.error('[savedOpportunitiesService] Unexpected exception fetching saved opportunities from Supabase:', err);
    return [];
  }
}

/**
 * Save / Bookmark an opportunity directly into Supabase `public.saved_applications` table.
 * Executes actual Supabase INSERT mutation using the schema columns (user_id and opportunity_id).
 */
export async function saveOpportunityToSupabase(
  explicitUserId: string | undefined,
  opportunityId: string,
  _status: ApplicationStatus = 'Saved',
  _notes = ''
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthenticatedUser(explicitUserId);
  if (!user || !user.id) {
    const errMsg = 'Authentication required. Please sign in to save opportunities to the database.';
    console.error('[savedOpportunitiesService] saveOpportunityToSupabase blocked:', errMsg);
    return { success: false, error: errMsg };
  }

  if (!opportunityId) {
    const errMsg = 'Opportunity ID is required to bookmark.';
    console.error('[savedOpportunitiesService] saveOpportunityToSupabase blocked:', errMsg);
    return { success: false, error: errMsg };
  }

  try {
    // Check if record already exists for this user and opportunity
    const { data: existing, error: checkError } = await supabase
      .from('saved_applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    if (checkError) {
      console.warn('[savedOpportunitiesService] Check existing record warning from Supabase:', checkError);
    }

    if (existing && existing.id) {
      console.log(`[savedOpportunitiesService] Opportunity ${opportunityId} is already saved for user ${user.id} in Supabase.`);
      return { success: true };
    }

    // Execute actual Supabase INSERT mutation on saved_applications table using schema columns (user_id and opportunity_id)
    const payload = {
      user_id: user.id,
      opportunity_id: opportunityId,
    };

    console.log('[savedOpportunitiesService] Executing INSERT on saved_applications:', payload);

    const { error: insertError } = await supabase
      .from('saved_applications')
      .insert([payload]);

    if (insertError) {
      console.error('[savedOpportunitiesService] Supabase INSERT on saved_applications failed:', insertError);
      console.error('[savedOpportunitiesService] Insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      return { success: false, error: insertError.message || 'Database insert failed' };
    }

    console.log('[savedOpportunitiesService] Successfully inserted row into saved_applications in Supabase.');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save to Supabase';
    console.error('[savedOpportunitiesService] saveOpportunityToSupabase exception:', err);
    return { success: false, error: message };
  }
}

/**
 * Remove / Delete a saved opportunity bookmark directly from Supabase `public.saved_applications`.
 * Executes actual Supabase DELETE mutation on saved_applications using user_id and opportunity_id.
 */
export async function removeOpportunityFromSupabase(
  explicitUserId: string | undefined,
  opportunityId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getAuthenticatedUser(explicitUserId);
  if (!user || !user.id) {
    const errMsg = 'Authentication required. Please sign in to remove saved opportunities.';
    console.error('[savedOpportunitiesService] removeOpportunityFromSupabase blocked:', errMsg);
    return { success: false, error: errMsg };
  }

  if (!opportunityId) {
    const errMsg = 'Opportunity ID is required to remove bookmark.';
    console.error('[savedOpportunitiesService] removeOpportunityFromSupabase blocked:', errMsg);
    return { success: false, error: errMsg };
  }

  try {
    console.log(`[savedOpportunitiesService] Executing DELETE on saved_applications where user_id=${user.id} and opportunity_id=${opportunityId}`);

    const { error: deleteError } = await supabase
      .from('saved_applications')
      .delete()
      .eq('user_id', user.id)
      .eq('opportunity_id', opportunityId);

    if (deleteError) {
      console.error('[savedOpportunitiesService] Supabase DELETE from saved_applications failed:', deleteError);
      console.error('[savedOpportunitiesService] Delete error details:', {
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
      });
      return { success: false, error: deleteError.message || 'Database delete failed' };
    }

    console.log('[savedOpportunitiesService] Successfully deleted row from saved_applications in Supabase.');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete from Supabase';
    console.error('[savedOpportunitiesService] removeOpportunityFromSupabase exception:', err);
    return { success: false, error: message };
  }
}

/**
 * Update opportunity status directly in Supabase `public.saved_applications`.
 */
export async function updateOpportunityStatusInSupabase(
  explicitUserId: string | undefined,
  opportunityId: string,
  status: ApplicationStatus,
  notes?: string
): Promise<boolean> {
  const user = await getAuthenticatedUser(explicitUserId);
  if (!user || !user.id || !opportunityId) return false;

  try {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (typeof notes === 'string') {
      updates.notes = notes;
    }

    const { error } = await supabase
      .from('saved_applications')
      .update(updates)
      .eq('user_id', user.id)
      .eq('opportunity_id', opportunityId);

    if (error) {
      console.error('[savedOpportunitiesService] Supabase update status failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[savedOpportunitiesService] updateOpportunityStatusInSupabase exception:', err);
    return false;
  }
}
