import { StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface GradientBackgroundProps {
  startColor?: string;
  endColor?: string;
  gradientId?: string;
}

export function GradientBackground({
  startColor = Colors.primary,
  endColor = '#000000',
  gradientId = 'gradient',
}: GradientBackgroundProps) {
  return (
    <Svg
      style={StyleSheet.absoluteFillObject}
      width={width}
      height={height}
    >
      <Defs>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={startColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={endColor} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${gradientId})`} />
    </Svg>
  );
}

