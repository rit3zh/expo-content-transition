import { registerWebModule, NativeModule } from 'expo';

// ContentTransitionAppleModule is not available on the web platform.
class ContentTransitionAppleModule extends NativeModule<{}> {}

export default registerWebModule(ContentTransitionAppleModule, 'ContentTransitionAppleModule');
