import { openDB, type IDBPDatabase } from 'idb';
import type { TelemetryPayload } from '@selaras/shared';

const DB_NAME = 'selaras_telemetry_db';
const DB_VERSION = 1;
const STORE_NAME = 'pending_minutes';

export interface PendingQueueItem {
  id?: number;
  payload: TelemetryPayload;
  attempts: number;
  nextRetryMs: number;
  createdAtMs: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (typeof indexedDB === 'undefined') {
    // In-memory mock for non-browser/Node test environments
    return Promise.resolve({
      add: () => Promise.resolve(1),
      count: () => Promise.resolve(0),
      transaction: () => ({
        objectStore: () => ({
          openCursor: () => Promise.resolve(null),
        }),
        store: {
          delete: () => Promise.resolve(),
          get: () => Promise.resolve(undefined),
          put: () => Promise.resolve(),
        },
        done: Promise.resolve(),
      }),
    } as unknown as IDBPDatabase);
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('nextRetryMs', 'nextRetryMs');
          store.createIndex('createdAtMs', 'createdAtMs');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Enqueues a newly generated 1-minute telemetry payload to IndexedDB.
 */
export async function enqueuePendingMinute(payload: TelemetryPayload): Promise<number> {
  const db = await getDb();
  const item: PendingQueueItem = {
    payload,
    attempts: 0,
    nextRetryMs: Date.now(),
    createdAtMs: Date.now(),
  };
  const id = await db.add(STORE_NAME, item);
  return id as number;
}

/**
 * Retrieves items that are ready to be sent (nextRetryMs <= current time).
 */
export async function getReadyPendingMinutes(limit = 10): Promise<PendingQueueItem[]> {
  const db = await getDb();
  const now = Date.now();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const items: PendingQueueItem[] = [];

  let cursor = await store.openCursor();
  while (cursor && items.length < limit) {
    const item = cursor.value as PendingQueueItem;
    if (item.nextRetryMs <= now) {
      items.push(item);
    }
    cursor = await cursor.continue();
  }

  await tx.done;
  return items;
}

/**
 * Removes successfully synchronized minutes from IndexedDB.
 */
export async function removePendingMinutes(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await Promise.all(ids.map((id) => tx.store.delete(id)));
  await tx.done;
}

/**
 * Updates an item upon network failure with exponential backoff.
 * Backoff formula: min(15 min, 10s * 2^attempts) + jitter
 */
export async function recordQueueFailure(id: number, currentAttempts: number): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const item = (await tx.store.get(id)) as PendingQueueItem | undefined;

  if (item) {
    const nextAttempts = currentAttempts + 1;
    // Exponential backoff capped at 15 minutes (900,000ms)
    const backoffBase = Math.min(900_000, 10_000 * Math.pow(2, nextAttempts));
    const jitter = Math.random() * 5_000;
    item.attempts = nextAttempts;
    item.nextRetryMs = Date.now() + backoffBase + jitter;
    await tx.store.put(item);
  }

  await tx.done;
}

/**
 * Returns total count of pending items in the offline queue.
 */
export async function getPendingQueueCount(): Promise<number> {
  const db = await getDb();
  return db.count(STORE_NAME);
}
