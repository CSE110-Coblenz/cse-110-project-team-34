/**
 * Cracked Mode Game Controller (Step 4: Extends BaseGameController)
 * Adds developer flags and game clock timer
 */

import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { BaseGameController } from "../../common/BaseGameController";
import { BaseGameModel } from "../../common/BaseGameModel";
import { BaseGameView } from "../../common/BaseGameView";
import { GameView } from "./crackedView";
import { GameModel } from "./crackedModel";
import { applyCrackedModeDeveloperFlags, crackedModePreGuessAllExceptCA } from "../../sandbox";

export class GameController extends BaseGameController {
	protected declare model: GameModel; // More specific type
	protected declare view: GameView; // More specific type

	/** Factory method: Create Cracked Mode specific model */
	protected createModel(): BaseGameModel {
		return new GameModel();
	}

	/** Factory method: Create Cracked Mode specific view */
	protected createView(stage: Konva.Stage, model: BaseGameModel): BaseGameView {
		return new GameView(stage, model as GameModel);
	}

	/** Hook: Cracked Mode specific setup */
	protected setupModeSpecificFeatures(): void {
		// Apply Cracked Mode developer flags AFTER pickRandomState (which resets colors)
		applyCrackedModeDeveloperFlags(this.model);

		// Ensure the initially selected state starts as "guessed" and remains that way
		// (skip when the developer flag for pre-guessing all except CA is active)
		if (!crackedModePreGuessAllExceptCA) {
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
					this.model.updateGuessableStates();
					this.refreshView();
				}
			}
		}

		// Start game clock timer (Cracked Mode specific)
		this.gameClockIntervalId = window.setInterval(() => {
			this.handleGameTick();
			this.refreshView();
		}, 1000); // runs every 1000 ms (1 second)
	}

	/** Hook: Cracked Mode does nothing special on correct answer */
	protected onCorrectAnswer(): void {
		// Cracked Mode doesn't have multipliers or special scoring
	}
}
