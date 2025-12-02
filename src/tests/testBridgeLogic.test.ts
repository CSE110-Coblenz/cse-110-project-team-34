import { describe, it, expect } from 'vitest';
import { findShortestBridgeSize } from '../utils/bridgeMinigameUtils';

describe('findShortestBridgeSize', () => {
    it('returns 0 when start and end are the same', () => {
        expect(findShortestBridgeSize('ca', 'ca')).toBe(0);
    });

    it('finds correct bridge size between two connected neighbors', () => {
        expect(findShortestBridgeSize('ca', 'or')).toBe(0);
    });

    it('finds correct path length between distant states', () => {
        expect(findShortestBridgeSize('ca', 'ny')).toBe(7);
    });
});
