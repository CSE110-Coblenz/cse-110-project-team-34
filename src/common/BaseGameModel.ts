/**
 * BaseGameModel - Parent class containing shared game logic (Step 2: Generalization)
 * 
 * This base class implements the Template Method pattern, containing the ~80% shared logic
 * across Classic, Practice, and Cracked modes. Child classes override specific methods
 * for mode-specific behavior (like scoring in Classic Mode).
 * 
 * Applying "Generalization" via Module Structure (Chapter 1, Software Architecture in Practice)
 * to achieve Conceptual Integrity and reduce code duplication.
 */

import { State, stateNames, stateAdjacencyList } from './USMapData';

export abstract class BaseGameModel {
    // --- Responsive layout properties (shared UI configuration) ---
    baseBackgroundSrc: string = '';
    overlayBackgroundSrc: string = '';
    centerOverlay: boolean = true;
    
    private baseOverlayScaleX: number = 1.8;
    private baseOverlayScaleY: number = 1.6;
    
    get overlayScaleX(): number {
        return this.baseOverlayScaleX * (window.innerWidth / 1920);
    }
    
    get overlayScaleY(): number {
        return this.baseOverlayScaleY * (window.innerHeight / 1080);
    }
    
    private baseOverlayMapOffsetY: number = -90;
    
    get overlayMapOffsetY(): number {
        return this.baseOverlayMapOffsetY * (window.innerHeight / 1080);
    }
    
    set overlayMapOffsetY(value: number) {
        this.baseOverlayMapOffsetY = value * (1080 / window.innerHeight);
    }
    
    leftSideImageSrc: string = '';
    private baseLeftSideImageScaleX: number = 2;
    private baseLeftSideImageScaleY: number = 2;
    leftSideImageRotationDeg: number = -90;
    
    get leftSideImageScaleX(): number {
        return this.baseLeftSideImageScaleX * (window.innerWidth / 1920);
    }
    
    get leftSideImageScaleY(): number {
        return this.baseLeftSideImageScaleY * (window.innerHeight / 1080);
    }
    
    private baseLeftSideImageMarginLeft: number = -260;
    
    get leftSideImageMarginLeft(): number {
        return this.baseLeftSideImageMarginLeft * (window.innerWidth / 1920);
    }
    
    private baseLeftSideImageOffsetY: number = 90;
    
    get leftSideImageOffsetY(): number {
        return this.baseLeftSideImageOffsetY * (window.innerHeight / 1080);
    }
    
    set leftSideImageOffsetY(value: number) {
        this.baseLeftSideImageOffsetY = value * (1080 / window.innerHeight);
    }
    
    belowOverlayImageSrc: string = '';
    private baseBelowOverlayImageScaleX: number = 2;
    private baseBelowOverlayImageScaleY: number = 1.3;
    
    get belowOverlayImageScaleX(): number {
        return this.baseBelowOverlayImageScaleX * (window.innerWidth / 1920);
    }
    
    get belowOverlayImageScaleY(): number {
        return this.baseBelowOverlayImageScaleY * (window.innerHeight / 1080);
    }
    
    private baseBelowOverlayMarginTop: number = -25;
    
    get belowOverlayMarginTop(): number {
        return this.baseBelowOverlayMarginTop * (window.innerHeight / 1080);
    }

    // --- Game data (business logic) ---
    protected states: Map<string, State> = new Map();
    protected allStatesCodes: string[] = [];
    protected initialStateCode: string | null = null;
    protected hasGuessedFirstNeighbor: boolean = false;
    
    score: number = 0;
    timerSeconds: number = 0;
    gameClock: number = 0;
    
    protected isGamePaused: boolean = false;

    protected inputText: string = '';
    protected inputHistory: string[] = [];

    // --- State initialization and access ---
    initializeStates(stateCodes: string[], defaultColor: string = '#cccccc'): void {
        this.states.clear();
        this.allStatesCodes = [...stateCodes];
        stateCodes.forEach((code) => {
            const state = new State(code, defaultColor);
            this.states.set(code, state);
        });
        console.log(`Model initialized ${this.states.size} states`);
    }

    getState(stateName: string): State | undefined {
        return this.states.get(stateName);
    }

    getAllStates(): Map<string, State> {
        return this.states;
    }

