/**
 * Classic Mode Game View (Step 3: Extends BaseGameView)
 * Adds multiplier and player points displays specific to Classic Mode
 */

import Konva from 'konva';
import { BaseGameView } from '../../common/BaseGameView';
import { GameModel } from './classicModel';
import { classicModeShowGameClock, classicModeShowInputLabel, classicModeAllowStateClicking, classicModeShowStatesGuessed } from '../../sandbox';

export class GameView extends BaseGameView {
    protected declare model: GameModel; // More specific type
    private uiLayer: Konva.Layer;
    
    // Classic Mode specific UI
    private multiplierLayer!: Konva.Layer;
    private multiplierText!: Konva.Text;
    private playerPointsLayer!: Konva.Layer;
    private playerPointsText!: Konva.Text;
    
    // Developer features
    private gameClockContainer: HTMLDivElement | null = null;
    private animatedClockValue: number = 0;
    private clockAnimationFrameId: number | null = null;
    private statesGuessedContainer: HTMLDivElement | null = null;
    private inputLabelContainer: HTMLDivElement | null = null;

    constructor(stage: Konva.Stage, model: GameModel) {
        super(stage, model);
        this.model = model;
        
        // Create UI layer for Classic Mode specific elements
        this.uiLayer = new Konva.Layer();
        this.stage.add(this.uiLayer);
        
        // Initialize Classic Mode specific displays
        this.initializeMultiplier();
        this.initializePlayerPoints();
        
        // Initialize developer features if enabled
        if (classicModeShowGameClock) {
            this.initializeGameClock();
        }
        if (classicModeShowStatesGuessed) {
            this.initializeStatesGuessed();
        }
        if (classicModeShowInputLabel) {
            this.initializeInputLabel();
        }
        
        console.log('Classic Mode GameView initialized');
    }

    /** Override: Set up click handlers if developer flag is enabled */
    protected setupStatePathInteraction(path: SVGPathElement, stateCode: string): void {
        if (classicModeAllowStateClicking) {
            path.addEventListener('click', () => this.handleStateClick(stateCode));
            path.style.cursor = 'pointer';
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
        
        // Update multiplier display
        this.refreshMultiplier();

        // Update player points display
        this.refreshPlayerPoints();

        // Update game clock display (if enabled)
        if (classicModeShowGameClock) {
            this.refreshGameClock();
        }

        // Update states guessed display (if enabled)
        if (classicModeShowStatesGuessed) {
            this.refreshStatesGuessed();
        }
    }

    /** Initialize multiplier display */
    private initializeMultiplier(): void {
        this.multiplierLayer = new Konva.Layer();
        this.stage.add(this.multiplierLayer);

        this.multiplierText = new Konva.Text({
            x: this.stage.width() - 120,
            y: 80,
            text: `${this.model.getMultiplier().toFixed(1)}x`,
            fontSize: 50,
            fontFamily: 'Times New Roman',
            fill: 'white',
            align: 'right',
        });

        this.multiplierLayer.add(this.multiplierText);
    }

    /** Initialize player points display */
    private initializePlayerPoints(): void {
        this.playerPointsLayer = new Konva.Layer();
        this.stage.add(this.playerPointsLayer);

        this.playerPointsText = new Konva.Text({
            x: this.stage.width() - 120,
            y: 20,
            text: `${this.model.getPlayerPoints()}`,
            fontSize: 50,
            fontFamily: 'Times New Roman',
            fill: 'white',
            align: 'right',
        });

        this.playerPointsLayer.add(this.playerPointsText);
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
            // Position clock relative to window size (1% from top and left)
            const topOffset = window.innerHeight * 0.01;
            const leftOffset = window.innerWidth * 0.01;
            this.gameClockContainer.style.top = `${topOffset}px`;
            this.gameClockContainer.style.left = `${leftOffset}px`;
            
            // Scale font size based on window height
            const fontSize = Math.max(16, window.innerHeight * 0.025);
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
            // Position below game clock
            const topOffset = window.innerHeight * 0.01;
            const leftOffset = window.innerWidth * 0.01;
            
            // Calculate position below game clock
            const clockHeight = classicModeShowGameClock && this.gameClockContainer 
                ? this.gameClockContainer.offsetHeight 
                : 0;
            const gap = 5; // 5px gap between clock and counter
            
            this.statesGuessedContainer.style.left = `${leftOffset}px`;
            this.statesGuessedContainer.style.top = `${topOffset + clockHeight + gap}px`;
            
            // Scale font size based on window height
            const fontSize = Math.max(16, window.innerHeight * 0.025);
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

    /** Override: Handle window resize to reposition developer elements */
    protected handleResize(): void {
        super.handleResize();
        
        // Reposition developer elements if they exist
        if (classicModeShowGameClock) {
            this.repositionGameClock();
        }
        if (classicModeShowStatesGuessed) {
            this.repositionStatesGuessed();
        }
    }

    /** Override: Update input text display and position input label */
    protected updateInputTextDisplay(): void {
        super.updateInputTextDisplay();
        
        // Position the input label above the input box
        if (classicModeShowInputLabel && this.inputLabelContainer && this.belowOverlayImage) {
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

    /** Refresh multiplier display */
    refreshMultiplier(): void {
        if (this.multiplierText) {
            this.multiplierText.text(`${this.model.getMultiplier().toFixed(1)}x`);
            this.multiplierLayer.batchDraw();
        }
    }

    /** Refresh player points display */
    refreshPlayerPoints(): void {
        if (this.playerPointsText) {
            this.playerPointsText.text(`${this.model.getPlayerPoints()}`);
            this.playerPointsLayer.batchDraw();
        }
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
        if (this.multiplierLayer) this.multiplierLayer.show();
        if (this.playerPointsLayer) this.playerPointsLayer.show();
        if (this.uiLayer) this.uiLayer.show();
        if (this.gameClockContainer) this.gameClockContainer.style.display = 'block';
        if (this.statesGuessedContainer) this.statesGuessedContainer.style.display = 'block';
        if (this.inputLabelContainer) this.inputLabelContainer.style.display = 'block';
    }

    /** Hide view */
    hide(): void {
        super.hide();
        if (this.multiplierLayer) this.multiplierLayer.hide();
        if (this.playerPointsLayer) this.playerPointsLayer.hide();
        if (this.uiLayer) this.uiLayer.hide();
        if (this.gameClockContainer) this.gameClockContainer.style.display = 'none';
        if (this.statesGuessedContainer) this.statesGuessedContainer.style.display = 'none';
        if (this.inputLabelContainer) this.inputLabelContainer.style.display = 'none';
    }

    /** Cleanup */
    destroy(): void {
        super.destroy();
        if (this.multiplierLayer) this.multiplierLayer.destroy();
        if (this.playerPointsLayer) this.playerPointsLayer.destroy();
        if (this.uiLayer) this.uiLayer.destroy();
        if (this.gameClockContainer) document.body.removeChild(this.gameClockContainer);
        if (this.statesGuessedContainer) document.body.removeChild(this.statesGuessedContainer);
        if (this.inputLabelContainer) document.body.removeChild(this.inputLabelContainer);
        if (this.clockAnimationFrameId) cancelAnimationFrame(this.clockAnimationFrameId);
    }
}
