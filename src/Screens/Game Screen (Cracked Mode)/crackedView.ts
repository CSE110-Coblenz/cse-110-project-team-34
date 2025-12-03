/**
 * Cracked Mode Game View (Step 3: Extends BaseGameView)
 * Adds lose popup and developer features specific to Cracked Mode
 */

import Konva from 'konva';
import { BaseGameView } from '../../common/BaseGameView';
import { GameModel } from './crackedModel';
import { crackedModeShowGameClock, crackedModeShowInputLabel, crackedModeAllowStateClicking, crackedModeShowStatesGuessed } from '../../sandbox';

export class GameView extends BaseGameView {
    protected declare model: GameModel;
    private uiLayer: Konva.Layer;
    
    // Developer features
    private gameClockContainer: HTMLDivElement | null = null;
    private animatedClockValue: number = 0;
    private clockAnimationFrameId: number | null = null;
    private statesGuessedContainer: HTMLDivElement | null = null;
    private inputLabelContainer: HTMLDivElement | null = null;
    
    // Lose popup
    private losePopupContainer: HTMLDivElement | null = null;

    constructor(stage: Konva.Stage, model: GameModel) {
        super(stage, model);
        this.model = model;
        
        // Create UI layer
        this.uiLayer = new Konva.Layer();
        this.stage.add(this.uiLayer);
        
        // Initialize developer features if enabled
        if (crackedModeShowGameClock) {
            this.initializeGameClock();
        }
        if (crackedModeShowStatesGuessed) {
            this.initializeStatesGuessed();
        }
        if (crackedModeShowInputLabel) {
            this.initializeInputLabel();
        }
        
        console.log('Cracked Mode GameView initialized');
    }

    /** Initialize game clock display (developer feature) */
    private initializeGameClock(): void {
        this.gameClockContainer = document.createElement('div');
        this.gameClockContainer.id = 'game-clock-display';
        this.gameClockContainer.style.position = 'absolute';
        this.gameClockContainer.style.color = '#ffff00'; // Yellow
        this.gameClockContainer.style.backgroundColor = '#000000'; // Black background
        this.gameClockContainer.style.padding = '5px 10px';
        this.gameClockContainer.style.fontFamily = 'Arial';
        this.gameClockContainer.style.fontWeight = 'bold';
        this.gameClockContainer.style.zIndex = '10000'; // Very high z-index to be on top
        this.gameClockContainer.style.pointerEvents = 'none'; // Don't block clicks
        this.gameClockContainer.textContent = '(Developer View) GameClock: 0';
        document.body.appendChild(this.gameClockContainer);
        
        // Position responsively
        this.repositionGameClock();
        
        // Start continuous animation loop for smooth clock
        this.startGameClockAnimation();
    }
    
    /** Reposition game clock based on window size */
    private repositionGameClock(): void {
        if (this.gameClockContainer) {
            // Position in top-left corner with responsive offset
            const topOffset = window.innerHeight * 0.02;
            const leftOffset = window.innerWidth * 0.02;
            this.gameClockContainer.style.top = `${topOffset}px`;
            this.gameClockContainer.style.left = `${leftOffset}px`;
            
            // Responsive font size
            const fontSize = Math.max(14, window.innerHeight * 0.02);
            this.gameClockContainer.style.fontSize = `${fontSize}px`;
        }
    }
    
    /** Start continuous animation loop for game clock */
    private startGameClockAnimation(): void {
        let lastFrameTime = performance.now();
        
        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;
            
            const targetValue = this.model.getGameClock();
            
            // Always increment by approximately 1ms per millisecond of real time
            // This ensures smooth counting
            if (this.animatedClockValue < targetValue) {
                this.animatedClockValue += deltaTime;
                // Clamp to target to avoid overshooting
                if (this.animatedClockValue > targetValue) {
                    this.animatedClockValue = targetValue;
                }
            } else {
                this.animatedClockValue = targetValue;
            }
            
            // Update display with animated value (in milliseconds)
            if (this.gameClockContainer) {
                this.gameClockContainer.textContent = `(Developer View) GameClock: ${Math.floor(this.animatedClockValue)}`;
            }
            
            // Continue animation
            this.clockAnimationFrameId = requestAnimationFrame(animate);
        };
        
