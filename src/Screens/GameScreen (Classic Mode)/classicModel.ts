/**
 * Classic Mode Game Model (Step 2: Extends BaseGameModel)
 * Adds multiplier and scoring logic specific to Classic Mode
 */

import { BaseGameModel } from '../../common/BaseGameModel';

/**
 * Multiplier constants for Classic Mode scoring system
 */
const MULTIPLIER = {
    STARTING_VALUE: 1.0,
    FLOOR_VALUE: 1.0,
    INCREMENT_AMOUNT: 0.5,
    RATE_OF_DECREASING_MULTIPLIER: 0.1,  //decreases 0.1 per second
};

/**
 * Base points awarded for correctly guessing a state
 */
const basePointsEarned = 100;

export class GameModel extends BaseGameModel {
    // --- Classic Mode specific properties ---
    private multiplier: number = MULTIPLIER.STARTING_VALUE;
    private playerPoints: number = 0;

    constructor() {
        super();
        // Set Classic Mode specific asset paths
        this.baseBackgroundSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/desk image.jpg';
        this.overlayBackgroundSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/10 Calander/1.png';
        this.leftSideImageSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/1.png';
        this.belowOverlayImageSrc = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/2.png';
    }

    // --- Multiplier methods (Classic Mode specific) ---
    getMultiplier(): number {
        return this.multiplier;
    }

    getPlayerPoints(): number {
        return this.playerPoints;
    }

    increaseMultiplier(): void {
        this.multiplier += MULTIPLIER.INCREMENT_AMOUNT;
    }

    decreaseMultiplier(): void {
        this.multiplier = Math.max(MULTIPLIER.FLOOR_VALUE, this.multiplier - MULTIPLIER.RATE_OF_DECREASING_MULTIPLIER);
    }

    /**
     * Hook implementation: Award points based on multiplier when a correct guess is made
     */
    protected onCorrectGuess(guessedStateName: string): void {
        const pointsToAdd = Math.ceil(basePointsEarned * this.multiplier);
        this.playerPoints += pointsToAdd;

        console.log(`Points earned: ${pointsToAdd} (${basePointsEarned} × ${this.multiplier.toFixed(1)}x)`);
        console.log(`Total points: ${this.playerPoints}`);
    }

    /**
     * Reset game state for Classic Mode
     */
    resetGame(): void {
        this.score = 0;
        this.timerSeconds = 0;
        this.multiplier = MULTIPLIER.STARTING_VALUE;
        this.playerPoints = 0;
        this.gameClock = 0;
        this.resetAllStates();
    }

    //for getting the mode of game  
    public getMode(): 'classic' | 'practice' | 'cracked' {
        return 'classic';
    }
}