    getAllStatesCodes(): string[] {
        return this.allStatesCodes;
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

    // --- Legacy method for compatibility ---
    guessState(stateAbbr: string): void {
        const s = this.states.get(stateAbbr);
        if (!s) return;
        if (!s.getIsGuessed()) {
            s.isGuessed(true);
            this.score += 1;
        }
    }

    // --- Game clock methods ---
    incrementGameClock(): void {
        if (!this.isGamePaused) {
            this.gameClock += 1000;
        }
    }

    getGameClock(): number {
        return this.gameClock;
    }

    // --- Pause state methods ---
    getIsGamePaused(): boolean {
        return this.isGamePaused;
    }

    setGamePaused(paused: boolean): void {
        this.isGamePaused = paused;
        console.log(`Game paused: ${paused}`);
    }

    // --- States guessed counter ---
    getStatesGuessedCount(): number {
        let count = 0;
        this.states.forEach((state) => {
            if (state.getIsGuessed()) {
                count++;
            }
        });
        return count;
    }

    public setHasGuessedFirstNeighbor(value: boolean): void {
        this.hasGuessedFirstNeighbor = value;
    }

    // --- Input text methods ---
    getInputText(): string {
        return this.inputText;
    }

    setInputText(text: string): void {
        const filtered = text.replace(/[^a-zA-Z ]/g, '').slice(0, 20);
        this.inputText = filtered;
    }

    clearInputText(): void {
        this.inputText = '';
    }

    submitInputText(): void {
        if (this.inputText.trim().length > 0) {
            this.inputHistory.push(this.inputText);
        }
        this.inputText = '';
    }

    addToHistory(text: string): void {
        if (text.trim().length > 0) {
            this.inputHistory.push(text);
        }
    }

    getInputHistory(): string[] {
        return this.inputHistory;
    }

    // --- State neighbor methods ---
    getNeighbors(stateCode: string): string[] {
        const neighbors = stateAdjacencyList.get(stateCode.toLowerCase());
        return neighbors ? Array.from(neighbors) : [];
    }

    isNeighbor(stateA: string, stateB: string): boolean {
        return stateAdjacencyList.get(stateA.toLowerCase())?.has(stateB.toLowerCase()) ?? false;
    }

    getStateName(stateCode: string): string | undefined {
        return stateNames.get(stateCode.toLowerCase());
    }

    getStateCodeByName(stateName: string): string | undefined {
        const lowerName = stateName.toLowerCase().trim();
        for (const [code, name] of stateNames.entries()) {
            if (name.toLowerCase() === lowerName) {
                return code;
            }
        }
        return undefined;
    }

    getCurrentStateCode(): string | null {
        return this.initialStateCode;
    }

    setCurrentState(stateCode: string): void {
        this.states.forEach((state) => {
            if (!state.getIsGuessed()) {
                state.color(state.originalColor);
            } else {
                state.color('#00ff00');
            }
        });

        this.initialStateCode = stateCode.toLowerCase();
        const initialState = this.states.get(this.initialStateCode);
        
        if (initialState) {
            initialState.color('pink');
            const neighbors = this.getNeighbors(this.initialStateCode);
            neighbors.forEach((neighborCode) => {
                const neighborState = this.states.get(neighborCode);
                if (neighborState && !neighborState.getIsGuessed()) {
                    neighborState.color('red');
                }
            });
        }
    }

    public updateGuessableStates(): void {
        if (this.hasGuessedFirstNeighbor && this.initialStateCode) {
            const initialState = this.states.get(this.initialStateCode);
            if (initialState && !initialState.getIsGuessed() && initialState.getColor() !== 'red') {
                initialState.color('red');
            }
        }

        this.states.forEach((state, code) => {
            if (state.getIsGuessed()) {
                const neighbors = this.getNeighbors(code);
                neighbors.forEach((neighborCode) => {
                    const neighborState = this.states.get(neighborCode);
                    if (neighborState && !neighborState.getIsGuessed() && neighborState.getColor() !== 'red') {
                        neighborState.color('red');
                    }
                });
            }
        });
    }

    /**
     * Template Method: Processes a guess using shared validation logic,
     * then delegates to mode-specific behavior via onCorrectGuess()
     */
    processGuess(guessedStateName: string): boolean {
        const guessedStateCode = this.getStateCodeByName(guessedStateName);
        if (!guessedStateCode) {
            console.log(`Unknown state name: ${guessedStateName}`);
            return false;
        }

        const guessedState = this.states.get(guessedStateCode);
        if (!guessedState) {
            return false;
        }

        if (guessedState.getIsGuessed()) {
            console.log(`${guessedStateName} was already guessed`);
            return false;
        }

        const currentColor = guessedState.getColor();
        
        if (!this.hasGuessedFirstNeighbor && guessedStateCode === this.initialStateCode) {
            console.log(`${guessedStateName} is the initial state and cannot be guessed yet. Guess a neighbor first!`);
            return false;
        }
        
        if (currentColor !== 'red') {
            console.log(`${guessedStateName} is not currently guessable (must be red)`);
            return false;
        }

        guessedState.isGuessed(true);
        guessedState.color('#00ff00');

        console.log(`✓ Correct! ${guessedStateName} guessed`);

        if (!this.hasGuessedFirstNeighbor) {
            this.hasGuessedFirstNeighbor = true;
            console.log('First neighbor guessed! Initial state is now guessable.');
        }

        // Call the hook for mode-specific behavior (Template Method pattern)
        this.onCorrectGuess(guessedStateName);

        this.updateGuessableStates();

        return true;
    }

    /**
     * Hook method for mode-specific behavior when a correct guess is made.
     * Override in child classes to implement scoring, multiplier, or other logic.
     */
    protected abstract onCorrectGuess(guessedStateName: string): void;

    /**
     * Reset game state - child classes must implement mode-specific resets.
     */
    abstract resetGame(): void;
}
