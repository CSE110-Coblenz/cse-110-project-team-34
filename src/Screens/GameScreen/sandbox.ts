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
 * Note: States are accessed by their 2-letter abbreviations (e.g., 'ca', 'tx', 'ny')
 */

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
    
    // Example 1: Change California to yellow (data only)
    const ca = gameModel.getState('ca');
    if (ca) {
        ca.color('yellow');
        console.log('✓ California (ca): changed to yellow (model data)');
        console.log('💡 Run window.gameController.refreshView() to see visual update');
    }
    
    // Example 2: Mark Texas as guessed and make it black
    const tx = gameModel.getState('tx');
    if (tx) {
        tx.color('black').isGuessed(true);
        console.log('✓ Texas (tx): black and marked as guessed (model data)');
    }
    
    // Example 3: Chain multiple methods on New York
    const ny = gameModel.getState('ny');
    if (ny) {
        ny.color('green').isGuessed(true).highlight(true);
        console.log('✓ New York (ny): green, guessed, and highlighted (model data)');
    }
    
    // Example 4: Test multiple states at once
    const statesToColor = [
        { code: 'fl', color: 'orange' },
        { code: 'az', color: 'purple' },
        { code: 'wa', color: 'pink' }
    ];
    
    statesToColor.forEach(({ code, color }) => {
        const state = gameModel.getState(code);
        if (state) {
            state.color(color);
            console.log(`✓ ${code.toUpperCase()}: ${color} (model data)`);
        }
    });
    
    // Example 5: Test getters
    if (ca) {
        console.log('\n--- California State Info (Model Data) ---');
        console.log('Code:', ca.code);
        console.log('Current color:', ca.getColor());
        console.log('Is guessed:', ca.getIsGuessed());
        console.log('Is highlighted:', ca.getIsHighlighted());
    }
    
    // Example 6: Reset a state after 3 seconds
    setTimeout(() => {
        if (ca) {
            console.log('\n--- Resetting California (Model Data) ---');
            ca.reset();
            console.log('✓ California reset to original state (model data)');
            console.log('💡 Run window.gameController.refreshView() to see visual update');
        }
    }, 3000);
    
    // Example 7: Reset all states after 5 seconds
    setTimeout(() => {
        console.log('\n--- Resetting All States (Model Data) ---');
        gameModel.resetAllStates();
        console.log('✓ All states reset (model data)');
        console.log('💡 Run window.gameController.refreshView() to see visual update');
    }, 5000);
    
    console.log('\n=== 🎮 SANDBOX TESTS COMPLETE ===');
    console.log('⚠️  Model data changed, but view NOT updated automatically!');
    console.log('💡 To see changes, run: window.gameController.refreshView()');
    console.log('💡 Or click any state to trigger a refresh\n');
}