import { MULTIPLIER } from '../../gameConstants';

// Pure data state - no DOM manipulation (Model should only hold data)
export class State {
    public code: string; // 2-letter state code (e.g., 'ca', 'tx')
    public originalColor: string;
    private _currentColor: string;
    private _isGuessed: boolean = false;
    private _isHighlighted: boolean = false;

    constructor(code: string, originalColor: string = '#cccccc') {
        this.code = code;
        this.originalColor = originalColor;
        this._currentColor = originalColor;
    }

    // Chainable method to set color (pure data, no DOM)
    color(newColor: string): State {
        this._currentColor = newColor;
        return this;
    }

    // Chainable method to set isGuessed
    isGuessed(guessed: boolean): State {
        this._isGuessed = guessed;
        return this;
    }

    // Chainable method to set highlight
    highlight(highlighted: boolean): State {
        this._isHighlighted = highlighted;
        return this;
    }

    // Getter for current color
    getColor(): string {
        return this._currentColor;
    }

    // Getter for isGuessed
    getIsGuessed(): boolean {
        return this._isGuessed;
    }

    // Getter for isHighlighted
    getIsHighlighted(): boolean {
        return this._isHighlighted;
    }

    // Reset to original state
    reset(): State {
        this._currentColor = this.originalColor;
        this._isGuessed = false;
        this._isHighlighted = false;
        return this;
    }

    // Set a new original color (accepts HEX, rgb, or named colors)
    setOriginalColor(newColor: string): State {
        this.originalColor = newColor;
        this._currentColor = newColor;
        return this;
    }
}

export class GameModel {
    // Base background image (Game screen)
    baseBackgroundSrc: string = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/desk image.jpg';

    // Secondary background (overlay) image on top of the base background
    overlayBackgroundSrc: string = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/10 Calander/1.png';

    // Overlay scale (use 1,1 for natural size)
    overlayScaleX: number = 1.8;
    overlayScaleY: number = 1.6;

    // Whether to center the overlay after loading
    centerOverlay: boolean = true;

    // Vertical offset to apply to the OVERLAY background and the US SVG map (base background does not move)
    // Negative moves up, positive moves down
    overlayMapOffsetY: number = -90;

    // Additional left-side image configuration
    leftSideImageSrc: string = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/1.png';
    leftSideImageScaleX: number = 2;
    leftSideImageScaleY: number = 2;
    // Rotate -90 (counter-clockwise) before adding
    leftSideImageRotationDeg: number = -90;
    // Margin from the left edge when positioned
    leftSideImageMarginLeft: number = -260;
    // Vertical offset (px) to move the left-side image up/down (independent of overlay/map)
    leftSideImageOffsetY: number = 90;

    // Image to place below the secondary (overlay) background
    belowOverlayImageSrc: string = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/2.png';
    belowOverlayImageScaleX: number = 2;
    belowOverlayImageScaleY: number = 1.3;
    // Vertical gap between overlay bottom and this image's top
    belowOverlayMarginTop: number = -25;

    // --- Game data (business logic) ---
    private states: Map<string, State> = new Map();
    score: number = 0;
    timerSeconds: number = 0;
    private multiplier: number = MULTIPLIER.STARTING_VALUE;
    private inputText: string = '';
    private inputHistory: string[] = [];

    /** Initialize states from a list of state codes. */
    initializeStates(stateCodes: string[], defaultColor: string = '#cccccc'): void {
        this.states.clear();
        stateCodes.forEach((code) => {
            const state = new State(code, defaultColor);
            this.states.set(code, state);
        });
        console.log(`Model initialized ${this.states.size} states`);
    }

    // --- State access/manipulation ---
    getState(stateName: string): State | undefined {
        return this.states.get(stateName);
    }

    getAllStates(): Map<string, State> {
        return this.states;
    }

    resetAllStates(): void {
        this.states.forEach((s) => s.reset());
    }

    setAllStatesOriginalColor(color: string): void {
        this.states.forEach((s) => s.setOriginalColor(color));
        console.log(`✓ Model: set original color for all ${this.states.size} states to: ${color}`);
    }

    setAllStatesColor(color: string): void {
        this.states.forEach((s) => s.color(color));
        console.log(`✓ Model: set current color for all ${this.states.size} states to: ${color}`);
    }

    // --- Game actions ---
    guessState(stateAbbr: string): void {
        const s = this.states.get(stateAbbr);
        if (!s) return;
        if (!s.getIsGuessed()) {
            s.isGuessed(true);
            this.score += 1;
        }
    }

    resetGame(): void {
        this.score = 0;
        this.timerSeconds = 0;
        this.multiplier = MULTIPLIER.STARTING_VALUE;
        this.resetAllStates();
    }

    // --- Multiplier methods ---
    getMultiplier(): number {
        return this.multiplier;
    }

    increaseMultiplier(): void {
        this.multiplier += MULTIPLIER.INCREMENT_AMOUNT;
    }

    decreaseMultiplier(): void {
        this.multiplier = Math.max(MULTIPLIER.FLOOR_VALUE, this.multiplier - MULTIPLIER.RATE_OF_DECREASING_MULTIPLIER);
    }

    // --- Input text methods ---
    getInputText(): string {
        return this.inputText;
    }

    setInputText(text: string): void {
        // Only allow English letters, max 13 characters
        const filtered = text.replace(/[^a-zA-Z]/g, '').slice(0, 13);
        this.inputText = filtered;
    }

    clearInputText(): void {
        this.inputText = '';
    }

    submitInputText(): void {
        // Add current input to history if it's not empty
        if (this.inputText.trim().length > 0) {
            this.inputHistory.push(this.inputText);
        }
        this.inputText = '';
    }

    getInputHistory(): string[] {
        return this.inputHistory;
    }
}
