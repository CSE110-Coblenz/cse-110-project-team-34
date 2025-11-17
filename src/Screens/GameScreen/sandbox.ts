/**
 * SANDBOX FILE FOR TESTING STATE MANIPULATION
 * 
 * This file is isolated and won't interfere with production code.
 * Use this to test state methods and verify they work as expected.
 * 
 * To use this sandbox:
 * 1. Uncomment the import line in GameController.ts
 * 2. Uncomment the runSandbox(this.model) call
 * 3. Load the game screen and check console
 * 4. After model changes, call window.gameController.refreshView() to see visual updates
 * 5. Comment out when done testing
 * 
 * Developer Flags:
 * - Set these flags to control developer-only features
 * - skipMenuScreen: Skip menu and go directly to game screen
 * - showGameClock: Display the game clock
 * - showInputLabel: Show "Enter text below" label
 * - allowStateClicking: Allow clicking on states to manually set the current state
 * - showStatesGuessed: Display the count of correctly guessed states
 * - preGuessAllExceptCA: Pre-guess all states except California (for testing win conditions)
 * 
 * Note: States are accessed by their 2-letter abbreviations (e.g., 'ca', 'tx', 'ny')
 */

// ====================================
// Developer Flags
// ====================================
export const skipMenuScreen = true;

export const showGameClock = true;

export const showInputLabel = true;

export const allowStateClicking = false;

export const showStatesGuessed = true;

export const preGuessAllExceptCA = true;

import { GameModel } from './GameModel';

/**
 * Apply developer flag logic to pre-guess states
 * Called after model initialization
 */
export function applyDeveloperFlags(gameModel: GameModel): void {
    if (preGuessAllExceptCA) {
        console.log('🎮 Developer Flag: Pre-guessing all states except California');
        
        const states = gameModel.getAllStates();
        let count = 0;
        
        states.forEach((state, code) => {
            // Mark all states as guessed except California (CA)
            if (code.toLowerCase() !== 'ca') {
                state.isGuessed(true);
                count++;
            }
        });
        
        // Set the flag indicating first neighbor has been guessed
        // This allows the initial state (California) and all neighbors to become guessable
        gameModel.setHasGuessedFirstNeighbor(true);
        
        // Update guessable states (this will make California and any unguessed neighbors red)
        gameModel.updateGuessableStates();
        
        // Directly set California to red since it's the only unguessed state
        const californiaState = gameModel.getState('ca');
        if (californiaState && !californiaState.getIsGuessed()) {
            californiaState.color('red');
            console.log('✓ California set to red (guessable)');
        }
        
        console.log(`✅ Pre-guessed ${count} states (all except California)`);
        console.log(`📊 States guessed count: ${gameModel.getStatesGuessedCount()}`);
    }
}

/**
 * Run sandbox tests on the GameModel (pure data)
 * This is your playground to test state manipulation
 */
export function runSandbox(gameModel: GameModel): void {
    console.log('\n=== 🎮 SANDBOX MODE ACTIVATED ===\n');
    
    // ====================================
    // TESTING AREA - MODIFY AS NEEDED
    // ====================================
    

}