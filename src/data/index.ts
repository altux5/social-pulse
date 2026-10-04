import { MockDataProvider } from './mock/MockDataProvider';
import type { SocialDataProvider } from './SocialDataProvider';

// Swap for a SupabaseDataProvider once a backend exists; nothing else needs to change.
export const dataProvider: SocialDataProvider = new MockDataProvider();

export type { SocialDataProvider, RemoteChange } from './SocialDataProvider';
