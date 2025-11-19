import Konva from "konva";
import type { ScreenSwitcher } from "../types.ts";
import type { BaseGameModel } from "./BaseGameModel";
import type { BaseGameView } from "./BaseGameView";

/**
 * BaseGameController - Shared controller logic for all game modes
 * 
 * Addresses "Conceptual Integrity" (Chapter 14) by normalizing the interface
 * between Controllers and Models/Views. Controllers now rely on polymorphism
 * (Model.onCorrectGuess()) instead of mode-specific forks.
 * 
 * Shared responsibilities:
 * - Initialize view (load images, load map SVG, sync model)
 * - Set up correct answer callback (delegates to whenCorrectAnswer)
 * - Pick random initial state
 * - Handle win condition check (50 states guessed)
 * - Manage screen lifecycle (show/hide/destroy)
 * - Expose refresh method for view updates
 * 
 * Child classes override:
 * - createModel(): Factory method for mode-specific model
 * - createView(): Factory method for mode-specific view
 * - setupModeSpecificFeatures(): Hook for mode-specific initialization
 * - onCorrectAnswer(): Hook for mode-specific behavior on correct guess
 */
export abstract class BaseGameController {
    protected screenSwitcher: ScreenSwitcher;
    protected view: BaseGameView;
    protected model: BaseGameModel;

    constructor(screenSwitcher: ScreenSwitcher, stage: Konva.Stage) {
        this.screenSwitcher = screenSwitcher;

        // Factory methods - child classes provide mode-specific implementations
        this.model = this.createModel();
        this.view = this.createView(stage, this.model);

        // Shared initialization flow
        this.initializeView();
    }

    /** Factory method: Child classes override to create mode-specific model */
    protected abstract createModel(): BaseGameModel;

    /** Factory method: Child classes override to create mode-specific view */
    protected abstract createView(stage: Konva.Stage, model: BaseGameModel): BaseGameView;

    /** Hook: Child classes override for mode-specific setup (timers, flags, etc.) */
    protected abstract setupModeSpecificFeatures(): void;

    /** Hook: Child classes override for mode-specific behavior on correct answer */
    protected abstract onCorrectAnswer(): void;

    /** Shared initialization flow - same for all modes */
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

            // Mode-specific setup (timers, developer flags, etc.)
            this.setupModeSpecificFeatures();

            // Refresh view to show any changes from mode-specific setup
            this.refreshView();

        } catch (err) {
            console.error('❌ Failed to initialize GameController:', err);
        }
    }

    /** Shared win condition logic - same for all modes */
    protected checkWinCondition(): void {
        const statesGuessed = this.model.getStatesGuessedCount();
        if (statesGuessed >= 50) {
            console.log('🎉 All 50 states guessed! Transitioning to results screen...');
            // Use the number of states guessed as the score
            const finalScore = statesGuessed;
            // Transition to results screen
            this.screenSwitcher.switchToScreen({ type: "result", score: finalScore });
        }
    }

    /** Called when the player answers a state correctly */
    private whenCorrectAnswer(): void {
        // Delegate to child class for mode-specific behavior
        this.onCorrectAnswer();

        // Refresh view to reflect changes
        this.refreshView();

        // Check win condition (same for all modes)
        this.checkWinCondition();
    }

    /** Expose a public method to refresh the view (useful for console debugging) */
    refreshView(): void {
        this.view.updateViewFromModel();
    }

    getView(): BaseGameView {
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
