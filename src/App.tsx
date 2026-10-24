import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { ExploreView } from './components/ExploreView';
import { TrackerView } from './components/TrackerView';
import { ProfileView } from './components/ProfileView';
import { ApplyModal } from './components/ApplyModal';
import { MatchBreakdownModal } from './components/MatchBreakdownModal';
import { ToastProvider, useToast } from './components/Toast';
import { AuthWall } from './components/AuthWall';
import { supabase } from './lib/supabase';
import { AuthService, AuthSessionState } from './services/authService';
import { ProfileService, DEFAULT_EMPTY_PROFILE } from './services/profileService';
import { fetchOpportunitiesFromSupabase } from './services/opportunitiesService';
import {
  fetchSavedOpportunitiesFromSupabase,
  saveOpportunityToSupabase,
  removeOpportunityFromSupabase,
  updateOpportunityStatusInSupabase,
} from './services/savedOpportunitiesService';
import {
  UserProfile,
  Opportunity,
  SavedApplication,
  ApplicationStatus,
} from './types';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';

function ScholarHubContent() {
  const { showToast } = useToast();
  const [, startTransition] = useTransition();

  // Persistent Auth Session State
  const [authSession, setAuthSession] = useState<AuthSessionState>(() =>
    AuthService.getStoredSession()
  );

  // Live Supabase Database state: Profile & Saved Applications
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_EMPTY_PROFILE);
  const [savedApplications, setSavedApplications] = useState<SavedApplication[]>([]);

  // Dynamic opportunities fetched exclusively from Supabase
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState<boolean>(true);
  const [opportunityError, setOpportunityError] = useState<string | null>(null);

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<NavTab>('explore');

  // Modal active states
  const [applyModalOpp, setApplyModalOpp] = useState<Opportunity | null>(null);
  const [matchModalOpp, setMatchModalOpp] = useState<Opportunity | null>(null);

  // Fetch opportunities dynamically and exclusively from Supabase
  const loadOpportunities = useCallback(async () => {
    setIsLoadingOpportunities(true);
    setOpportunityError(null);
    try {
      const data = await fetchOpportunitiesFromSupabase();
      setOpportunities(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch opportunities from Supabase';
      console.error('Error fetching opportunities from Supabase:', message);
      setOpportunityError(message);
    } finally {
      setIsLoadingOpportunities(false);
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  // Load live user data (profile & saved opportunities) directly from Supabase
  const loadUserDataFromSupabase = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const [liveProfile, liveSaved] = await Promise.all([
        ProfileService.fetchUserProfile(userId),
        fetchSavedOpportunitiesFromSupabase(userId),
      ]);

      if (liveProfile) {
        setProfile(liveProfile);
      }
      if (Array.isArray(liveSaved)) {
        setSavedApplications(liveSaved);
      }
    } catch (err) {
      console.warn('Error loading user data from Supabase:', err);
    }
  }, []);

  // Synchronize session on mount & subscribe to Supabase Auth state changes
  useEffect(() => {
    let isMounted = true;

    // 1. Initial check on mount
    AuthService.checkCurrentSession().then(async (session) => {
      if (!isMounted) return;
      setAuthSession(session);
      if (session.isAuthenticated && session.user?.id) {
        await loadUserDataFromSupabase(session.user.id);
      } else if (session.isGuest) {
        setProfile({
          ...DEFAULT_EMPTY_PROFILE,
          userId: 'guest_user',
          fullName: 'Guest Scholar',
        });
      }
    });

    // 2. Real-time auth state subscription (signs in, signs out, or registers)
    const { data: authListener } = AuthService.onAuthStateChange(async (state) => {
      if (!isMounted) return;
      setAuthSession(state);

      if (state.isAuthenticated && state.user?.id) {
        await loadUserDataFromSupabase(state.user.id);
      } else if (!state.isAuthenticated && !state.isGuest) {
        // Immediate clean reset on sign-out
        setProfile(DEFAULT_EMPTY_PROFILE);
        setSavedApplications([]);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, [loadUserDataFromSupabase]);

  const handleSignOut = async () => {
    await AuthService.signOut();
    setAuthSession({ isAuthenticated: false, isGuest: false, user: null });
    setProfile(DEFAULT_EMPTY_PROFILE);
    setSavedApplications([]);
    showToast('Signed Out', 'You have been safely signed out. Session and records cleared.', 'info');
  };

  // Quick lookup set of tracked opportunity IDs
  const trackedOppIdSet = useMemo(() => {
    return new Set(savedApplications.map((app) => app.opportunityId));
  }, [savedApplications]);

  // Tab change with smooth transition
  const handleTabChange = (tab: NavTab) => {
    startTransition(() => {
      setCurrentTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // Toggle Save/Bookmark from Explore Card (executes actual Supabase mutation on saved_applications table)
  const handleToggleSave = async (opportunityId: string) => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    const title = opp ? opp.title : 'Opportunity';

    // 1. Resolve live authenticated Supabase user
    let currentUser: { id: string; email?: string } | null = null;
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.warn('[handleToggleSave] getUser() check:', authError.message);
      }
      if (authData?.user) {
        currentUser = authData.user;
      } else {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('[handleToggleSave] getSession() check:', sessionError.message);
        }
        if (sessionData?.session?.user) {
          currentUser = sessionData.session.user;
        }
      }
    } catch (err) {
      console.warn('[handleToggleSave] Error verifying Supabase auth session:', err);
    }

    // Fallback: If authSession state has a valid UUID user
    if (!currentUser && authSession.user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authSession.user.id)) {
      currentUser = { id: authSession.user.id, email: authSession.user.email };
    }

    // If user is not authenticated with Supabase, prompt login
    if (!currentUser) {
      console.warn('[handleToggleSave] Action blocked: User is not authenticated in Supabase.');
      showToast(
        'Sign In Required',
        'Please sign in or create an account to bookmark scholarships.',
        'warning'
      );
      setAuthSession({ isAuthenticated: false, isGuest: false, user: null });
      return;
    }

    const isCurrentlySaved = trackedOppIdSet.has(opportunityId);

    if (isCurrentlySaved) {
      // 2. Execute actual Supabase DELETE mutation
      console.log(`[handleToggleSave] Executing DELETE on saved_applications (user_id: ${currentUser.id}, opportunity_id: ${opportunityId})`);
      const removeResult = await removeOpportunityFromSupabase(currentUser.id, opportunityId);

      // Check for Supabase errors and log them explicitly
      if (!removeResult.success) {
        console.error('[handleToggleSave] Supabase DELETE error on saved_applications:', removeResult.error);
        showToast(
          'Unable to Remove Bookmark',
          removeResult.error || 'Failed to remove scholarship from saved list.',
          'error'
        );
        return;
      }

      // 3. Fetch live records from saved_applications so the counter matches live rows
      const liveSaved = await fetchSavedOpportunitiesFromSupabase(currentUser.id);
      setSavedApplications(liveSaved);
      showToast('Removed from Tracker', `Removed "${title}" from your saved scholarships (${liveSaved.length} saved).`, 'info');
    } else {
      // 2. Execute actual Supabase INSERT mutation using schema columns (user_id, opportunity_id)
      console.log(`[handleToggleSave] Executing INSERT on saved_applications (user_id: ${currentUser.id}, opportunity_id: ${opportunityId})`);
      const saveResult = await saveOpportunityToSupabase(currentUser.id, opportunityId);

      // Check for Supabase errors and log them explicitly
      if (!saveResult.success) {
        console.error('[handleToggleSave] Supabase INSERT error on saved_applications:', saveResult.error);
        showToast(
          'Unable to Save Bookmark',
          saveResult.error || 'Failed to save scholarship. Please try again.',
          'error'
        );
        return;
      }

      // 3. Fetch live records from saved_applications so the counter matches live rows
      const liveSaved = await fetchSavedOpportunitiesFromSupabase(currentUser.id);
      setSavedApplications(liveSaved);
      showToast(
        'Saved to Tracker',
        `Added "${title}" to your saved scholarships (${liveSaved.length} total saved).`,
        'success'
      );
    }
  };

  // Direct Apply modal tracking action (executes actual Supabase mutation on saved_applications)
  const handleTrackApplication = async (opportunityId: string, _status: 'In Progress') => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    const title = opp ? opp.title : 'Opportunity';

    let currentUser: { id: string; email?: string } | null = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        currentUser = authData.user;
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          currentUser = sessionData.session.user;
        }
      }
    } catch (e) {
      console.warn('[handleTrackApplication] Session lookup error:', e);
    }

    if (!currentUser && authSession.user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authSession.user.id)) {
      currentUser = { id: authSession.user.id, email: authSession.user.email };
    }

    if (!currentUser) {
      console.warn('[handleTrackApplication] User not authenticated in Supabase.');
      showToast('Sign In Required', 'Please sign in or create an account to track applications.', 'warning');
      setAuthSession({ isAuthenticated: false, isGuest: false, user: null });
      return;
    }

    const saveResult = await saveOpportunityToSupabase(currentUser.id, opportunityId);
    if (!saveResult.success) {
      console.error('[handleTrackApplication] Supabase tracking save failed:', saveResult.error);
      showToast('Unable to Track', saveResult.error || 'Failed to add application to tracker.', 'error');
      return;
    }

    const liveSaved = await fetchSavedOpportunitiesFromSupabase(currentUser.id);
    setSavedApplications(liveSaved);
    showToast(
      'Added to Tracker',
      `"${title}" is now active in your application tracker (${liveSaved.length} total saved).`,
      'success'
    );
  };

  // Tracker status change (persists to Supabase public.saved_applications)
  const handleUpdateStatus = async (appId: string, status: ApplicationStatus) => {
    const app = savedApplications.find((a) => a.id === appId);
    if (!app) return;
    const userId = authSession.user?.id;

    setSavedApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status,
              progress: status === 'Submitted' ? 100 : status === 'In Progress' ? Math.max(a.progress, 33) : a.progress,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
    showToast(
      'Application Status Updated',
      `Moved to "${status}" column in your Tracker.`,
      'success'
    );

    if (userId) {
      await updateOpportunityStatusInSupabase(userId, app.opportunityId, status, app.notes);
      const refreshed = await fetchSavedOpportunitiesFromSupabase(userId);
      setSavedApplications(refreshed);
    }
  };

  // Tracker progress slider change
  const handleUpdateProgress = async (appId: string, progress: number) => {
    const app = savedApplications.find((a) => a.id === appId);
    if (!app) return;
    const userId = authSession.user?.id;

    let derivedStatus = app.status;
    if (progress === 100) derivedStatus = 'Submitted';
    else if (progress > 0 && derivedStatus === 'Saved') derivedStatus = 'In Progress';
    else if (progress === 0 && derivedStatus === 'In Progress') derivedStatus = 'Saved';

    setSavedApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              progress,
              status: derivedStatus,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );

    if (progress === 100) {
      showToast('Application Complete!', '100% progress achieved. Marked as Submitted.', 'success');
    }

    if (userId) {
      await updateOpportunityStatusInSupabase(userId, app.opportunityId, derivedStatus, app.notes);
    }
  };

  // Step checklist toggle
  const handleToggleStep = (appId: string, stepId: string) => {
    setSavedApplications((prev) =>
      prev.map((a) => {
        if (a.id !== appId) return a;
        const updatedSteps = a.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s));
        const completedCount = updatedSteps.filter((s) => s.done).length;
        const progressPercent = Math.round((completedCount / updatedSteps.length) * 100);
        let status = a.status;
        if (progressPercent === 100) status = 'Submitted';
        else if (progressPercent > 0 && status === 'Saved') status = 'In Progress';

        return {
          ...a,
          steps: updatedSteps,
          progress: progressPercent,
          status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Notes update (persists to Supabase public.saved_applications)
  const handleUpdateNotes = async (appId: string, notes: string) => {
    const app = savedApplications.find((a) => a.id === appId);
    if (!app) return;
    const userId = authSession.user?.id;

    setSavedApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, notes, updatedAt: new Date().toISOString() } : a))
    );
    showToast('Notes Saved', 'Personal application notes updated successfully.', 'info');

    if (userId) {
      await updateOpportunityStatusInSupabase(userId, app.opportunityId, app.status, notes);
    }
  };

  // Tracker delete (executes actual Supabase DELETE on saved_applications)
  const handleRemoveApplication = async (appId: string) => {
    const app = savedApplications.find((a) => a.id === appId);
    if (!app) return;

    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    if (!currentUser) return;

    console.log(`[handleRemoveApplication] Executing DELETE on saved_applications (user_id: ${currentUser.id}, opportunity_id: ${app.opportunityId})`);
    const removeResult = await removeOpportunityFromSupabase(currentUser.id, app.opportunityId);

    if (!removeResult.success) {
      console.error('[handleRemoveApplication] Supabase DELETE error:', removeResult.error);
      showToast('Failed to Remove', removeResult.error || 'Database delete failed.', 'error');
      return;
    }

    const liveSaved = await fetchSavedOpportunitiesFromSupabase(currentUser.id);
    setSavedApplications(liveSaved);
    showToast('Application Removed', 'Opportunity removed from your saved tracker.', 'info');
  };

  // Profile save: Persists directly into live Supabase public.profiles table using supabase.auth.getUser()
  const handleSaveProfile = async (newProfile: UserProfile) => {
    const configured: UserProfile = { ...newProfile, isConfigured: true };

    const saveResult = await ProfileService.saveUserProfile(configured);
    if (saveResult.success && saveResult.data) {
      setProfile(saveResult.data);
      showToast(
        'Profile Saved',
        `Preferences updated. Scholarship matches rescored for your ${saveResult.data.major || 'selected'} field.`,
        'success'
      );
    } else {
      setProfile(configured);
      showToast(
        saveResult.error ? 'Saved with Warning' : 'Profile Updated',
        saveResult.error || 'Profile preferences updated.',
        saveResult.error ? 'info' : 'success'
      );
    }
  };

  // Reset database: re-queries live Supabase opportunities and user profile
  const handleResetDatabase = async () => {
    await loadOpportunities();
    if (authSession.isAuthenticated && authSession.user?.id) {
      await loadUserDataFromSupabase(authSession.user.id);
    }
    showToast(
      'Listings Refreshed',
      'Latest scholarship opportunities and saved tracker items have been refreshed.',
      'info'
    );
  };

  const isOnline = useNetworkStatus();

  // Authentication Wall: If user is not authenticated, show modern Sign-Up / Login Wall
  if (!authSession.isAuthenticated) {
    return (
      <AuthWall
        onAuthenticated={async (newSession) => {
          setAuthSession(newSession);
          if (newSession.isAuthenticated && newSession.user?.id) {
            await loadUserDataFromSupabase(newSession.user.id);
          } else if (newSession.isGuest) {
            setProfile({
              ...DEFAULT_EMPTY_PROFILE,
              userId: 'guest_user',
              fullName: 'Guest Scholar',
            });
          }
          showToast(
            newSession.isGuest ? 'Welcome to ScholarHub' : 'Welcome back!',
            newSession.isGuest
              ? 'Entered preview mode. Complete your profile preferences to unlock personalized match scores.'
              : 'Signed in successfully. Your saved scholarships and profile preferences are ready.',
            'success'
          );
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Offline Connectivity Notification Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-xs z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>You are currently offline. Cached opportunities and saved tracker items are fully available!</span>
        </div>
      )}

      {/* Navigation Header & Mobile Bottom Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        savedCount={savedApplications.length}
        profile={profile}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 max-w-6xl w-full mx-auto pb-12 transition-all ${
          currentTab === 'explore' ? 'px-0 pt-0' : 'px-4 sm:px-6 py-6'
        }`}
      >
        {currentTab === 'explore' && (
          <ExploreView
            opportunities={opportunities}
            isLoading={isLoadingOpportunities}
            error={opportunityError}
            onRetry={loadOpportunities}
            profile={profile}
            savedApplications={savedApplications}
            onToggleSave={handleToggleSave}
            onApplyClick={(opp) => setApplyModalOpp(opp)}
            onMatchClick={(opp) => setMatchModalOpp(opp)}
            onGoToProfile={() => handleTabChange('profile')}
          />
        )}

        {currentTab === 'tracker' && (
          <TrackerView
            applications={savedApplications}
            opportunities={opportunities}
            profile={profile}
            onUpdateStatus={handleUpdateStatus}
            onUpdateProgress={handleUpdateProgress}
            onToggleStep={handleToggleStep}
            onUpdateNotes={handleUpdateNotes}
            onRemoveApplication={handleRemoveApplication}
            onApplyClick={(opp) => setApplyModalOpp(opp)}
            onGoToExplore={() => handleTabChange('explore')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={profile}
            opportunities={opportunities}
            onSaveProfile={handleSaveProfile}
            onResetDatabase={handleResetDatabase}
            onGoToExplore={() => handleTabChange('explore')}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Modals */}
      <ApplyModal
        opportunity={applyModalOpp}
        profile={profile}
        isAlreadyTracked={applyModalOpp ? trackedOppIdSet.has(applyModalOpp.id) : false}
        onClose={() => setApplyModalOpp(null)}
        onTrackApplication={handleTrackApplication}
      />

      <MatchBreakdownModal
        opportunity={matchModalOpp}
        profile={profile}
        onClose={() => setMatchModalOpp(null)}
        onGoToProfile={() => handleTabChange('profile')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ScholarHubContent />
    </ToastProvider>
  );
}
