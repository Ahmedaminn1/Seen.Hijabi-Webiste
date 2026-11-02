import { EventEmitter } from "events";

export interface StoreSyncEvent {
  action: string;
  paths?: string[];
  productId?: string;
  timestamp: number;
  version: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __seenStoreSyncBus: EventEmitter | undefined;
  // eslint-disable-next-line no-var
  var __seenStoreSyncVersion: number | undefined;
}

const bus = globalThis.__seenStoreSyncBus || new EventEmitter();
bus.setMaxListeners(200);
globalThis.__seenStoreSyncBus = bus;

if (typeof globalThis.__seenStoreSyncVersion === "undefined") {
  globalThis.__seenStoreSyncVersion = 1;
}

export function emitStoreSync(event: Omit<StoreSyncEvent, "timestamp" | "version">) {
  globalThis.__seenStoreSyncVersion = (globalThis.__seenStoreSyncVersion || 0) + 1;
  const payload: StoreSyncEvent = {
    ...event,
    version: globalThis.__seenStoreSyncVersion,
    timestamp: Date.now(),
  };
  bus.emit("sync", payload);
  return payload;
}

export function getStoreSyncVersion() {
  return globalThis.__seenStoreSyncVersion || 1;
}

export function subscribeStoreSync(listener: (event: StoreSyncEvent) => void) {
  bus.on("sync", listener);
  return () => {
    bus.off("sync", listener);
  };
}

