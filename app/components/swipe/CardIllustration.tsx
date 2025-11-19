import { View, StyleSheet, Image } from 'react-native';

interface CardIllustrationProps {
  cardText: string;
  category?: string | null;
}

const cardPlaceholderImage = require('../../assets/images/unnamed.jpg');

export function CardIllustration({ cardText, category }: CardIllustrationProps) {
  return (
    <View style={styles.container}>
      <Image
        source={cardPlaceholderImage}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

