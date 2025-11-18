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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

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

  if (error) throw error;
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

