import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { ExploreView } from './components/ExploreView';
import { TrackerView } from './components/TrackerView';
import { ProfileView } from './components/ProfileView';
import { ApplyModal } from './components/ApplyModal';
import { MatchBreakdownModal } from './components/MatchBreakdownModal';
import { ToastProvider, useToast } from './components/Toast';
import { AuthWall } from './components/AuthWall';
import { AuthService, AuthSessionState } from './services/authService';
import { ScholarHubDatabase } from './data/database';
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

  // Persistent Auth Session State (Auto-Login via Supabase & localStorage)
  const [authSession, setAuthSession] = useState<AuthSessionState>(() =>
    AuthService.getStoredSession()
  );

  // Core reactive database state
  const [profile, setProfile] = useState<UserProfile>(() => ScholarHubDatabase.getProfile());
  const [savedApplications, setSavedApplications] = useState<SavedApplication[]>(() =>
    ScholarHubDatabase.getSavedApplications()
  );

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

  // Synchronize saved opportunities / bookmarks with Supabase for authenticated users
  const syncSavedOpportunities = useCallback(async (userId: string) => {
    try {
      const sbSaved = await fetchSavedOpportunitiesFromSupabase(userId);
      const localSaved = ScholarHubDatabase.getSavedApplications();

      if (sbSaved && sbSaved.length > 0) {
        // Merge Supabase saved opportunities with any local additions
        const sbOppIds = new Set(sbSaved.map((s) => s.opportunityId));
        const unsavedLocal = localSaved.filter((l) => !sbOppIds.has(l.opportunityId));

        // If local has items not yet stored in Supabase, push them up to sync account
        if (unsavedLocal.length > 0) {
          for (const item of unsavedLocal) {
            await saveOpportunityToSupabase(userId, item.opportunityId, item.status, item.notes);
          }
          const refreshed = await fetchSavedOpportunitiesFromSupabase(userId);
          setSavedApplications(refreshed);
          ScholarHubDatabase.saveApplications(refreshed);
          return;
        }

        setSavedApplications(sbSaved);
        ScholarHubDatabase.saveApplications(sbSaved);
      } else if (localSaved.length > 0) {
        // First-time sync: persist existing local bookmarks into Supabase
        for (const item of localSaved) {
          await saveOpportunityToSupabase(userId, item.opportunityId, item.status, item.notes);
        }
        const refreshed = await fetchSavedOpportunitiesFromSupabase(userId);
        if (refreshed.length > 0) {
          setSavedApplications(refreshed);
          ScholarHubDatabase.saveApplications(refreshed);
        }
      }
    } catch (err) {
      console.warn('Failed to sync saved opportunities with Supabase:', err);
    }
  }, []);

  // Synchronize session on mount & subscribe to Supabase Auth state changes
  useEffect(() => {
    let isMounted = true;

    AuthService.checkCurrentSession().then((session) => {
      if (isMounted) {
        setAuthSession(session);
        setProfile(ScholarHubDatabase.getProfile());
        if (session.isAuthenticated && session.user?.id) {
          syncSavedOpportunities(session.user.id);
        }
      }
    });

    const { data: authListener } = AuthService.onAuthStateChange((state) => {
      if (isMounted) {
        setAuthSession(state);
        setProfile(ScholarHubDatabase.getProfile());
        if (state.isAuthenticated && state.user?.id) {
          syncSavedOpportunities(state.user.id);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, [syncSavedOpportunities]);

  const handleSignOut = async () => {
    await AuthService.signOut();
    setAuthSession({ isAuthenticated: false, isGuest: false, user: null });
    setProfile(ScholarHubDatabase.getProfile());
    showToast('Signed Out', 'You have been safely signed out. Sessions are cleared.', 'info');
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

  // Toggle Save/Bookmark from Explore Card (synced with Supabase)
  const handleToggleSave = async (opportunityId: string) => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    const title = opp ? opp.title : 'Opportunity';

    if (trackedOppIdSet.has(opportunityId)) {
      ScholarHubDatabase.removeByOpportunityId(opportunityId);
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
      showToast('Removed from Tracker', `Removed "${title}" from your applications.`, 'info');

      // Persist removal in Supabase if authenticated
      if (authSession.isAuthenticated && authSession.user?.id) {
        await removeOpportunityFromSupabase(authSession.user.id, opportunityId);
      }
    } else {
      ScholarHubDatabase.addOrSaveApplication(opportunityId, 'Saved');
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
      showToast(
        'Saved to Application Tracker',
        `Added "${title}" under your Saved tab.`,
        'success'
      );

      // Persist addition in Supabase if authenticated
      if (authSession.isAuthenticated && authSession.user?.id) {
        await saveOpportunityToSupabase(authSession.user.id, opportunityId, 'Saved');
      }
    }
  };

  // Direct Apply modal tracking action (synced with Supabase)
  const handleTrackApplication = async (opportunityId: string, status: 'In Progress') => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    const title = opp ? opp.title : 'Opportunity';

    ScholarHubDatabase.addOrSaveApplication(opportunityId, status);
    setSavedApplications(ScholarHubDatabase.getSavedApplications());
    showToast(
      'Added to In-Progress Pipeline',
      `"${title}" is now active in your Tracker with initial checklist.`,
      'success'
    );

    if (authSession.isAuthenticated && authSession.user?.id) {
      await saveOpportunityToSupabase(authSession.user.id, opportunityId, status);
    }
  };

  // Tracker status dropdown change (synced with Supabase)
  const handleUpdateStatus = async (appId: string, status: ApplicationStatus) => {
    const updated = ScholarHubDatabase.updateApplicationStatus(appId, status);
    if (updated) {
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
      showToast(
        'Application Status Updated',
        `Moved to "${status}" column in your Tracker.`,
        'success'
      );

      if (authSession.isAuthenticated && authSession.user?.id) {
        await updateOpportunityStatusInSupabase(authSession.user.id, updated.opportunityId, status);
      }
    }
  };

  // Tracker progress slider / buttons change
  const handleUpdateProgress = (appId: string, progress: number) => {
    const updated = ScholarHubDatabase.updateApplicationProgress(appId, progress);
    if (updated) {
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
      if (progress === 100) {
        showToast('Application Complete!', '100% progress achieved. Marked as Submitted.', 'success');
      }
    }
  };

  // Step checklist toggle
  const handleToggleStep = (appId: string, stepId: string) => {
    const updated = ScholarHubDatabase.toggleStep(appId, stepId);
    if (updated) {
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
    }
  };

  // Notes update
  const handleUpdateNotes = async (appId: string, notes: string) => {
    const updated = ScholarHubDatabase.updateNotes(appId, notes);
    if (updated) {
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
      showToast('Notes Saved', 'Personal application notes updated successfully.', 'info');

      if (authSession.isAuthenticated && authSession.user?.id) {
        await updateOpportunityStatusInSupabase(authSession.user.id, updated.opportunityId, updated.status, notes);
      }
    }
  };

  // Tracker delete (synced with Supabase)
  const handleRemoveApplication = async (appId: string) => {
    const app = savedApplications.find((a) => a.id === appId);
    const removed = ScholarHubDatabase.removeApplication(appId);
    if (removed) {
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
      showToast('Application Removed', 'Item removed from your tracker.', 'info');

      if (authSession.isAuthenticated && authSession.user?.id && app) {
        await removeOpportunityFromSupabase(authSession.user.id, app.opportunityId);
      }
    }
  };

  // Profile save & recalculate
  const handleSaveProfile = (newProfile: UserProfile) => {
    const configured: UserProfile = { ...newProfile, isConfigured: true };
    ScholarHubDatabase.saveProfile(configured);
    setProfile(configured);
    showToast(
      'Profile Updated & Match Recalculated',
      `All ${opportunities.length} opportunities rescored for your ${configured.major || 'selected'} degree.`,
      'success'
    );
  };

  // Reset database & re-sync from Supabase
  const handleResetDatabase = async () => {
    ScholarHubDatabase.resetDatabase();
    setProfile(ScholarHubDatabase.getProfile());
    setSavedApplications(ScholarHubDatabase.getSavedApplications());
    await loadOpportunities();
    showToast(
      'Supabase Database Re-synced',
      'Refetched live opportunities dynamically from Supabase.',
      'info'
    );
  };

  const isOnline = useNetworkStatus();

  // Authentication Wall: If user is not authenticated, show modern Sign-Up / Login Wall
  if (!authSession.isAuthenticated) {
    return (
      <AuthWall
        onAuthenticated={(newSession) => {
          setAuthSession(newSession);
          setProfile(ScholarHubDatabase.getProfile());
          if (newSession.isAuthenticated && newSession.user?.id) {
            syncSavedOpportunities(newSession.user.id);
          }
          showToast(
            newSession.isGuest ? 'Welcome to ScholarHub' : 'Welcome back!',
            newSession.isGuest
              ? 'Entered preview mode. Complete your profile preferences to unlock personalized match scores.'
              : 'Signed in successfully. Your session and saved opportunities are permanently synced to your account.',
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 transition-all">
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
