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
        this.backgroundLayer.show();
        this.layer.show();
        if (this.inputTextLayer) this.inputTextLayer.show();
        if (this.historyLayer) this.historyLayer.show();
        if (this.svgContainer) this.svgContainer.style.visibility = 'visible';
    }

    /** Hide view */
    hide(): void {
        this.backgroundLayer.hide();
        this.layer.hide();
        if (this.inputTextLayer) this.inputTextLayer.hide();
        if (this.historyLayer) this.historyLayer.hide();
        if (this.svgContainer) this.svgContainer.style.visibility = 'hidden';
    }
}

