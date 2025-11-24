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
import { applyClassicModeDeveloperFlags } from "../../sandbox";

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

		// Start multiplier decrease timer (Classic Mode specific)
		setInterval(() => {
			if (this.model.getIsGamePaused()) return;
			this.model.decreaseMultiplier();
			this.refreshView();
		}, 1000); // runs every 1000 ms (1 second)

		// Start game clock timer
		setInterval(() => {
			if (this.model.getIsGamePaused()) return;
			this.model.incrementGameClock();
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
