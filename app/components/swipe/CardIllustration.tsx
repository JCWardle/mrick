import { View, StyleSheet, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface CardIllustrationProps {
  cardText: string;
  category?: string | null;
  imagePath?: string | null; // Path to image in Supabase storage (e.g., "card-images/morning-kisses-titled.png" or "morning-kisses-titled.png")
}

const cardPlaceholderImage = require('../../assets/images/verticle_test.png');

/**
 * Construct Supabase storage URL from image path using Supabase client
 */
function getSupabaseImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) {
    return null;
  }

  // The path from the database may include 'card-images/' prefix
  // When using .from('card-images'), getPublicUrl expects the path relative to the bucket
  // If the path includes 'card-images/', use it as-is (files were uploaded with that prefix)
  // If it doesn't, use it directly
  const pathToUse = imagePath;
  
  // Use Supabase client to get public URL - this handles URL construction correctly
  const { data } = supabase.storage.from('card-images').getPublicUrl(pathToUse);
  
  if (!data?.publicUrl) {
    console.warn('[CardIllustration] No public URL returned for path:', pathToUse);
    return null;
  }
  
  return data.publicUrl;
}

export function CardIllustration({ cardText, category, imagePath }: CardIllustrationProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const imageUrl = getSupabaseImageUrl(imagePath);

  // Reset state when imagePath changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [imagePath]);

  const usePlaceholder = !imageUrl || imageError;

  return (
    <View style={styles.container}>
      {usePlaceholder ? (
        <Image
          source={cardPlaceholderImage}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <Image
          key={imageUrl} // Force re-render when URL changes
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => {
            setImageLoading(false);
            setImageError(false);
          }}
          onError={(error) => {
            const errorInfo = error?.nativeEvent || error;
            console.error('[CardIllustration] Image load error:', {
              error: errorInfo?.error || 'Unknown error',
              imageUrl,
              imagePath,
            });
            setImageError(true);
            setImageLoading(false);
          }}
        />
      )}
      {imageLoading && !usePlaceholder && (
        <View style={styles.loadingOverlay}>
          <Image
            source={cardPlaceholderImage}
            style={[styles.image, styles.loadingImage]}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImage: {
    opacity: 0.3,
  },
});

