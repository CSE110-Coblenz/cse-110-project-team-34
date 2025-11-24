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
import { applyCrackedModeDeveloperFlags } from "../../sandbox";

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

		// Start game clock timer (Cracked Mode specific)
		setInterval(() => {
			if (this.model.getIsGamePaused()) return;
			this.model.incrementGameClock();
			this.refreshView();
		}, 1000); // runs every 1000 ms (1 second)
	}

	/** Hook: Cracked Mode does nothing special on correct answer */
	protected onCorrectAnswer(): void {
		// Cracked Mode doesn't have multipliers or special scoring
	}
}
