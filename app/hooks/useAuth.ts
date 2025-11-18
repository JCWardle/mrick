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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
      }));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
      }));

      // Load profile when session changes
      if (session) {
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
            // If table doesn't exist, set profile to null and let user know
            if (error?.code === 'PGRST205') {
              console.warn('Profiles table not found. Please run database migrations.');
            }
          });
      } else {
        setState((prev) => ({
          ...prev,
          profile: null,
          isProfileComplete: false,
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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

  return {
    ...state,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    loginWithApple,
    logout,
    refreshProfile,
  };
}
