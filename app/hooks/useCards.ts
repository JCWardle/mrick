import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getUserSwipes } from '../lib/swipes';

export interface Label {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  created_at: string;
}

export interface ConversationTemplate {
  id: string;
  text: string;
  is_active: boolean;
  created_at: string;
}

export interface Card {
  id: string;
  text: string;
  description?: string | null;
  intensity: number; // 0-5 scale
  category?: string | null;
  display_order?: number | null;
  is_active: boolean;
  labels: Label[]; // Populated via join
  conversationTemplates: ConversationTemplate[]; // Populated via join
  created_at: string;
  updated_at: string;
}

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setError(new Error('Supabase not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'));
      setIsLoading(false);
      return;
    }

    try {
      // Fetch active cards with labels from Supabase
      // Using the helper function or manual join
      const { data: cardsData, error: cardsError } = await supabase
        .rpc('get_cards_with_labels', {
          active_only: true,
          limit_count: null,
          offset_count: 0
        });

      if (cardsError) {
        // Fallback to manual query if RPC doesn't exist yet
        const { data: cardsDataFallback, error: cardsErrorFallback } = await supabase
          .from('cards')
          .select(`
            *,
            card_labels (
              label:labels (*)
            ),
            dirty_talk_templates (
              id,
              text,
              is_active,
              created_at
            )
          `)
          .eq('is_active', true)
          .order('display_order', { ascending: true, nullsLast: true });

        if (cardsErrorFallback) throw cardsErrorFallback;

        // Transform the nested structure to match our Card interface
        const transformedCards = (cardsDataFallback || []).map((card: any) => ({
          ...card,
          labels: (card.card_labels || []).map((cl: any) => cl.label).filter(Boolean),
          conversationTemplates: (card.dirty_talk_templates || [])
            .filter((t: any) => t.is_active)
            .map((t: any) => ({
              id: t.id,
              text: t.text,
              is_active: t.is_active,
              created_at: t.created_at,
            })),
        }));

        // Get user's swipes to filter out already swiped cards
        const swipes = await getUserSwipes();
        const swipedCardIds = new Set(swipes.map((swipe) => swipe.card_id));

        // Filter out cards that have already been swiped
        const unswipedCards = transformedCards.filter(
          (card: Card) => !swipedCardIds.has(card.id)
        );

        setCards(unswipedCards);
        return;
      }

      // Fetch conversation templates for all cards
      const cardIds = (cardsData || []).map((card: any) => card.id);
      const { data: templatesData } = await supabase
        .from('dirty_talk_templates')
        .select('id, card_id, text, is_active, created_at')
        .in('card_id', cardIds)
        .eq('is_active', true);

      // Group templates by card_id
      const templatesByCardId = new Map<string, ConversationTemplate[]>();
      (templatesData || []).forEach((template: any) => {
        if (!templatesByCardId.has(template.card_id)) {
          templatesByCardId.set(template.card_id, []);
        }
        templatesByCardId.get(template.card_id)!.push({
          id: template.id,
          text: template.text,
          is_active: template.is_active,
          created_at: template.created_at,
        });
      });

      // Transform RPC result to match Card interface (labels already in JSONB format)
      const transformedCards = (cardsData || []).map((card: any) => ({
        ...card,
        labels: Array.isArray(card.labels) ? card.labels : [],
        conversationTemplates: templatesByCardId.get(card.id) || [],
      }));

      // Get user's swipes to filter out already swiped cards
      const swipes = await getUserSwipes();
      const swipedCardIds = new Set(swipes.map((swipe) => swipe.card_id));

      // Filter out cards that have already been swiped
      const unswipedCards = transformedCards.filter(
        (card: Card) => !swipedCardIds.has(card.id)
      );

      setCards(unswipedCards);
    } catch (err) {
      let errorMessage = 'Failed to load cards';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      // Check if it's a Supabase configuration error
      if (errorMessage.includes('Missing Supabase') || errorMessage.includes('supabase')) {
        errorMessage = 'Supabase not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY';
      }
      
      const error = new Error(errorMessage);
      setError(error);
      console.error('Error loading cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCards = () => {
    loadCards();
  };

  return {
    cards,
    isLoading,
    error,
    refreshCards,
  };
}

