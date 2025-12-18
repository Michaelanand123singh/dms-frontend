import { describe, it, expect } from 'vitest';
import {
    isValidEmail,
    isValidPhone,
    isRequired,
    validatePhone,
    validateVIN,
} from '../validation';

describe('Validation Utilities', () => {
    describe('isValidEmail', () => {
        it('should return true for valid emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        });

        it('should return false for invalid emails', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
            expect(isValidEmail('')).toBe(false);
        });
    });

    describe('validatePhone', () => {
        it('should accept 10 digit numbers', () => {
            expect(validatePhone('9876543210')).toBe(true);
        });

        it('should accept numbers with +91 prefix', () => {
            expect(validatePhone('+919876543210')).toBe(true);
            expect(validatePhone('+91 9876543210')).toBe(true);
        });

        it('should reject invalid lengths', () => {
            expect(validatePhone('123')).toBe(false);
            expect(validatePhone('123456789012')).toBe(false);
        });
    });

    describe('validateVIN', () => {
        it('should accept valid 17-char VINs', () => {
            // 17 characters, no I, O, Q
            expect(validateVIN('1M8GDM9A2KP042788')).toBe(true);
        });

        it('should reject VINs with forbidden characters (I, O, Q)', () => {
            expect(validateVIN('1M8GDM9A2KP04278I')).toBe(false); // contains I
        });

        it('should reject invalid lengths', () => {
            expect(validateVIN('123')).toBe(false);
        });
    });

    describe('isRequired', () => {
        it('should return true for non-empty values', () => {
            expect(isRequired('foo')).toBe(true);
            expect(isRequired(123)).toBe(true);
        });

        it('should return false for empty strings, null, or undefined', () => {
            expect(isRequired('')).toBe(false);
            expect(isRequired('   ')).toBe(false);
            expect(isRequired(null)).toBe(false);
            expect(isRequired(undefined)).toBe(false);
        });
    });
});
