import { describe, expect, it } from 'vitest';
import { isValidPhone } from './PhoneInput';

describe('isValidPhone', () => {
  it('accepts a valid E.164 number', () => {
    expect(isValidPhone('+14155552671')).toBe(true);
    expect(isValidPhone('+919876543210')).toBe(true);
  });

  it('rejects an empty or malformed number', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('+1123')).toBe(false);
    expect(isValidPhone('not a phone number')).toBe(false);
  });
});
