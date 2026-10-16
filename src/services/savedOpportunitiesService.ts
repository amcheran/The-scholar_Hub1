import { supabase } from '../lib/supabase';
import { SavedApplication, ApplicationStatus } from '../types';

/**
 * Candidates for saved opportunities table in Supabase.
 * Checks requested 'saved_opportunities' and 'user_bookmarks', with verified fallback to 'saved_applications'.
 */
const TABLE_CANDIDATES = ['saved_opportunities', 'user_bookmarks', 'saved_applications'] as const;
type TableCandidate = (typeof TABLE_CANDIDATES)[number];

let activeTableName: TableCandidate | null = null;

async function getActiveTable(): Promise<TableCandidate> {
  if (activeTableName) return activeTableName;

  for (const tableName of TABLE_CANDIDATES) {
    try {
      const { error } = await supabase.from(tableName).select('opportunity_id').limit(1);
      // If table exists (error is null, or RLS permission error like 42501, but not table missing PGRST205)
      if (!error || error.code === '42501' || !error.message?.includes('Could not find')) {
        activeTableName = tableName;
        return tableName;
      }
    } catch {
      // continue to next candidate
    }
  }

  // Default to saved_applications as verified in Supabase
  activeTableName = 'saved_applications';
  return activeTableName;
}

export interface SupabaseSavedRow {
  id?: string;
  user_id: string;
  opportunity_id: string;
  status?: string;
  notes?: string | null;
  updated_at?: string;
  created_at?: string;
}

/**
 * Fetch saved opportunities / bookmarks for an authenticated user from Supabase.
 */
export async function fetchSavedOpportunitiesFromSupabase(
  userId: string
): Promise<SavedApplication[]> {
  if (!userId) return [];

  try {
    const table = await getActiveTable();
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn(`Supabase fetch from ${table} returned:`, error.message);
      return [];
    }

    if (!Array.isArray(data)) return [];

    const defaultSteps = [
      { id: 'step_1', label: 'Verify minimum GPA & eligibility requirements', done: true },
      { id: 'step_2', label: 'Prepare required documents (Transcripts/Certificates)', done: false },
      { id: 'step_3', label: 'Complete written application and declarations', done: false },
      { id: 'step_4', label: 'Final review and application submission', done: false },
    ];

    return data.map((row: SupabaseSavedRow): SavedApplication => {
      const rawStatus = row.status || 'Saved';
      const status: ApplicationStatus =
        rawStatus === 'Submitted'
          ? 'Submitted'
          : rawStatus === 'In Progress'
          ? 'In Progress'
          : 'Saved';

      const progress = status === 'Submitted' ? 100 : status === 'In Progress' ? 33 : 0;
      const steps = defaultSteps.map((st) => ({
        ...st,
        done: status === 'Submitted' ? true : st.id === 'step_1' ? true : false,
      }));

      return {
        id: row.id || `app_sb_${row.opportunity_id}`,
        userId: row.user_id,
        opportunityId: row.opportunity_id,
        status,
        progress,
        savedAt: row.created_at || row.updated_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
        notes: row.notes || '',
        steps,
      };
    });
  } catch (err) {
    console.warn('Error fetching saved opportunities from Supabase:', err);
    return [];
  }
}

/**
 * Save / Bookmark an opportunity in Supabase for the authenticated user.
 */
export async function saveOpportunityToSupabase(
  userId: string,
  opportunityId: string,
  status: ApplicationStatus = 'Saved',
  notes = ''
): Promise<{ success: boolean; error?: string }> {
  if (!userId || !opportunityId) {
    return { success: false, error: 'User ID and Opportunity ID are required.' };
  }

  try {
    const table = await getActiveTable();
    const now = new Date().toISOString();

    // Check if row already exists
    const { data: existing } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    if (existing && existing.id) {
      // Update existing record
      const { error: updateError } = await supabase
        .from(table)
        .update({
          status,
          notes,
          updated_at: now,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.warn(`Supabase update in ${table} failed:`, updateError.message);
        return { success: false, error: updateError.message };
      }
      return { success: true };
    }

    // Insert new bookmark record
    const payload: SupabaseSavedRow = {
      user_id: userId,
      opportunity_id: opportunityId,
      status,
      notes,
      updated_at: now,
    };

    const { error: insertError } = await supabase.from(table).insert([payload]);

    if (insertError) {
      console.warn(`Supabase insert into ${table} failed:`, insertError.message);
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save to Supabase';
    console.warn('saveOpportunityToSupabase exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Remove / Delete a saved opportunity / bookmark from Supabase.
 */
export async function removeOpportunityFromSupabase(
  userId: string,
  opportunityId: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId || !opportunityId) {
    return { success: false, error: 'User ID and Opportunity ID are required.' };
  }

  try {
    const table = await getActiveTable();
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId);

    if (error) {
      console.warn(`Supabase delete from ${table} failed:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove from Supabase';
    console.warn('removeOpportunityFromSupabase exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Update opportunity status (e.g. from Tracker) in Supabase.
 */
export async function updateOpportunityStatusInSupabase(
  userId: string,
  opportunityId: string,
  status: ApplicationStatus,
  notes?: string
): Promise<boolean> {
  if (!userId || !opportunityId) return false;

  try {
    const table = await getActiveTable();
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (typeof notes === 'string') {
      updates.notes = notes;
    }

    const { error } = await supabase
      .from(table)
      .update(updates)
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId);

    if (error) {
      console.warn(`Supabase status update error:`, error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
