export const safeStorage = {
    getItem: <T>(key: string, defaultValue: T): T => {
        if (typeof window === "undefined") return defaultValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return defaultValue;
        }
    },
    setItem: <T>(key: string, value: T): void => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);
        }
    },
    removeItem: (key: string): void => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error);
        }
    },
    clear: (): void => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.clear();
        } catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    }
};

export const localStorage = safeStorage;
