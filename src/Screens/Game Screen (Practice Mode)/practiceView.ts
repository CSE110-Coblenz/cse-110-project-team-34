/**
 * Practice Mode Game View (Step 3: Extends BaseGameView)
 * Simplified view with no scoring displays - just the game basics
 */

import Konva from 'konva';
import { BaseGameView } from '../../common/BaseGameView';
import { GameModel } from './practiceModel';

export class GameView extends BaseGameView {
    protected declare model: GameModel;

    constructor(stage: Konva.Stage, model: GameModel) {
        super(stage, model);
        this.model = model;
        console.log('Practice Mode GameView initialized');
    }

    /** Show view */
    show(): void {
        super.show(); // Use base logic so shared UI (like the back button) toggles correctly
    }

    /** Hide view */
    hide(): void {
        super.hide();
    }
}
