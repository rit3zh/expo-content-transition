import { requireNativeView } from 'expo';
import * as React from 'react';

import { ContentTransitionAppleViewProps } from './ContentTransitionApple.types';

const NativeView: React.ComponentType<ContentTransitionAppleViewProps> = requireNativeView('ContentTransitionApple');

export default function ContentTransitionAppleView(props: ContentTransitionAppleViewProps) {
  return <NativeView {...props} />;
}
