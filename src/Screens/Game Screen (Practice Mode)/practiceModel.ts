/**
 * Practice Mode Game Model (Step 2: Extends BaseGameModel)
 * Simplified mode with no scoring or multiplier - just practice
 */

import { BaseGameModel } from '../../common/BaseGameModel';

export class GameModel extends BaseGameModel {
    constructor() {
        super();
        // Set Practice Mode specific asset paths
        this.baseBackgroundSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/desk image.jpg';
        this.overlayBackgroundSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/10 Calander/1.png';
        this.leftSideImageSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/1.png';
        this.belowOverlayImageSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/2.png';
    }

    /**
     * Hook implementation: Practice mode has no scoring logic
     */
    protected onCorrectGuess(guessedStateName: string): void {
        // No scoring in practice mode - just log the guess
        console.log(`Practice mode: ${guessedStateName} guessed correctly`);
    }

    /**
     * Reset game state for Practice Mode
     */
    resetGame(): void {
        this.score = 0;
        this.timerSeconds = 0;
        this.gameClock = 0;
        this.resetAllStates();
    }
}

