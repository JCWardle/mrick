import { Colors } from '../constants/colors';

export interface IntensityColor {
  backgroundColor: string;
  textColor: string;
  label: string;
}

/**
 * Maps intensity level (0-5) to color scheme
 * 0: Very light colors
 * 1: Light warm colors
 * 2: Balanced moderate colors
 * 3: Deeper rich colors
 * 4: Strong vibrant colors
 * 5: Deep bold colors
 */
export function getIntensityColor(intensity: number): IntensityColor {
  switch (intensity) {
    case 0:
      return {
        backgroundColor: '#E8F5E9', // Very light green
        textColor: '#2E7D32', // Dark green
        label: 'Very Mild',
      };
    case 1:
      return {
        backgroundColor: '#FFF3E0', // Light warm orange
        textColor: '#E65100', // Deep orange
        label: 'Mild',
      };
    case 2:
      return {
        backgroundColor: '#FFE0B2', // Balanced warm orange
        textColor: '#BF360C', // Moderate orange-red
        label: 'Medium',
      };
    case 3:
      return {
        backgroundColor: '#FFB74D', // Deeper orange
        textColor: '#FFFFFF', // White for contrast
        label: 'Moderate',
      };
    case 4:
      return {
        backgroundColor: '#FF8A65', // Strong coral
        textColor: '#FFFFFF', // White for contrast
        label: 'Intense',
      };
    case 5:
      return {
        backgroundColor: '#FF6B6B', // Deep coral (using brand color)
        textColor: '#FFFFFF', // White for contrast
        label: 'Very Intense',
      };
    default:
      // Default to medium if intensity is out of range
      return {
        backgroundColor: '#FFE0B2',
        textColor: '#BF360C',
        label: 'Medium',
      };
  }
}

