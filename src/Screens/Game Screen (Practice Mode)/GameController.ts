import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { GameView } from "./GameView";
import { GameModel } from "./GameModel";

// Game Controller for Practice Mode
export class GameController {
    private screenSwitcher: ScreenSwitcher;
    private view: GameView;
    private model: GameModel;

    constructor(screenSwitcher: ScreenSwitcher, stage: Konva.Stage) {
        this.screenSwitcher = screenSwitcher;
        
        // Create the Model and View
        this.model = new GameModel();
        this.view = new GameView(stage, this.model);
        
        console.log('Practice Mode GameController initialized');
    }

    getView() {
        return this.view;
    }

    show(): void {
        this.view.show();
    }

    hide(): void {
        this.view.hide();
    }

    destroy(): void {
        this.view.destroy();
    }
}
