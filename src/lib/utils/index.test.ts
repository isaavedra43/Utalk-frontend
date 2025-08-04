import { describe, expect, it } from 'vitest';
import { cn } from '../utils.js';

describe('Utils', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(typeof result).toBe('string');
    expect(result).toContain('class1');
  });

  it('should handle conditional classes', () => {
    const isVisible = true;
    const isHidden = false;
    const result = cn('base', isVisible && 'conditional', isHidden && 'hidden');
    expect(result).toContain('base');
    expect(result).toContain('conditional');
    expect(result).not.toContain('hidden');
  });
});
