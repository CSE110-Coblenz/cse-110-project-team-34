// Provide minimal ambient declarations for Vitest globals to avoid requiring the 'vitest' module/types.
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void): void;
declare const expect: any;
import { GuessModel } from '../Minigames/Guess/guessModel';

describe('basic input test', () => {
    it('should accept a letter and update inputString accordingly', () => {

        const model = new GuessModel();

        // Mock a specific state for testing
        model.targetStateName = 'TEXAS';
        model.visibleIndices = new Set([1, 3, 4]); // E, A, S are visible
        model.hiddenIndices = [0, 2]; // T, X are hidden
        model.inputString = '';

        // Initial state: _ E _ A S
        // Hidden indices: 0 (T), 2 (X)

        // User types 'T'
        model.handleInput('T');
        expect(model.inputString).toBe('T');
        expect(model.isWon).toBe(false);

        // User types 'X'
        model.handleInput('X');
        expect(model.inputString).toBe('TX');
        
        // Should be won now
        expect(model.isWon).toBe(true);
    });

    it('should handle backspace correctly', () => {
        const model = new GuessModel();
        model.targetStateName = 'TEXAS';
        model.visibleIndices = new Set([1, 3, 4]);
        model.hiddenIndices = [0, 2];
        model.inputString = '';

        model.handleInput('T');
        expect(model.inputString).toBe('T');

        model.handleBackspace();
        expect(model.inputString).toBe('');
    });

    it('should not allow input beyond hidden length', () => {
        const model = new GuessModel();
        model.targetStateName = 'TEXAS';
        model.visibleIndices = new Set([1, 3, 4]);
        model.hiddenIndices = [0, 2];
        model.inputString = '';

        model.handleInput('A');
        model.handleInput('B');
        model.handleInput('C'); // Should be ignored

        expect(model.inputString).toBe('AB');
    });
});
