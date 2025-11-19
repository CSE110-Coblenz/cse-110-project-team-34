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
 * - skipMenuScreen: Skip menu and go directly to game screen
 * - ShowGameClock: Display the game clock in developer view
 * - ShowInputLabel: Show "Enter text below" label for the input box
 * - AllowStateClicking: Allow clicking on states to manually set the current state
 * - ShowStatesGuessed: Display the count of correctly guessed states
 * - PreGuessAllExceptCA: Pre-guess all states except California (for testing win conditions)
 * 
 * Note: States are accessed by their 2-letter abbreviations (e.g., 'ca', 'tx', 'ny')
 */

// ====================================
// Developer Flags
// ====================================
// Set to "classic", "practice", "cracked" to skip menu, or "off" to show menu
export const skipMenuScreen: "off" | "classic" | "practice" | "cracked" = "practice";

// Classic Mode Developer Flags
export const classicModeShowGameClock = true;
export const classicModeShowInputLabel = true;
export const classicModeAllowStateClicking = false;
export const classicModeShowStatesGuessed = true;
export const classicModePreGuessAllExceptCA = false;

// Cracked Mode Developer Flags
export const crackedModeShowGameClock = true;
export const crackedModeShowInputLabel = true;
export const crackedModeAllowStateClicking = true;
export const crackedModeShowStatesGuessed = true;
export const crackedModePreGuessAllExceptCA = false;

import type { GameModel as ClassicGameModel } from './Screens/GameScreen (Classic Mode)/classicModel';

/**
 * Apply developer flag logic to pre-guess states for Classic Mode
 * Called after model initialization
 */
export function applyClassicModeDeveloperFlags(gameModel: ClassicGameModel | any): void {
    if (classicModePreGuessAllExceptCA) {
        console.log('🎮 Classic Mode Developer Flag: Pre-guessing all states except California');
        
        const states = gameModel.getAllStates();
        let count = 0;
        
        states.forEach((state: any, code: string) => {
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
 * Apply developer flag logic to pre-guess states for Cracked Mode
 * Called after model initialization
 */
export function applyCrackedModeDeveloperFlags(gameModel: ClassicGameModel | any): void {
    if (crackedModePreGuessAllExceptCA) {
        console.log('🎮 Cracked Mode Developer Flag: Pre-guessing all states except California');
        
        const states = gameModel.getAllStates();
        let count = 0;
        
        states.forEach((state: any, code: string) => {
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
 * Accepts any GameModel with compatible methods (Classic, Practice, or Cracked Mode)
 */
export function runSandbox(gameModel: ClassicGameModel | any): void {
    console.log('\n=== 🎮 SANDBOX MODE ACTIVATED ===\n');
    
    // ====================================
    // TESTING AREA - MODIFY AS NEEDED
    // ====================================
    

}