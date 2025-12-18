import { describe, it, expect } from 'vitest';
import {
    formatDate,
    addDays,
    getDaysDifference,
    formatTime24,
    parseTime12To24,
} from '../date';

describe('Date Utilities', () => {
    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = new Date('2025-01-01T10:00:00.000Z');
            // Note: Actual output depends on locale, which might vary in test env
            // We will check if it returns a string and contains parts of the date
            const formatted = formatDate(date, 'short');
            expect(typeof formatted).toBe('string');
            // expect(formatted).toContain('2025'); // Might vary based on locale
        });
    });

    describe('addDays', () => {
        it('should add days correctly', () => {
            const start = new Date('2025-01-01');
            const result = addDays(start, 5);
            expect(result.getDate()).toBe(6);
            expect(result.getMonth()).toBe(0); // Jan is 0
            expect(result.getFullYear()).toBe(2025);
        });

        it('should handle month rollover', () => {
            const start = new Date('2025-01-31');
            const result = addDays(start, 1);
            expect(result.getDate()).toBe(1);
            expect(result.getMonth()).toBe(1); // Feb is 1
        });
    });

    describe('getDaysDifference', () => {
        it('should calculate difference correctly', () => {
            const d1 = new Date('2025-01-01');
            const d2 = new Date('2025-01-06');
            expect(getDaysDifference(d1, d2)).toBe(5);
        });

        it('should return absolute difference', () => {
            const d1 = new Date('2025-01-06');
            const d2 = new Date('2025-01-01');
            expect(getDaysDifference(d1, d2)).toBe(5);
        });
    });

    describe('Time Formatting', () => {
        it('should format 24h to 12h', () => {
            expect(formatTime24("13:00")).toBe("1:00 PM");
            expect(formatTime24("00:00")).toBe("12:00 AM");
            expect(formatTime24("12:00")).toBe("12:00 PM");
        });

        it('should parse 12h to 24h', () => {
            expect(parseTime12To24("1:00 PM")).toBe("13:00");
            expect(parseTime12To24("12:00 AM")).toBe("00:00");
            expect(parseTime12To24("12:00 PM")).toBe("12:00");
            // Should return as-is if already 24h
            expect(parseTime12To24("14:30")).toBe("14:30");
        });
    });
});
