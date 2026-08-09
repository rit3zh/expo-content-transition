import { requireNativeView } from 'expo';
import type { ComponentType } from 'react';
import { Native } from '../enum/module';
import type { INativeNumericTextProps } from '../interfaces';

const NativeNumericTextView: ComponentType<INativeNumericTextProps> =
  requireNativeView<INativeNumericTextProps>(Native.ModuleName, Native.ModuleView);

export { NativeNumericTextView };
