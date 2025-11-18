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
        
        // Initialize the view (load images and map)
        this.initializeView();
        
        console.log('Practice Mode GameController initialized');
    }

    private async initializeView() {
        try {
            // Load images sequentially (background, overlay, etc.)
            await this.view.init();

            // Load the US map SVG
            const stateCodes = await this.view.loadMap('/Blank_US_Map_(states_only).svg');

            // Initialize model with state codes discovered by the view
            this.model.initializeStates(stateCodes, '#adeaffff');

            // Sync the view to reflect the model
            this.view.updateViewFromModel();

            // Set up callback for correct answers
            this.view.setOnCorrectAnswerCallback(() => this.whenCorrectAnswer());

            // Pick a random state on load
            this.view.pickRandomState();

            console.log('✓ Practice Mode view fully initialized');
        } catch (err) {
            console.error('❌ Failed to initialize Practice Mode GameController:', err);
        }
    }

    // Called when the player answers a state correctly
    whenCorrectAnswer(): void {
        // Check if all 50 states have been guessed (win condition)
        const statesGuessed = this.model.getStatesGuessedCount();
        if (statesGuessed >= 50) {
            console.log('🎉 All 50 states guessed! (Practice Mode)');
            // Could transition to results screen here
            // this.screenSwitcher.switchToScreen({ type: "result", score: statesGuessed });
        }
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
