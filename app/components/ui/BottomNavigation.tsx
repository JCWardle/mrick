import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

type ActiveScreen = 'swipe' | 'invite' | 'matching' | 'profile';

interface BottomNavigationProps {
  activeScreen: ActiveScreen;
}

export function BottomNavigation({ activeScreen }: BottomNavigationProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();

  const handlePartnerPress = () => {
    if (!profile || !profile.partner_id) {
      router.push('/(swipe)/invite' as any);
    } else {
      router.push('/(swipe)/matching' as any);
    }
  };

  return (
    <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => {
          if (activeScreen !== 'swipe') {
            router.push('/(swipe)/' as any);
          }
        }}
      >
        <IconButton
          icon={activeScreen === 'swipe' ? 'heart' : 'heart-outline'}
          size={24}
          iconColor={activeScreen === 'swipe' ? Colors.primary : Colors.textTertiary}
          style={styles.navButton}
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => {
          if (activeScreen !== 'invite' && activeScreen !== 'matching') {
            handlePartnerPress();
          }
        }}
      >
        <IconButton
          icon="account-multiple"
          size={24}
          iconColor={activeScreen === 'invite' || activeScreen === 'matching' ? Colors.primary : Colors.textTertiary}
          style={styles.navButton}
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => {
          if (activeScreen !== 'profile') {
            router.push('/(swipe)/profile' as any);
          }
        }}
      >
        <IconButton
          icon={activeScreen === 'profile' ? 'account' : 'account-outline'}
          size={24}
          iconColor={activeScreen === 'profile' ? Colors.primary : Colors.textTertiary}
          style={styles.navButton}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: Spacing.xs,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    margin: 0,
  },
});

