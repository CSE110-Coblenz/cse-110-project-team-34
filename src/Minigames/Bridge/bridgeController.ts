// Handles user input, updates model, updates view

import { findShortestBridgeSize } from '../../utils/bridgeMinigameUtils';
import { stateAdjacencyList, stateNames } from '../../common/USMapData';
import { BridgeView } from '../Bridge/bridgeView';
import { BridgeModel } from '../Bridge/bridgeModel';
import {BaseGameModel} from '../../common/BaseGameModel';

export class BridgeController {
    private view: BridgeView;
    private model: BridgeModel;
    private baseModel: BaseGameModel;
    private currentAnswer: number = 0;
    private stateA: string = '';
    private stateB: string = '';
    private stateAName: string = '';
    private stateBName: string = '';


    constructor(view: BridgeView, model: BridgeModel, baseModel: BaseGameModel) {
        this.view = view;
        this.model = model;
        this.baseModel = baseModel;

        // Register callback for when user submits a guess
        this.view.onGuessSubmitted((guess: number) => this.checkGuess(guess));
    }
    
    pauseClock() {
        this.baseModel.pauseGameClock();
    }

    resumeClock() {
        this.baseModel.resumeGameClock();
    }


    /** Starts a new minigame round */
    startMinigame() {
        const states = Array.from(stateAdjacencyList.keys());

        let a: string;
        let b: string;

        do {
            a = states[Math.floor(Math.random() * states.length)];
        } while (a === "hi" || a === "ak"); // block Hawaii + Alaska

        do {
            b = states[Math.floor(Math.random() * states.length)];
        } while (
            b === a || b === "hi" || b === "ak" ||
            stateAdjacencyList.get(a)?.has(b) // block pairs that are neighbors
        );

        this.stateA = a;
        this.stateB = b;

        this.currentAnswer = findShortestBridgeSize(a, b);

        this.stateAName = stateNames.get(a) || a;
        this.stateBName = stateNames.get(b) || b;

        // this.baseModel.pauseGameClock();
        this.view.showMinigameQuestion(this.stateAName, this.stateBName);
    }


    /** Checks the player's guess */
    private checkGuess(userGuess: number) {
        const isCorrect = userGuess === this.currentAnswer;

        // Update model score
        if (isCorrect) this.model.incrementScore();
        else this.model.decrementScore();

        // Show result in the view
        this.view.showMinigameResult(isCorrect, this.currentAnswer);
        this.resumeClock();
    }
}
