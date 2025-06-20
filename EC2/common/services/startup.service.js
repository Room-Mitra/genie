import { warmCache as warmDevicesCache } from '../../routes/Device/Device.cache.js';
import { warmCache as warmIntentsCache } from '../../routes/Intents/Intent.cache.js';

export const runFunctionsOnServerStartup = () => {
  warmDevicesCache();
  warmIntentsCache();
};
