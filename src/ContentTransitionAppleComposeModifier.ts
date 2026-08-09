import { createModifier, type ModifierConfig } from '@expo/ui/jetpack-compose/modifiers';

export const contentTransitionAppleComposeModifier = (params: {
  color?: number;
  width?: number;
  cornerRadius?: number;
}): ModifierConfig => createModifier('contentTransitionAppleComposeModifier', params);
