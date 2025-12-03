/**
 * Cracked Mode Game Model (Step 2: Extends BaseGameModel)
 * Customizable mode with additional validation for invalid state names
 */

import { BaseGameModel } from '../../common/BaseGameModel';

export class GameModel extends BaseGameModel {
    constructor() {
        super();
        // Set Cracked Mode specific asset paths
        this.baseBackgroundSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/desk image.jpg';
        this.overlayBackgroundSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/10 Calander/1.png';
        this.leftSideImageSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/1.png';
        this.belowOverlayImageSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/2.png';
    }

    /**
     * Cracked Mode specific: Check if a state name is valid
     * Used for showing "you lose :(" popup
     */
    isValidStateName(stateName: string): boolean {
        return this.getStateCodeByName(stateName) !== undefined;
    }

    /**
     * Hook implementation: Cracked mode has no scoring logic
     */
    protected onCorrectGuess(guessedStateName: string): void {
        // No scoring in cracked mode - just log the guess
        console.log(`Cracked mode: ${guessedStateName} guessed correctly`);
    }

    /**
     * Reset game state for Cracked Mode
     */
    resetGame(): void {
        this.score = 0;
        this.timerSeconds = 0;
        this.gameClock = 0;
        this.resetAllStates();
    }
    
    //for getting the mode of game
    public getMode(): 'classic' | 'practice' | 'cracked' {
        return 'cracked';
    }
}
