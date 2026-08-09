import type { ViewStyle } from 'react-native';
import type { INumericTextTypographyProps } from './numeric-text-typography.interface';
import type { TNumericTextAlignment } from '../types';

interface IResolvedStyle {
  viewStyle: ViewStyle;
  typography: INumericTextTypographyProps;
  alignment?: TNumericTextAlignment;
}

export type { IResolvedStyle };
