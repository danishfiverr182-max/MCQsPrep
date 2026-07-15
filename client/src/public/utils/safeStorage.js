/**
 * src/public/utils/safeStorage.js  (Prompt 80)
 *
 * A safe wrapper around localStorage that gracefully degrades to an
 * in-memory Map when localStorage is unavailable (private browsing mode
 * in some browsers throws a SecurityError on any access attempt).
 *
 * API mirrors localStorage:
 *   safeStorage.getItem(key)      → string | null
 *   safeStorage.setItem(key, val) → void
 *   safeStorage.removeItem(key)   → void
 *
 * The in-memory fallback works identically to localStorage within a single
 * tab session hub and result screens function normally, just without
 * persistence across tabs or page reloads.
 */

// Module-level fallback map shared across all imports in this session
const memoryStore = new Map();

function isLocalStorageAvailable() {
  try {
    const testKey = "__safe_storage_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Detect once at module load time
const useLocalStorage = isLocalStorageAvailable();

const safeStorage = {
  getItem(key) {
    if (useLocalStorage) {
      try {
        return localStorage.getItem(key);
      } catch {
        return memoryStore.get(key) ?? null;
      }
    }
    return memoryStore.get(key) ?? null;
  },

  setItem(key, value) {
    if (useLocalStorage) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        // Fall through to memory store on quota exceeded or security error
      }
    }
    memoryStore.set(key, value);
  },

  removeItem(key) {
    if (useLocalStorage) {
      try {
        localStorage.removeItem(key);
        return;
      } catch {
        // Fall through
      }
    }
    memoryStore.delete(key);
  },

  /**
   * Convenience: read JSON with a default fallback.
   * Returns parsed value or `defaultVal` on any error.
   */
  getJson(key, defaultVal = null) {
    try {
      const raw = this.getItem(key);
      return raw ? JSON.parse(raw) : defaultVal;
    } catch {
      return defaultVal;
    }
  },

  /**
   * Convenience: write a value as JSON.
   */
  setJson(key, value) {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {
      // Non-fatal
    }
  },
};

export default safeStorage;