        animate(performance.now());
    }

    /** Initialize states guessed counter (developer feature) */
    private initializeStatesGuessed(): void {
        this.statesGuessedContainer = document.createElement('div');
        this.statesGuessedContainer.id = 'states-guessed-display';
        this.statesGuessedContainer.style.position = 'absolute';
        this.statesGuessedContainer.style.color = '#ffff00'; // Yellow
        this.statesGuessedContainer.style.backgroundColor = '#000000'; // Black background
        this.statesGuessedContainer.style.padding = '5px 10px';
        this.statesGuessedContainer.style.fontFamily = 'Arial';
        this.statesGuessedContainer.style.fontWeight = 'bold';
        this.statesGuessedContainer.style.zIndex = '10000'; // Very high z-index to be on top
        this.statesGuessedContainer.style.pointerEvents = 'none'; // Don't block clicks
        this.statesGuessedContainer.textContent = `(Developer View) States Guessed: ${this.model.getStatesGuessedCount()}`;
        document.body.appendChild(this.statesGuessedContainer);
        
        // Position below the game clock
        this.repositionStatesGuessed();
    }
    
    /** Reposition states guessed counter below game clock */
    private repositionStatesGuessed(): void {
        if (this.statesGuessedContainer) {
            // Position below game clock with responsive offset
            const topOffset = window.innerHeight * 0.02;
            const leftOffset = window.innerWidth * 0.02;
            
            // Calculate position below game clock
            const clockHeight = crackedModeShowGameClock && this.gameClockContainer 
                ? this.gameClockContainer.offsetHeight 
                : 0;
            const gap = 5; // 5px gap between clock and counter
            
            this.statesGuessedContainer.style.left = `${leftOffset}px`;
            this.statesGuessedContainer.style.top = `${topOffset + clockHeight + gap}px`;
            
            // Responsive font size
            const fontSize = Math.max(14, window.innerHeight * 0.02);
            this.statesGuessedContainer.style.fontSize = `${fontSize}px`;
        }
    }

    /** Initialize input label (developer feature) */
    private initializeInputLabel(): void {
        this.inputLabelContainer = document.createElement('div');
        this.inputLabelContainer.id = 'input-label-display';
        this.inputLabelContainer.style.position = 'absolute';
        this.inputLabelContainer.style.color = '#ffff00'; // Yellow
        this.inputLabelContainer.style.backgroundColor = '#000000'; // Black background
        this.inputLabelContainer.style.padding = '5px 10px';
        this.inputLabelContainer.style.fontFamily = 'Arial';
        this.inputLabelContainer.style.fontWeight = 'bold';
        this.inputLabelContainer.style.zIndex = '10000'; // Very high z-index to be on top
        this.inputLabelContainer.style.pointerEvents = 'none'; // Don't block clicks
        this.inputLabelContainer.textContent = '(Developer View) Enter text below';
        document.body.appendChild(this.inputLabelContainer);
    }

    /** Override: Set up click handlers if developer flag is enabled */
    protected setupStatePathInteraction(path: SVGPathElement, stateCode: string): void {
        if (crackedModeAllowStateClicking) {
            path.addEventListener('click', () => this.handleStateClick(stateCode));
            path.style.cursor = 'pointer';
        }
    }

    /** Override: Handle window resize to reposition developer elements */
    protected handleResize(): void {
        super.handleResize();
        
        // Reposition developer elements if they exist
        if (crackedModeShowGameClock) {
            this.repositionGameClock();
        }
        if (crackedModeShowStatesGuessed) {
            this.repositionStatesGuessed();
        }
    }

    /** Override: Update input text display and position input label */
    protected updateInputTextDisplay(): void {
        super.updateInputTextDisplay();
        
        // Position the input label above the input box
        if (crackedModeShowInputLabel && this.inputLabelContainer && this.belowOverlayImage) {
            const below = this.belowOverlayImage;
            const imgX = below.x();
            const imgY = below.y();
            const imgWidth = below.width() * below.scaleX();
            const imgHeight = below.height() * below.scaleY();
            
            const labelFontSize = Math.max(12, imgHeight * 0.3);
            this.inputLabelContainer.style.fontSize = `${labelFontSize}px`;
            this.inputLabelContainer.style.left = `${imgX}px`;
            this.inputLabelContainer.style.top = `${imgY - labelFontSize - 20}px`; // Above the image with gap
            this.inputLabelContainer.style.width = `${imgWidth}px`;
            this.inputLabelContainer.style.textAlign = 'center';
        }
    }

    /** Handle state click (developer feature) */
    private handleStateClick(stateCode: string): void {
        console.log(`🖱️ Clicked on state: ${stateCode}`);
        this.model.setCurrentState(stateCode);
        this.updateViewFromModel();
    }

    /** Override: Update mode-specific displays */
    updateViewFromModel(): void {
        // Call parent to update map colors and input/history
        super.updateViewFromModel();
        
        // Update game clock display (if enabled)
        if (crackedModeShowGameClock) {
            this.refreshGameClock();
        }

        // Update states guessed display (if enabled)
        if (crackedModeShowStatesGuessed) {
            this.refreshStatesGuessed();
        }
    }

    /** Override: Handle keyboard input with validation for Cracked Mode */
    protected handleKeyPress(e: KeyboardEvent): void {
        // Only handle if the game view is visible
        if (this.backgroundLayer.isVisible() === false) return;

        if (e.key === 'Enter') {
            // Process the guess before adding to history
            const inputText = this.model.getInputText();
            if (inputText.trim().length > 0) {
                // Check if it's a valid state name first (Cracked Mode specific)
                if (!this.model.isValidStateName(inputText)) {
                    // Show lose popup for invalid state name
                    this.showLosePopup();
                    this.model.clearInputText();
                    this.refreshInputText();
                    return;
                }
                
                const isCorrect = this.model.processGuess(inputText);
                
                if (isCorrect) {
                    // Call the callback to notify controller of correct answer
                    if (this.onCorrectAnswerCallback) {
                        this.onCorrectAnswerCallback();
                    }
                    // Only add to history if correct (as lowercase)
                    this.model.addToHistory(inputText.toLowerCase());
                    this.updateViewFromModel(); // Update colors
                    this.refreshHistory();
                }
                // If incorrect, don't add to history
            }
            // Always clear the input text after Enter
            this.model.clearInputText();
            this.refreshInputText();
        } else if (e.key === 'Backspace') {
            // Remove last character
            const currentText = this.model.getInputText();
            this.model.setInputText(currentText.slice(0, -1));
            this.refreshInputText();
        } else if (e.key.length === 1 && /[a-zA-Z ]/.test(e.key)) {
            // Add the character (allowing spaces for state names like "New York")
            const currentText = this.model.getInputText();
            this.model.setInputText(currentText + e.key);
            this.refreshInputText();
        }
    }

    /** Show lose popup */
    showLosePopup(): void {
        if (this.losePopupContainer) return; // Already showing

        this.losePopupContainer = document.createElement('div');
        this.losePopupContainer.style.position = 'fixed';
        this.losePopupContainer.style.top = '0';
        this.losePopupContainer.style.left = '0';
        this.losePopupContainer.style.width = '100%';
        this.losePopupContainer.style.height = '100%';
        this.losePopupContainer.style.display = 'flex';
        this.losePopupContainer.style.justifyContent = 'center';
        this.losePopupContainer.style.alignItems = 'center';
        this.losePopupContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.losePopupContainer.style.zIndex = '10000';
        this.losePopupContainer.style.pointerEvents = 'all';

        const popup = document.createElement('div');
        popup.style.fontSize = '48px';
        popup.style.fontWeight = 'bold';
        popup.style.color = 'white';
        popup.style.textAlign = 'center';
        popup.textContent = 'you lose :(';

        this.losePopupContainer.appendChild(popup);
        document.body.appendChild(this.losePopupContainer);
        
        // Prevent any clicks from going through
        this.losePopupContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
        
        // Disable keyboard input
        window.addEventListener('keydown', (e) => {
            e.stopPropagation();
            e.preventDefault();
        }, true);
    }

    /** Refresh game clock display */
    refreshGameClock(): void {
        // The continuous animation loop handles the display update
        // This method is kept for compatibility but does nothing
    }

    /** Refresh states guessed counter */
    refreshStatesGuessed(): void {
        if (this.statesGuessedContainer) {
            this.statesGuessedContainer.textContent = `(Developer View) States Guessed: ${this.model.getStatesGuessedCount()}`;
        }
    }

    /** Show view */
    show(): void {
        super.show();
        if (this.uiLayer) this.uiLayer.show();
        if (this.gameClockContainer) this.gameClockContainer.style.display = 'block';
        if (this.statesGuessedContainer) this.statesGuessedContainer.style.display = 'block';
        if (this.inputLabelContainer) this.inputLabelContainer.style.display = 'block';
    }

    /** Hide view */
    hide(): void {
        super.hide();
        if (this.uiLayer) this.uiLayer.hide();
        if (this.gameClockContainer) this.gameClockContainer.style.display = 'none';
        if (this.statesGuessedContainer) this.statesGuessedContainer.style.display = 'none';
        if (this.inputLabelContainer) this.inputLabelContainer.style.display = 'none';
    }

    /** Cleanup */
    destroy(): void {
        super.destroy();
        if (this.uiLayer) this.uiLayer.destroy();
        if (this.gameClockContainer) document.body.removeChild(this.gameClockContainer);
        if (this.statesGuessedContainer) document.body.removeChild(this.statesGuessedContainer);
        if (this.inputLabelContainer) document.body.removeChild(this.inputLabelContainer);
        if (this.losePopupContainer) document.body.removeChild(this.losePopupContainer);
        if (this.clockAnimationFrameId) cancelAnimationFrame(this.clockAnimationFrameId);
    }
}
