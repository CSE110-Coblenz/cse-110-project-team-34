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

import { GameModel } from './GameModel';

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