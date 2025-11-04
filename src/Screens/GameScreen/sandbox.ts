/**
 * SANDBOX FILE FOR TESTING STATE MANIPULATION
 * 
 * This file is isolated and won't interfere with production code.
 * Use this to test state methods and verify they work as expected.
 * 
 * To use this sandbox:
 * 1. Uncomment the import line in GameController.ts
 * 2. Uncomment the runSandbox(this.view) call
 * 3. Load the game screen and check console
 * 4. Comment out when done testing
 * 
 * Note: States are accessed by their 2-letter abbreviations (e.g., 'ca', 'tx', 'ny')
 */

import { GameView } from './GameView';

/**
 * Run sandbox tests on the GameView
 * This is your playground to test state manipulation
 */
export function runSandbox(gameView: GameView): void {
    console.log('\n=== 🎮 SANDBOX MODE ACTIVATED ===\n');
    
    // ====================================
    // TESTING AREA - MODIFY AS NEEDED
    // ====================================
    
    // Example 1: Change California to red
    const ca = gameView.getState('ca');
    if (ca) {
        ca.color('yellow');
        console.log('✓ California (ca): changed to red');
    }
    
    // Example 2: Mark Texas as guessed and make it blue
    const tx = gameView.getState('tx');
    if (tx) {
        tx.color('black').isGuessed(true);
        console.log('✓ Texas (tx): blue and marked as guessed');
    }
    
    // Example 3: Chain multiple methods on New York
    const ny = gameView.getState('ny');
    if (ny) {
        ny.color('green').isGuessed(true).highlight(true);
        console.log('✓ New York (ny): green, guessed, and highlighted');
    }
    
    // Example 4: Test multiple states at once
    const statesToColor = [
        { code: 'fl', color: 'orange' },
        { code: 'az', color: 'purple' },
        { code: 'wa', color: 'pink' }
    ];
    
    statesToColor.forEach(({ code, color }) => {
        const state = gameView.getState(code);
        if (state) {
            state.color(color);
            console.log(`✓ ${code.toUpperCase()}: ${color}`);
        }
    });
    
    // Example 5: Test getters
    if (ca) {
        console.log('\n--- California State Info ---');
        console.log('Name:', ca.name);
        console.log('Current color:', ca.getColor());
        console.log('Is guessed:', ca.getIsGuessed());
        console.log('Is highlighted:', ca.getIsHighlighted());
    }
    
    // Example 6: Reset a state after 3 seconds
    setTimeout(() => {
        if (ca) {
            console.log('\n--- Resetting California ---');
            ca.reset();
            console.log('✓ California reset to original state');
        }
    }, 3000);
    
    // Example 7: Reset all states after 5 seconds
    setTimeout(() => {
        console.log('\n--- Resetting All States ---');
        gameView.resetAllStates();
        console.log('✓ All states reset');
    }, 5000);
    
    console.log('\n=== 🎮 SANDBOX TESTS COMPLETE ===');
    console.log('Check the map to see visual changes!\n');
}
