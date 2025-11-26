import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Snackbar, ActivityIndicator, IconButton } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { useAuth } from '../../hooks/useAuth';
import { checkInvitationAccepted } from '../../lib/deepLinkHandler';
import { getMatchedCards, MatchedCard } from '../../lib/swipes';
import { groupMatchedCardsByCategory, CategoryGroup } from '../../utils/cardHelpers';
import { MatchedCardGrid } from '../../components/swipe/MatchedCardGrid';
import { MatchedCardModal } from '../../components/swipe/MatchedCardModal';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function MatchingScreen() {
  const router = useRouter();
  const { profile, isLoading, refreshProfile } = useAuth();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const previousPartnerId = useRef<string | null>(null);
  const lastFetchedPartnerId = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const [matchedCards, setMatchedCards] = useState<MatchedCard[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selectedCard, setSelectedCard] = useState<MatchedCard | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Initialize previousPartnerId on first load to prevent false positive snackbar
  useEffect(() => {
    if (profile && previousPartnerId.current === null) {
      previousPartnerId.current = profile.partner_id || null;
    }
  }, [profile]);

  // Check if user has no partner when screen loads or comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const checkInvitation = async () => {
        if (!isLoading && profile) {
          // Check if an invitation was just accepted (from deep link)
          const invitationAccepted = await checkInvitationAccepted();
          if (invitationAccepted) {
            // Refresh profile to get updated partner_id
            await refreshProfile();
            setSnackbarMessage("You're now linked with your partner!");
            setSnackbarVisible(true);
          }

          // Check if partner_id was just set (user just linked with partner)
          // Only show message if it actually changed from null to a value
          const currentPartnerId = profile.partner_id || null;
          if (previousPartnerId.current === null && currentPartnerId !== null) {
            // Partner was just linked, show success message
            setSnackbarMessage("You're now linked with your partner!");
            setSnackbarVisible(true);
          }
          previousPartnerId.current = currentPartnerId;

          // Navigate to invite screen if no partner
          if (!profile.partner_id) {
            router.replace('/(swipe)/invite' as any);
          }
        }
      };

      checkInvitation();
    }, [profile, isLoading, refreshProfile])
  );

  // Fetch matched cards when screen comes into focus and user has a partner
  // Only fetch when partner_id actually changes to prevent infinite loops
  useFocusEffect(
    React.useCallback(() => {
      const fetchMatchedCards = async () => {
        // Don't fetch if already loading
        if (isFetchingRef.current) {
          console.log('[MatchingScreen] Skipping fetch - already fetching');
          return;
        }

        // Wait for profile to load before making decisions
        if (isLoading || !profile) {
          console.log('[MatchingScreen] Profile still loading or not available, waiting...', {
            isLoading,
            hasProfile: !!profile,
          });
          return;
        }

        // If profile is loaded but no partner_id, clear matches
        if (!profile.partner_id) {
          console.log('[MatchingScreen] No partner_id, clearing matches');
          setMatchedCards([]);
          lastFetchedPartnerId.current = null;
          return;
        }

        // Don't fetch if we already fetched for this partner_id
        if (lastFetchedPartnerId.current === profile.partner_id) {
          console.log('[MatchingScreen] Already fetched for this partner_id, skipping');
          return;
        }

        console.log('[MatchingScreen] Fetching matched cards for partner_id:', profile.partner_id);
        isFetchingRef.current = true;
        setLoadingMatches(true);
        lastFetchedPartnerId.current = profile.partner_id;

        try {
          const matches = await getMatchedCards();
          console.log('[MatchingScreen] Matched cards fetched:', {
            count: matches.length,
            matches: matches.map(m => m.card_title),
          });
          setMatchedCards(matches);
        } catch (error) {
          console.error('[MatchingScreen] Error fetching matched cards:', error);
          // Reset the last fetched partner_id on error so we can retry
          lastFetchedPartnerId.current = null;
          setMatchedCards([]);
        } finally {
          isFetchingRef.current = false;
          setLoadingMatches(false);
        }
      };

      fetchMatchedCards();
    }, [profile, isLoading])
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <GradientBackground gradientId="matchingGradient" />
      
      <View style={styles.content}>
        {profile?.partner_id ? (
          <View style={styles.listContainer}>
            {loadingMatches ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.backgroundWhite} />
              </View>
            ) : matchedCards.length > 0 ? (
              (() => {
                const categoryGroups = groupMatchedCardsByCategory(matchedCards);
                // Flatten into items: [header0, content0?, header1, content1?, ...]
                const flatItems: Array<{ type: 'header' | 'content'; category: string; cards: MatchedCard[]; index: number }> = [];
                categoryGroups.forEach((group, idx) => {
                  flatItems.push({ type: 'header', category: group.category, cards: group.cards, index: idx });
                  if (expandedCategories.has(group.category)) {
                    flatItems.push({ type: 'content', category: group.category, cards: group.cards, index: idx });
                  }
                });
                const stickyIndices = flatItems
                  .map((item, idx) => (item.type === 'header' ? idx : -1))
                  .filter(idx => idx !== -1);

                return (
                  <FlatList
                    data={flatItems}
                    keyExtractor={(item, index) => `${item.category}-${item.type}-${index}`}
                    renderItem={({ item }) => {
                      if (item.type === 'header') {
                        const isExpanded = expandedCategories.has(item.category);
                        const categoryDisplayName = item.category.charAt(0).toUpperCase() + item.category.slice(1);
                        return (
                          <TouchableOpacity
                            style={styles.categoryHeader}
                            onPress={() => {
                              const newExpanded = new Set(expandedCategories);
                              if (isExpanded) {
                                newExpanded.delete(item.category);
                              } else {
                                newExpanded.add(item.category);
                              }
                              setExpandedCategories(newExpanded);
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.headerContent}>
                              <Text variant="titleMedium" style={styles.categoryName}>
                                {categoryDisplayName}
                              </Text>
                              <Text variant="bodyMedium" style={styles.cardCount}>
                                {item.cards.length} {item.cards.length === 1 ? 'card' : 'cards'}
                              </Text>
                            </View>
                            <IconButton
                              icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={24}
                              iconColor={Colors.backgroundWhite}
                              style={styles.expandIcon}
                            />
                          </TouchableOpacity>
                        );
                      } else {
                        return (
                          <View style={styles.categoryContent}>
                            <MatchedCardGrid
                              cards={item.cards}
                              onCardPress={(card) => {
                                setSelectedCard(card);
                                setModalVisible(true);
                              }}
                            />
                          </View>
                        );
                      }
                    }}
                    stickyHeaderIndices={stickyIndices}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                  />
                );
              })()
            ) : (
              <Text variant="bodyLarge" style={styles.placeholderText}>
                No matches yet. Keep swiping to find what you both like!
              </Text>
            )}
          </View>
        ) : (
          <Text variant="bodyLarge" style={styles.placeholderText}>
            Invite your partner to compare preferences
          </Text>
        )}
      </View>

      <MatchedCardModal
        visible={modalVisible}
        card={selectedCard}
        onDismiss={() => {
          setModalVisible(false);
          setSelectedCard(null);
        }}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: Spacing.xl,
    paddingBottom: 0,
  },
  placeholderText: {
    color: Colors.backgroundWhite,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(107, 70, 193, 0.98)', // More opaque background to cover content, using primary color
    marginBottom: Spacing.md,
    zIndex: 10,
    elevation: 10, // For Android
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryName: {
    color: Colors.backgroundWhite,
    fontWeight: '600',
  },
  cardCount: {
    color: Colors.backgroundWhite,
    opacity: 0.8,
  },
  expandIcon: {
    margin: 0,
  },
  categoryContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.md,
    marginHorizontal: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  snackbar: {
    marginBottom: Spacing.xl,
  },
});

