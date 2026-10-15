import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { ScholarHubDatabase } from '../data/database';

export interface AuthSessionState {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
  } | null;
}

const AUTH_STORAGE_KEY = 'scholarhub_auth_session';

export class AuthService {
  /**
   * Get cached session from localStorage for immediate load without layout shift
   */
  static getStoredSession(): AuthSessionState {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.isAuthenticated === 'boolean') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return {
      isAuthenticated: false,
      isGuest: false,
      user: null,
    };
  }

  /**
   * Save session state locally to keep user logged in across page reloads
   */
  static saveStoredSession(sessionState: AuthSessionState): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionState));
    } catch (e) {
      console.error('Failed to store session in localStorage:', e);
    }
  }

  /**
   * Clear session state locally
   */
  static clearStoredSession(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear stored session:', e);
    }
  }

  /**
   * Check Supabase auth session and sync with local state
   */
  static async checkCurrentSession(): Promise<AuthSessionState> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session?.user) {
        const sbUser = data.session.user;
        const fullName =
          sbUser.user_metadata?.full_name ||
          sbUser.user_metadata?.name ||
          sbUser.email?.split('@')[0] ||
          'Scholar';

        const state: AuthSessionState = {
          isAuthenticated: true,
          isGuest: false,
          user: {
            id: sbUser.id,
            email: sbUser.email || '',
            fullName,
          },
        };
        this.saveStoredSession(state);
        this.syncUserProfileWithAuth(state.user!);
        return state;
      }
    } catch (err) {
      console.warn('Supabase getSession error (falling back to stored session):', err);
    }

    // If Supabase session is not found, check if a valid guest or prior session exists
    const stored = this.getStoredSession();
    return stored;
  }

  /**
   * Listen to Supabase auth state changes
   */
  static onAuthStateChange(callback: (state: AuthSessionState) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sbUser = session.user;
        const fullName =
          sbUser.user_metadata?.full_name ||
          sbUser.user_metadata?.name ||
          sbUser.email?.split('@')[0] ||
          'Scholar';

        const state: AuthSessionState = {
          isAuthenticated: true,
          isGuest: false,
          user: {
            id: sbUser.id,
            email: sbUser.email || '',
            fullName,
          },
        };
        this.saveStoredSession(state);
        this.syncUserProfileWithAuth(state.user!);
        callback(state);
      } else {
        const stored = this.getStoredSession();
        // Only clear if not in guest mode
        if (!stored.isGuest) {
          const cleared: AuthSessionState = {
            isAuthenticated: false,
            isGuest: false,
            user: null,
          };
          this.saveStoredSession(cleared);
          callback(cleared);
        }
      }
    });
  }

  /**
   * Sign In with Email & Password
   */
  static async signIn(email: string, password: string): Promise<AuthSessionState> {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new Error('Please enter both email and password.');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        // If Supabase rejected, throw error to let user know
        throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
      }

      if (data?.user) {
        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          trimmedEmail.split('@')[0] ||
          'Scholar';

        const sessionState: AuthSessionState = {
          isAuthenticated: true,
          isGuest: false,
          user: {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            fullName,
          },
        };

        this.saveStoredSession(sessionState);
        this.syncUserProfileWithAuth(sessionState.user!);
        return sessionState;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed.';
      throw new Error(msg);
    }

    throw new Error('Sign in failed. Please try again.');
  }

  /**
   * Sign Up with Email & Password
   */
  static async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ state: AuthSessionState; confirmationRequired: boolean }> {
    const trimmedEmail = email.trim();
    const cleanName = fullName?.trim() || trimmedEmail.split('@')[0] || 'Scholar';

    if (!trimmedEmail || !password) {
      throw new Error('Please enter both email and password.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to register account.');
      }

      const user = data?.user;
      const isConfirmed = Boolean(data?.session || user?.confirmed_at);

      const sessionState: AuthSessionState = {
        isAuthenticated: true,
        isGuest: false,
        user: {
          id: user?.id || `usr_${Date.now()}`,
          email: trimmedEmail,
          fullName: cleanName,
        },
      };

      this.saveStoredSession(sessionState);
      this.syncUserProfileWithAuth(sessionState.user!);

      return {
        state: sessionState,
        confirmationRequired: !isConfirmed && !data?.session,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      throw new Error(msg);
    }
  }

  /**
   * Continue as Guest / Quick Demo Entry
   */
  static signInAsGuest(): AuthSessionState {
    const guestUser = {
      id: `guest_${Date.now()}`,
      email: 'guest@scholarhub.app',
      fullName: 'Guest Scholar',
    };

    const sessionState: AuthSessionState = {
      isAuthenticated: true,
      isGuest: true,
      user: guestUser,
    };

    this.saveStoredSession(sessionState);
    this.syncUserProfileWithAuth(guestUser, true);
    return sessionState;
  }

  /**
   * Sign Out
   */
  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    } finally {
      this.clearStoredSession();
    }
  }

  /**
   * Synchronize active auth user info into local user profile
   */
  private static syncUserProfileWithAuth(
    user: { id: string; email: string; fullName: string },
    isGuest: boolean = false
  ): void {
    try {
      const currentProfile = ScholarHubDatabase.getProfile();
      const updated: UserProfile = {
        ...currentProfile,
        userId: user.id,
        email: user.email,
        fullName: currentProfile.fullName && currentProfile.fullName !== 'Guest Scholar'
          ? currentProfile.fullName
          : user.fullName,
        isConfigured: currentProfile.isConfigured || false,
      };
      if (isGuest && !currentProfile.isConfigured) {
        updated.fullName = 'Guest Scholar';
      }
      ScholarHubDatabase.saveProfile(updated);
    } catch (e) {
      console.error('Error syncing profile with auth:', e);
    }
  }
}
