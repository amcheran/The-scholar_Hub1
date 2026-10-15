import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { ExploreView } from './components/ExploreView';
import { TrackerView } from './components/TrackerView';
import { ProfileView } from './components/ProfileView';
import { ApplyModal } from './components/ApplyModal';
import { MatchBreakdownModal } from './components/MatchBreakdownModal';
import { ToastProvider, useToast } from './components/Toast';
import { ScholarHubDatabase } from './data/database';
import { fetchOpportunitiesFromSupabase } from './services/opportunitiesService';
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

  // Toggle Save/Bookmark from Explore Card
  const handleToggleSave = (opportunityId: string) => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    const title = opp ? opp.title : 'Opportunity';

    if (trackedOppIdSet.has(opportunityId)) {
      ScholarHubDatabase.removeByOpportunityId(opportunityId);
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
      showToast('Removed from Tracker', `Removed "${title}" from your applications.`, 'info');
    } else {
      ScholarHubDatabase.addOrSaveApplication(opportunityId, 'Saved');
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
      showToast(
        'Saved to Application Tracker',
        `Added "${title}" under your Saved tab.`,
        'success'
      );
    }
  };

  // Direct Apply modal tracking action
  const handleTrackApplication = (opportunityId: string, status: 'In Progress') => {
    const opp = opportunities.find((o) => o.id === opportunityId);
    const title = opp ? opp.title : 'Opportunity';

    ScholarHubDatabase.addOrSaveApplication(opportunityId, status);
    setSavedApplications(ScholarHubDatabase.getSavedApplications());
    showToast(
      'Added to In-Progress Pipeline',
      `"${title}" is now active in your Tracker with initial checklist.`,
      'success'
    );
  };

  // Tracker status dropdown change
  const handleUpdateStatus = (appId: string, status: ApplicationStatus) => {
    const updated = ScholarHubDatabase.updateApplicationStatus(appId, status);
    if (updated) {
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
      showToast(
        'Application Status Updated',
        `Moved to "${status}" column in your Tracker.`,
        'success'
      );
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
  const handleUpdateNotes = (appId: string, notes: string) => {
    const updated = ScholarHubDatabase.updateNotes(appId, notes);
    if (updated) {
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
      showToast('Notes Saved', 'Personal application notes updated successfully.', 'info');
    }
  };

  // Tracker delete
  const handleRemoveApplication = (appId: string) => {
    const removed = ScholarHubDatabase.removeApplication(appId);
    if (removed) {
      setSavedApplications(ScholarHubDatabase.getSavedApplications());
      showToast('Application Removed', 'Item removed from your tracker.', 'info');
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
