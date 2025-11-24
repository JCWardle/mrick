import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getProfile, isProfileComplete, Profile } from '../lib/profiles';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Complete web browser auth session for OAuth
WebBrowser.maybeCompleteAuthSession();

type AuthState = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  profile: Profile | null;
  isLoading: boolean;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isProfileComplete: false,
    profile: null,
    isLoading: true,
  });

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // Validate session by checking if user is still valid
      if (session) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // If getUser fails or returns no user, session is invalid - clear it
        if (userError || !user) {
          console.log('[useAuth] Session invalid, clearing:', {
            userError: userError?.message,
            hasUser: !!user,
          });
          // Clear local session storage without calling signOut (which would fail)
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            // Ignore signOut errors - we're clearing state anyway
            console.log('[useAuth] signOut failed (expected for invalid session):', signOutError);
          }
          setState((prev) => ({
            ...prev,
            session: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          }));
          return;
        }
        
        // Session is valid, load profile
        try {
          const profile = await getProfile();
          const profileComplete = isProfileComplete(profile);
          console.log('[useAuth] Initial session - Profile loaded:', {
            hasProfile: !!profile,
            profileComplete,
            profileData: profile ? {
              age_range: profile.age_range,
              gender: profile.gender,
              sexual_preference: profile.sexual_preference,
              relationship_status: profile.relationship_status,
            } : null,
          });
          setState((prev) => ({
            ...prev,
            session,
            user: user,
            isAuthenticated: true,
            profile,
            isProfileComplete: profileComplete,
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Error loading profile:', error);
          // If table doesn't exist, set profile to null and let user know
          if (error?.code === 'PGRST205') {
            console.warn('Profiles table not found. Please run database migrations.');
          }
          setState((prev) => ({
            ...prev,
            session,
            user: user,
            isAuthenticated: true,
            isLoading: false,
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          session: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Validate session if it exists
      if (session) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // If getUser fails or returns no user, session is invalid - clear it
        if (userError || !user) {
          console.log('[useAuth] Auth state changed - Session invalid, clearing:', {
            userError: userError?.message,
            hasUser: !!user,
          });
          // Clear local session storage without calling signOut (which would fail)
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            // Ignore signOut errors - we're clearing state anyway
            console.log('[useAuth] signOut failed (expected for invalid session):', signOutError);
          }
          setState((prev) => ({
            ...prev,
            session: null,
            user: null,
            isAuthenticated: false,
            profile: null,
            isProfileComplete: false,
            isLoading: false,
          }));
          return;
        }
        
        // Session is valid, load profile
        setState((prev) => ({
          ...prev,
          session,
          user: user,
          isAuthenticated: true,
          isLoading: true, // Set loading to true while we fetch the profile
        }));

        try {
          const profile = await getProfile();
          const profileComplete = isProfileComplete(profile);
          console.log('[useAuth] Auth state changed - Profile loaded:', {
            hasProfile: !!profile,
            profileComplete,
            profileData: profile ? {
              age_range: profile.age_range,
              gender: profile.gender,
              sexual_preference: profile.sexual_preference,
              relationship_status: profile.relationship_status,
            } : null,
          });
          setState((prev) => ({
            ...prev,
            profile,
            isProfileComplete: profileComplete,
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Error loading profile:', error);
          // If table doesn't exist, set profile to null and let user know
          if (error?.code === 'PGRST205') {
            console.warn('Profiles table not found. Please run database migrations.');
          }
          setState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } else {
        setState((prev) => ({
          ...prev,
          session: null,
          user: null,
          isAuthenticated: false,
          profile: null,
          isProfileComplete: false,
          isLoading: false,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load profile when user changes
  useEffect(() => {
    if (state.user && !state.profile) {
      getProfile()
        .then((profile) => {
          setState((prev) => ({
            ...prev,
            profile,
            isProfileComplete: isProfileComplete(profile),
          }));
        })
        .catch((error: any) => {
          console.error('Error loading profile:', error);
        });
    }
  }, [state.user]);

  const loginWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const loginWithGoogle = async () => {
    // For Google OAuth, we need to configure the redirect URL
    // This is a simplified version - you may need to adjust based on your setup
    const redirectTo = AuthSession.makeRedirectUri({
      scheme: 'mrick',
      path: 'auth/callback',
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) throw error;
    return data;
  };

  const loginWithApple = async () => {
    // For Apple OAuth, we need to configure the redirect URL
    // This works on both iOS and Android via OAuth flow
    const redirectTo = AuthSession.makeRedirectUri({
      scheme: 'mrick',
      path: 'auth/callback',
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo,
      },
    });

    if (error) throw error;
    return data;
  };

  const logout = async () => {
    // Try to sign out, but always clear local state even if it fails
    // (e.g., if session is already invalid/expired)
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Error during signOut (clearing local state anyway):', error);
      }
    } catch (error) {
      // Handle cases where signOut fails with JSON parse errors or other issues
      console.warn('SignOut failed (clearing local state anyway):', error);
    }
    
    // Always clear local state regardless of signOut success/failure
    setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isProfileComplete: false,
      profile: null,
      isLoading: false,
    });
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    try {
      const profile = await getProfile();
      setState((prev) => ({
        ...prev,
        profile,
        isProfileComplete: isProfileComplete(profile),
      }));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const deleteAccount = async () => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    // Call RPC function to delete the user account
    // The function uses SECURITY DEFINER to delete from auth.users
    // which will cascade delete the profile due to ON DELETE CASCADE
    const { error } = await supabase.rpc('delete_user_account');

    if (error) {
      throw error;
    }

    // Sign out the user after successful deletion
    await supabase.auth.signOut();

    // Clear auth state after successful deletion
    setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isProfileComplete: false,
      profile: null,
      isLoading: false,
    });
  };

  return {
    ...state,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    loginWithApple,
    logout,
    refreshProfile,
    deleteAccount,
  };
}
