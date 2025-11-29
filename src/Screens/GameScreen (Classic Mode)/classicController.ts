/**
 * Classic Mode Game Controller (Step 4: Extends BaseGameController)
 * Adds multiplier management and developer console access
 */

import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { BaseGameController } from "../../common/BaseGameController";
import { BaseGameModel } from "../../common/BaseGameModel";
import { BaseGameView } from "../../common/BaseGameView";
import { GameView } from "./classicView";
import { GameModel } from "./classicModel";
import { applyClassicModeDeveloperFlags, classicModePreGuessAllExceptCA } from "../../sandbox";

export class GameController extends BaseGameController {
	protected declare model: GameModel; // More specific type
	protected declare view: GameView; // More specific type

	/** Factory method: Create Classic Mode specific model */
	protected createModel(): BaseGameModel {
		return new GameModel();
	}

	/** Factory method: Create Classic Mode specific view */
	protected createView(stage: Konva.Stage, model: BaseGameModel): BaseGameView {
		return new GameView(stage, model as GameModel);
	}

	/** Hook: Classic Mode specific setup */
	protected setupModeSpecificFeatures(): void {
		// Apply Classic Mode developer flags AFTER pickRandomState (which resets colors)
		applyClassicModeDeveloperFlags(this.model);

		// Ensure the initially selected state starts as "guessed" and remains that way
		// (skip when the developer flag for pre-guessing all except CA is active)
		if (!classicModePreGuessAllExceptCA) {
			const initialCode = this.model.getCurrentStateCode();
			if (initialCode) {
				const initialState = this.model.getState(initialCode);
				if (initialState && !initialState.getIsGuessed()) {
					initialState.isGuessed(true).color('#00ff00');
					// Also add the starting state to the guessed history list
					const initialName = this.model.getStateName(initialCode);
					if (initialName) {
						this.model.addToHistory(initialName.toLowerCase());
					}
					// Propagate neighbor guessable state and refresh view immediately
					this.model.updateGuessableStates();
					this.refreshView();
				}
			}
		}

		// Start multiplier decrease timer (Classic Mode specific)
		setInterval(() => {
			if (this.model.getIsGamePaused()) return;
			this.model.decreaseMultiplier();
			this.refreshView();
		}, 1000); // runs every 1000 ms (1 second)

		// Start game clock timer
		setInterval(() => {
			this.handleGameTick();
			this.refreshView();
		}, 1000); // runs every 1000 ms (1 second)

		// Expose for console debugging (Classic Mode specific)
		(window as any).gameModel = this.model;
		console.log('💡 Access gameModel in console: window.gameModel');
		console.log('💡 Example: window.gameModel.getState("ca")?.color("red")');
		console.log('💡 After changing model, call: window.gameController.refreshView()');
		(window as any).gameController = this;
	}

	/** Hook: Classic Mode behavior on correct answer */
	protected onCorrectAnswer(): void {
		// Increase multiplier on correct answer (Classic Mode specific)
		this.model.increaseMultiplier();
	}
}
