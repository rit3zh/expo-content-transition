import { NativeModule, requireNativeModule } from 'expo';

declare class ContentTransitionAppleModule extends NativeModule<{}> {}

export default requireNativeModule<ContentTransitionAppleModule>('ContentTransitionApple');
