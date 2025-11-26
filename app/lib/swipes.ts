import { supabase } from './supabase';
import { checkAndNotifyCompletion } from './notifications';

export type SwipeResponse = 'yum' | 'ick' | 'maybe';

export interface Swipe {
  id: string;
  user_id: string;
  card_id: string;
  response: SwipeResponse;
  created_at: string;
  updated_at: string;
  last_event_id: string | null;
}

/**
 * Save a swipe to the database
 * Uses upsert to handle updates if user changes their response
 */
export async function saveSwipe(
  cardId: string,
  response: SwipeResponse
): Promise<Swipe> {
  // Validate inputs
  if (!cardId || typeof cardId !== 'string') {
    throw new Error('Invalid card ID provided');
  }
  
  if (!response || !['yum', 'ick', 'maybe'].includes(response)) {
    throw new Error('Invalid swipe response provided');
  }

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('Auth error in saveSwipe:', authError);
    throw new Error('Authentication error. Please sign in again.');
  }
  
  if (!user) {
    throw new Error('Not authenticated. Please sign in to save swipes.');
  }

  // Log before attempting save
  console.log('[saveSwipe] Attempting to save swipe:', {
    cardId,
    response,
    userId: user.id,
    timestamp: new Date().toISOString(),
  });

  // Attempt to save swipe
  const { data, error } = await supabase
    .from('swipes')
    .upsert(
      {
        user_id: user.id,
        card_id: cardId,
        response,
      },
      {
        onConflict: 'user_id,card_id',
      }
    )
    .select()
    .single();
  
  // Log after attempt
  console.log('[saveSwipe] Save attempt completed:', {
    success: !error,
    hasData: !!data,
    error: error ? {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    } : null,
  });

  if (error) {
    console.error('Database error in saveSwipe:', {
      error,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      cardId,
      response,
    });

    // Handle specific error cases
    if (error.code === 'PGRST301' || error.message?.includes('network') || error.message?.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    if (error.code === '23503') {
      // Foreign key violation - card doesn't exist
      throw new Error('Card not found. Please refresh and try again.');
    }
    
    if (error.code === '23505') {
      // Unique constraint violation (shouldn't happen with upsert, but just in case)
      throw new Error('Swipe already exists. Please refresh and try again.');
    }
    
    if (error.code === 'PGRST116') {
      // No rows returned (shouldn't happen with upsert, but handle it)
      throw new Error('Failed to save swipe. Please try again.');
    }

    // Generic error with more context
    const errorMessage = error.message || 'Failed to save swipe. Please try again.';
    throw new Error(errorMessage);
  }

  if (!data) {
    throw new Error('Failed to save swipe. No data returned from server.');
  }

  // Check if both partners have completed swiping (non-blocking)
  // This runs in the background and won't affect the swipe save
  checkAndNotifyCompletion().catch((error) => {
    console.error('Error checking completion status (non-blocking):', error);
  });

  return data;
}

/**
 * Get all swipes for the current user
 */
export async function getUserSwipes(): Promise<Swipe[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('swipes')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;
  return data || [];
}

/**
 * Get swipe for a specific card
 */
export async function getSwipeForCard(cardId: string): Promise<Swipe | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('swipes')
    .select('*')
    .eq('user_id', user.id)
    .eq('card_id', cardId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data || null;
}

/**
 * Matched card interface
 */
export interface MatchedCard {
  card_id: string;
  card_title: string;
  category?: string | null;
  description?: string | null;
  image_path?: string | null;
}

/**
 * Get cards that both partners have matched on (both responded 'yum')
 * Only returns matches for the current user's partner
 */
export async function getMatchedCards(): Promise<MatchedCard[]> {
  console.log('[getMatchedCards] Starting fetch');
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('[getMatchedCards] Auth error:', {
      code: authError.code,
      message: authError.message,
      details: authError,
    });
    throw new Error('Authentication error. Please sign in again.');
  }
  
  if (!user) {
    console.error('[getMatchedCards] No user found');
    throw new Error('Not authenticated. Please sign in to view matches.');
  }

  console.log('[getMatchedCards] Calling RPC with user_id:', user.id);
  const { data, error } = await supabase
    .rpc('get_matched_cards', { user_uuid: user.id });

  if (error) {
    console.error('[getMatchedCards] Database error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      fullError: error,
    });
    
    // If user has no partner, return empty array instead of throwing
    if (
      error.message?.includes('partner') || 
      error.message?.includes('Partnership') ||
      error.message?.includes('no partner') ||
      error.code === 'PGRST116' // No rows returned
    ) {
      console.log('[getMatchedCards] No partner or no matches, returning empty array');
      return [];
    }
    
    throw new Error(error.message || 'Failed to fetch matched cards.');
  }

  console.log('[getMatchedCards] Success:', {
    count: data?.length || 0,
    data: data,
  });

  return data || [];
}

