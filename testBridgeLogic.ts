// import { findShortestBridgeSize } from './src/utils/bridgeMinigameUtils';
// import { stateAdjacencyList } from './src/common/USMapData';

// function testMinigameLogic() {
//     const states = Array.from(stateAdjacencyList.keys());

//     // Pick two random states
//     const stateA = states[Math.floor(Math.random() * states.length)];
//     let stateB: string;
//     do {
//         stateB = states[Math.floor(Math.random() * states.length)];
//     } while (stateB === stateA);

//     console.log(`Testing minigame logic: ${stateA.toUpperCase()} → ${stateB.toUpperCase()}`);

//     const answer = findShortestBridgeSize(stateA, stateB);
//     console.log(`Shortest bridge size (number of states in between): ${answer}`);

//     // Example "guess" test
//     const userGuess = answer; // correct guess
//     console.log(`User guessed ${userGuess}: ${userGuess === answer ? 'Correct' : 'Wrong'}`);

//     const wrongGuess = answer + 1;
//     console.log(`User guessed ${wrongGuess}: ${wrongGuess === answer ? 'Correct' : 'Wrong'}`);
// }

// testMinigameLogic();
