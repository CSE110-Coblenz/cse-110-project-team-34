/**
 * Practice Mode Game Controller (Step 4: Extends BaseGameController)
 * Minimal implementation - no scoring, no timers
 */

import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { BaseGameController } from "../../common/BaseGameController";
import { BaseGameModel } from "../../common/BaseGameModel";
import { BaseGameView } from "../../common/BaseGameView";
import { GameView } from "./practiceView";
import { GameModel } from "./practiceModel";
import { unlockClassicMode } from "../MenuScreen/MenuModel";

export class GameController extends BaseGameController {
    protected declare model: GameModel; // More specific type
    protected declare view: GameView; // More specific type

    /** Factory method: Create Practice Mode specific model */
    protected createModel(): BaseGameModel {
        return new GameModel();
    }

    /** Factory method: Create Practice Mode specific view */
    protected createView(stage: Konva.Stage, model: BaseGameModel): BaseGameView {
        return new GameView(stage, model as GameModel);
    }

    /** Hook: Practice Mode setup */
    protected setupModeSpecificFeatures(): void {
        console.log('✓ Practice Mode controller initialized');
    }

    /** Hook: Practice Mode does nothing on correct answer (no scoring) */
    protected onCorrectAnswer(): void {
        // Practice Mode doesn't award points or change multipliers
    }

    /** Unlock Classic Mode once Practice is fully completed */
    protected checkWinCondition(): void {
        if (this.model.getStatesGuessedCount() >= 50) {
            unlockClassicMode();
        }
        super.checkWinCondition();
    }
}
