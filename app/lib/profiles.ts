import { supabase } from './supabase';

export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55+' | 'prefer-not-to-say';
export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
export type SexualPreference = 'straight' | 'gay' | 'lesbian' | 'bisexual' | 'pansexual' | 'asexual' | 'prefer-not-to-say';
export type RelationshipStatus = 'single' | 'in-a-relationship' | 'married' | 'divorced' | 'widowed' | 'prefer-not-to-say';

export interface Profile {
  id: string;
  age_range: AgeRange | null;
  gender: Gender | null;
  sexual_preference: SexualPreference | null;
  relationship_status: RelationshipStatus | null;
  partner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  age_range?: AgeRange;
  gender?: Gender;
  sexual_preference?: SexualPreference;
  relationship_status?: RelationshipStatus;
}

/**
 * Create a profile for the current user if it doesn't exist
 */
export async function createProfileIfNeeded(): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Try to get existing profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    return existingProfile;
  }

  // Profile doesn't exist, create it
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({ id: user.id })
    .select()
    .single();

  if (error) {
    // If it's a duplicate key error, try fetching again (race condition)
    if (error.code === '23505') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profile) return profile;
    }
    throw error;
  }

  return newProfile;
}

/**
 * Get the current user's profile
 */
export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile doesn't exist (PGRST116) or table doesn't exist (PGRST205), try to create it
  if (error) {
    if (error.code === 'PGRST116' || error.code === 'PGRST205') {
      // Profile doesn't exist yet, try to create it
      try {
        return await createProfileIfNeeded();
      } catch (createError) {
        // If creation fails, return null (table might not exist)
        console.error('Error creating profile:', createError);
        return null;
      }
    }
    throw error;
  }
  
  return data;
}

/**
 * Update the current user's profile
 */
export async function updateProfile(data: ProfileUpdate): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Ensure profile exists before updating
  await createProfileIfNeeded();

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return profile;
}

/**
 * Check if profile is complete (has age_range, gender, sexual_preference, and relationship_status)
 */
export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  return !!(
    profile.age_range &&
    profile.gender &&
    profile.sexual_preference &&
    profile.relationship_status
  );
}

