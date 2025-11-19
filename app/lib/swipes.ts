import { supabase } from './supabase';

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

