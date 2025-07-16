import { describe, it, expect } from 'vitest';
import { truncateQuantity } from './helper.js';

describe('truncateQuantity', () => {
  it('should return the number itself if it is less than 1000', () => {
    expect(truncateQuantity(5)).toBe(5);
  });

  it('should return the number itself if it is exactly 999', () => {
    expect(truncateQuantity(999)).toBe(999);
  });

  it('should return "999+" if the number is exactly 1000', () => {
    expect(truncateQuantity(1000)).toBe('999+');
  });

  it('should return "999+" if the number is greater than 1000', () => {
    expect(truncateQuantity(1234)).toBe('999+');
  });

  it('should return 0 if the number is 0', () => {
    expect(truncateQuantity(0)).toBe(0);
  });
  
  it('should handle negative numbers by returning them as is', () => {
    expect(truncateQuantity(-10)).toBe(-10);
  });
});
