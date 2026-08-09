import { requireNativeView } from 'expo';
import { type PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import { createViewModifierEventListener } from '@expo/ui/jetpack-compose/modifiers';
import * as React from 'react';

export interface ContentTransitionAppleComposeViewProps extends PrimitiveBaseProps {
  title: string;
  children?: React.ReactNode;
}

const NativeContentTransitionAppleComposeView = requireNativeView<ContentTransitionAppleComposeViewProps>(
  'ContentTransitionApple',
  'ContentTransitionAppleComposeView'
);

export default function ContentTransitionAppleComposeView({
  modifiers,
  ...rest
}: ContentTransitionAppleComposeViewProps) {
  return (
    <NativeContentTransitionAppleComposeView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...rest}
    />
  );
}
