import { findShortestBridgeSize } from '../../utils/bridgeMinigameUtils';
import { stateAdjacencyList } from '../../common/USMapData';
import { BridgeView } from '../Bridge/bridgeView';
import { BridgeModel } from '../Bridge/bridgeModel';

export class BridgeController {
    private view: BridgeView;
    private model: BridgeModel;
    private currentAnswer: number = 0;
    private stateA: string = '';
    private stateB: string = '';

    constructor(view: BridgeView, model: BridgeModel) {
        this.view = view;
        this.model = model;

        // Register callback for when user submits a guess
        this.view.onGuessSubmitted((guess: number) => this.checkGuess(guess));
    }

    /** Starts a new minigame round */
    startMinigame() {
        const states = Array.from(stateAdjacencyList.keys());

        // Pick two random states (avoid same state twice)
        this.stateA = states[Math.floor(Math.random() * states.length)];
        do {
            this.stateB = states[Math.floor(Math.random() * states.length)];
        } while (this.stateB === this.stateA);

        // Compute answer using the util
        this.currentAnswer = findShortestBridgeSize(this.stateA, this.stateB);

        // Show question in the view
        this.view.showMinigameQuestion(this.stateA, this.stateB);
    }

    /** Checks the player's guess */
    private checkGuess(userGuess: number) {
        const isCorrect = userGuess === this.currentAnswer;

        // Update model score
        if (isCorrect) this.model.incrementScore();
        else this.model.decrementScore();

        // Show result in the view
        this.view.showMinigameResult(isCorrect, this.currentAnswer);
    }
}
