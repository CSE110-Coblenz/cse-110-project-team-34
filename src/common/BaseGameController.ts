import Konva from "konva";
import type { ScreenSwitcher } from "../types.ts";
import type { BaseGameModel } from "./BaseGameModel";
import type { BaseGameView } from "./BaseGameView";
import { GuessController } from "../Minigames/Guess/guessController";

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
    protected stage: Konva.Stage;
    
    private minigameCheckInterval: any;

    protected correctSound: HTMLAudioElement | null = null;
    protected wrongSound: HTMLAudioElement | null = null;
    

    constructor(screenSwitcher: ScreenSwitcher, stage: Konva.Stage) {
        this.screenSwitcher = screenSwitcher;
        this.stage = stage;

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

            // Preload Guess Audio
            this.correctSound = new Audio('/audio/correct.mp3');
            this.correctSound.load(); 
            this.wrongSound = new Audio('/audio/wrong.mp3');
            this.wrongSound.load();

            // Initialize model with state codes discovered by the view
            this.model.initializeStates(stateCodes, '#adeaffff');

            // Sync the view to reflect the model
            this.view.updateViewFromModel();

            // Set up callback for correct answers
            this.view.setOnCorrectAnswerCallback(() => this.whenCorrectAnswer());

            // Set up callback for wrong answers
            this.model.setOnWrongGuessCallback(() => this.whenWrongAnswer());

            // Pick a random state on load
            this.view.pickRandomState();

            // Mode-specific setup (timers, developer flags, etc.)
            this.setupModeSpecificFeatures();

            // Refresh view to show any changes from mode-specific setup
            this.refreshView();

            // Setup minigame popup listener
            const minigamePopup = this.view.getMinigamePopupElement();
            minigamePopup.addEventListener('click', () => {
                this.view.hideMinigamePopup();
                this.model.setGamePaused(false);
            });

        } catch (err) {
            console.error('❌ Failed to initialize GameController:', err);
        }
    }

    private setupMinigameTrigger(): void {
        // Check every 20 seconds
        this.minigameCheckInterval = setInterval(() => {
            if (this.model.getIsGamePaused()) return;
            if (this.model.getStatesGuessedCount() >= 50) return; // Game over

            // 25% chance to trigger minigame every 20 seconds
            if (Math.random() < 0.25) {
                this.triggerMinigame();
            }
        }, 20000);
    }

    private triggerMinigame(): void {
        console.log('🎲 Random Event! Triggering Guess Mini-game...');
        this.model.setGamePaused(true);

        new GuessController(this.stage, (score) => {
            console.log(`Mini-game complete. Score bonus: ${score}`);
            if (score > 0) {
                // Add 500 points to model score
                // Check if model has playerPoints (Classic Mode)
                if ('playerPoints' in this.model) {
                     // @ts-ignore
                    this.model.playerPoints += score;
                     // @ts-ignore
                    console.log(`Classic Points updated: ${this.model.playerPoints}`);
                } else {
                    this.model.score += score;
                }
            }
            
            // Resume game
            this.model.setGamePaused(false);
            
            // Refresh view to ensure everything is in sync
            this.refreshView();
        });
    }

    /** Shared win condition logic - same for all modes */
    protected checkWinCondition(): void {
        const statesGuessed = this.model.getStatesGuessedCount();
        if (statesGuessed >= 50) {
            console.log('🎉 All 50 states guessed! Transitioning to results screen...');
            // Use the number of states guessed as the score
            // In Classic Mode, we might want to use this.model.score instead?
            // BaseGameController uses statesGuessed by default.
            // If we want to preserve Classic Mode scoring (which uses multipliers), 
            // we should probably use this.model.score if it's higher/different.
            // BaseGameModel has score.
            
            const finalScore = Math.max(statesGuessed, this.model.score);
            
            // Transition to results screen
            const gameMode = this.model.getMode();
            this.screenSwitcher.switchToScreen({ type: "result", score: finalScore, mode: gameMode });
        }
    }

    /** Called when the player answers a state correctly */
    private whenCorrectAnswer(): void {
        // Delegate to child class for mode-specific behavior
        this.onCorrectAnswer();

        // Play sound effect
        this.playCorrectSound();

        // Play green pulse effect
        this.view.pulseMapSVGCorrect();

        // Refresh view to reflect changes
        this.refreshView();

        // Check win condition (same for all modes)
        this.checkWinCondition();
    }

    // Play audio on correct guess
    private playCorrectSound() {
        if (!this.correctSound) return;

        this.correctSound.currentTime = 0; // rewind instantly
        this.correctSound.play().catch(err =>
            console.warn('Could not play sound:', err)
        );
    }

    /** Called when the player answers a state wrongly */
    private whenWrongAnswer(): void {
    
        // Play sound effect
        this.playWrongSound();

        // Play red pulse effect
        this.view.pulseMapSVGWrong();

    }

    // Play audio on wrong guess
    private playWrongSound() {
        if (!this.wrongSound) return;
        this.wrongSound.currentTime = 0;
        this.wrongSound.play().catch(err =>
            console.warn('Could not play sound:', err)
        );
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
        if (this.minigameCheckInterval) {
            clearInterval(this.minigameCheckInterval);
        }
        this.view.destroy();
    }
}
