import { DB_NAME, DB_VERSION, STORE_HABITS, STORE_LOGS } from '../constants';
import { Habit, HabitLog } from '../types';

let dbInstance: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_HABITS)) {
        db.createObjectStore(STORE_HABITS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_LOGS)) {
        const logStore = db.createObjectStore(STORE_LOGS, { keyPath: 'id' });
        logStore.createIndex('habitId', 'habitId', { unique: false });
        logStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const saveHabit = async (habit: Habit): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_HABITS], 'readwrite');
    const store = transaction.objectStore(STORE_HABITS);
    const request = store.put(habit);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteHabit = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_HABITS, STORE_LOGS], 'readwrite');
    const habitStore = transaction.objectStore(STORE_HABITS);
    const logStore = transaction.objectStore(STORE_LOGS);
    
    // Delete the habit
    habitStore.delete(id);

    // Delete associated logs (need to query by index first)
    const index = logStore.index('habitId');
    const logsReq = index.getAllKeys(id);
    
    logsReq.onsuccess = () => {
      const keys = logsReq.result;
      keys.forEach(key => logStore.delete(key));
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getHabits = async (): Promise<Habit[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_HABITS], 'readonly');
    const store = transaction.objectStore(STORE_HABITS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const addLog = async (log: HabitLog): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_LOGS], 'readwrite');
    const store = transaction.objectStore(STORE_LOGS);
    const request = store.add(log);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getLogs = async (habitId: string): Promise<HabitLog[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_LOGS], 'readonly');
    const store = transaction.objectStore(STORE_LOGS);
    const index = store.index('habitId');
    const request = index.getAll(habitId);
    request.onsuccess = () => {
      // Sort by timestamp desc
      const logs = request.result.sort((a, b) => b.timestamp - a.timestamp);
      resolve(logs);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getAllLogs = async (): Promise<HabitLog[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_LOGS], 'readonly');
        const store = transaction.objectStore(STORE_LOGS);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};
