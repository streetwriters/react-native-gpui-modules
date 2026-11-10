import NetInfo from '@react-native-community/netinfo';
import type { ModuleChecks } from './types';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const netinfo: ModuleChecks = {
  name: 'netinfo',
  checks: [
    [
      'fetches the current state',
      async () => {
        const state = await NetInfo.fetch();
        assert(typeof state.isConnected === 'boolean', 'isConnected missing');
        assert(typeof state.type === 'string', 'type missing');
      },
    ],
    [
      'reports a connected state on this machine',
      async () => {
        const state = await NetInfo.fetch();
        assert(
          state.isConnected === true,
          `isConnected is ${state.isConnected}`,
        );
      },
    ],
    [
      'delivers the latest state to a listener',
      async () => {
        let unsubscribe: (() => void) | undefined;
        const state = await new Promise<{ type: string }>(resolve => {
          unsubscribe = NetInfo.addEventListener(resolve);
        });
        unsubscribe?.();
        assert(typeof state.type === 'string', 'listener got no state');
      },
    ],
  ],
};

export default netinfo;
