import { describe, it, expect } from "vitest";
import { GuessModel } from '../Minigames/Guess/guessModel';
import { stateNames } from '../common/USMapData'

describe('basic input test', () => {
    it('should accept a letter and update inputString accordingly', () => {

        const model = new GuessModel();

        model.targetStateName = 'OHIO';
        model.hiddenIndices = [0,1,2,3];
        model.inputString = '';

        model.handleInput('O');
        model.handleInput('H'); 

        // input: 'OH'
        console.log('Input String:', model.inputString);
        // expected: true
        console.log('Full Path Valid:', model.isFullPathValid);

        expect(model.inputString).toBe('OH');
        expect(model.isFullPathValid).toBe(true);
    });
});
