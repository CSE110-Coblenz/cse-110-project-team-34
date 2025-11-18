/**
 * Mapping from state abbreviation (lowercase) to full state name.
 */
const stateNames = new Map<string, string>([
  ["al", "Alabama"], ["ak", "Alaska"], ["az", "Arizona"], ["ar", "Arkansas"],
  ["ca", "California"], ["co", "Colorado"], ["ct", "Connecticut"], ["de", "Delaware"],
  ["fl", "Florida"], ["ga", "Georgia"], ["hi", "Hawaii"], ["id", "Idaho"],
  ["il", "Illinois"], ["in", "Indiana"], ["ia", "Iowa"], ["ks", "Kansas"],
  ["ky", "Kentucky"], ["la", "Louisiana"], ["me", "Maine"], ["md", "Maryland"],
  ["ma", "Massachusetts"], ["mi", "Michigan"], ["mn", "Minnesota"], ["ms", "Mississippi"],
  ["mo", "Missouri"], ["mt", "Montana"], ["ne", "Nebraska"], ["nv", "Nevada"],
  ["nh", "New Hampshire"], ["nj", "New Jersey"], ["nm", "New Mexico"], ["ny", "New York"],
  ["nc", "North Carolina"], ["nd", "North Dakota"], ["oh", "Ohio"], ["ok", "Oklahoma"],
  ["or", "Oregon"], ["pa", "Pennsylvania"], ["ri", "Rhode Island"], ["sc", "South Carolina"],
  ["sd", "South Dakota"], ["tn", "Tennessee"], ["tx", "Texas"], ["ut", "Utah"],
  ["vt", "Vermont"], ["va", "Virginia"], ["wa", "Washington"], ["wv", "West Virginia"],
  ["wi", "Wisconsin"], ["wy", "Wyoming"]
]);

/**
 * A graph of the 50 US states represented as an adjacency list.
 * The key is the state's 2-letter abbreviation (lowercase).
 * The value is a Set of the 2-letter abbreviations of its neighboring states.
 */
const stateAdjacencyList = new Map<string, Set<string>>([
  ["al", new Set(["ms", "tn", "ga", "fl"])],
  ["ak", new Set<string>(["ca", "or", "wa"])],
  ["az", new Set(["ca", "nv", "ut", "co", "nm"])],
  ["ar", new Set(["la", "tx", "ok", "mo", "tn", "ms"])],
  ["ca", new Set(["or", "nv", "az", "ak", "hi"])],
  ["co", new Set(["wy", "ne", "ks", "ok", "nm", "az", "ut"])],
  ["ct", new Set(["ny", "ma", "ri"])],
  ["de", new Set(["md", "pa", "nj"])],
  ["fl", new Set(["al", "ga"])],
  ["ga", new Set(["fl", "al", "tn", "nc", "sc"])],
  ["hi", new Set<string>(["ca", "or", "wa"])],
  ["id", new Set(["mt", "wy", "ut", "nv", "or", "wa"])],
  ["il", new Set(["in", "ky", "mo", "ia", "wi"])],
  ["in", new Set(["mi", "oh", "ky", "il"])],
  ["ia", new Set(["mn", "wi", "il", "mo", "ne", "sd"])],
  ["ks", new Set(["ne", "mo", "ok", "co"])],
  ["ky", new Set(["in", "oh", "wv", "va", "tn", "mo", "il"])],
  ["la", new Set(["tx", "ar", "ms"])],
  ["me", new Set(["nh"])],
  ["md", new Set(["va", "wv", "pa", "de"])],
  ["ma", new Set(["ri", "ct", "ny", "vt", "nh"])],
  ["mi", new Set(["wi", "in", "oh", "mn"])],
  ["mn", new Set(["wi", "ia", "sd", "nd", "mi"])],
  ["ms", new Set(["la", "ar", "tn", "al"])],
  ["mo", new Set(["ia", "il", "ky", "tn", "ar", "ok", "ks", "ne"])],
  ["mt", new Set(["nd", "sd", "wy", "id"])],
  ["ne", new Set(["sd", "ia", "mo", "ks", "co", "wy"])],
  ["nv", new Set(["id", "ut", "az", "ca", "or"])],
  ["nh", new Set(["vt", "me", "ma"])],
  ["nj", new Set(["de", "pa", "ny"])],
  ["nm", new Set(["az", "ut", "co", "ok", "tx"])],
  ["ny", new Set(["nj", "pa", "vt", "ma", "ct"])],
  ["nc", new Set(["va", "tn", "ga", "sc"])],
  ["nd", new Set(["mn", "mt", "sd"])],
  ["oh", new Set(["pa", "wv", "ky", "in", "mi"])],
  ["ok", new Set(["ks", "mo", "ar", "tx", "nm", "co"])],
  ["or", new Set(["ca", "nv", "id", "wa", "ak", "hi"])],
  ["pa", new Set(["ny", "nj", "de", "md", "wv", "oh"])],
  ["ri", new Set(["ct", "ma"])],
  ["sc", new Set(["ga", "nc"])],
  ["sd", new Set(["nd", "mn", "ia", "ne", "wy", "mt"])],
  ["tn", new Set(["ky", "va", "nc", "ga", "al", "ms", "ar", "mo"])],
  ["tx", new Set(["nm", "ok", "ar", "la"])],
  ["ut", new Set(["id", "wy", "co", "nm", "az", "nv"])],
  ["vt", new Set(["ny", "nh", "ma"])],
  ["va", new Set(["wv", "md", "nc", "tn", "ky"])],
  ["wa", new Set(["id", "or", "ak", "hi"])],
  ["wv", new Set(["oh", "pa", "md", "va", "ky"])],
  ["wi", new Set(["mi", "mn", "ia", "il"])],
  ["wy", new Set(["mt", "sd", "ne", "co", "ut", "id"])]
]);

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

    // Overlay scale as proportion of window size (responsive)
    private baseOverlayScaleX: number = 1.8;
    private baseOverlayScaleY: number = 1.6;

    // Get responsive overlay scale based on window size
    get overlayScaleX(): number {
        // Scale relative to a base window width (e.g., 1920px)
        return this.baseOverlayScaleX * (window.innerWidth / 1920);
    }

    get overlayScaleY(): number {
        // Scale relative to a base window height (e.g., 1080px)
        return this.baseOverlayScaleY * (window.innerHeight / 1080);
    }

    // Whether to center the overlay after loading
    centerOverlay: boolean = true;

    // Vertical offset to apply to the OVERLAY background and the US SVG map (base background does not move)
    // Negative moves up, positive moves down (as proportion of window height)
    private baseOverlayMapOffsetY: number = -90;
    
    get overlayMapOffsetY(): number {
        return this.baseOverlayMapOffsetY * (window.innerHeight / 1080);
    }
    
    set overlayMapOffsetY(value: number) {
        this.baseOverlayMapOffsetY = value * (1080 / window.innerHeight);
    }

    // Additional left-side image configuration
    leftSideImageSrc: string = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/1.png';
    private baseLeftSideImageScaleX: number = 2;
    private baseLeftSideImageScaleY: number = 2;
    
    get leftSideImageScaleX(): number {
        return this.baseLeftSideImageScaleX * (window.innerWidth / 1920);
    }
    
    get leftSideImageScaleY(): number {
        return this.baseLeftSideImageScaleY * (window.innerHeight / 1080);
    }
    
    // Rotate -90 (counter-clockwise) before adding
    leftSideImageRotationDeg: number = -90;
    
    // Margin from the left edge when positioned (as proportion of window width)
    private baseLeftSideImageMarginLeft: number = -260;
    
    get leftSideImageMarginLeft(): number {
        return this.baseLeftSideImageMarginLeft * (window.innerWidth / 1920);
    }
    
    // Vertical offset (px) to move the left-side image up/down (independent of overlay/map)
    private baseLeftSideImageOffsetY: number = 90;
    
    get leftSideImageOffsetY(): number {
        return this.baseLeftSideImageOffsetY * (window.innerHeight / 1080);
    }
    
    set leftSideImageOffsetY(value: number) {
        this.baseLeftSideImageOffsetY = value * (1080 / window.innerHeight);
    }

    // Image to place below the secondary (overlay) background
    belowOverlayImageSrc: string = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/2.png';
    private baseBelowOverlayImageScaleX: number = 2;
    private baseBelowOverlayImageScaleY: number = 1.3;
    
    get belowOverlayImageScaleX(): number {
        return this.baseBelowOverlayImageScaleX * (window.innerWidth / 1920);
    }
    
    get belowOverlayImageScaleY(): number {
        return this.baseBelowOverlayImageScaleY * (window.innerHeight / 1080);
    }
    
    // Vertical gap between overlay bottom and this image's top (as proportion of window height)
    private baseBelowOverlayMarginTop: number = -25;
    
    get belowOverlayMarginTop(): number {
        return this.baseBelowOverlayMarginTop * (window.innerHeight / 1080);
    }

    // --- Game data (business logic) ---
    private states: Map<string, State> = new Map();
    private allStatesCodes: string[] = []; // Array of all state codes for random selection
    private initialStateCode: string | null = null; // The initially selected state (pink, only at start)
    private hasGuessedFirstNeighbor: boolean = false; // Track if first neighbor has been guessed
    score: number = 0;
    timerSeconds: number = 0;
    private inputText: string = '';
    private inputHistory: string[] = [];
    gameClock: number = 0; // in milliseconds

    /** Initialize states from a list of state codes. */
    initializeStates(stateCodes: string[], defaultColor: string = '#cccccc'): void {
        this.states.clear();
        this.allStatesCodes = [...stateCodes]; // Store a copy of all state codes
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
        this.gameClock = 0;
        this.resetAllStates();
    }

    // --- Game clock methods ---
    incrementGameClock(): void {
        this.gameClock += 1000; // Increment by 1000ms (1 second)
    }

    getGameClock(): number {
        return this.gameClock;
    }

    // --- States Guessed Counter ---
    /**
     * Gets the count of correctly guessed states.
     */
    getStatesGuessedCount(): number {
        let count = 0;
        this.states.forEach((state) => {
            if (state.getIsGuessed()) {
                count++;
            }
        });
        return count;
    }

    /**
     * Set the flag indicating that the first neighbor has been guessed.
     * Used by developer flags to enable all neighbor states.
     */
    public setHasGuessedFirstNeighbor(value: boolean): void {
        this.hasGuessedFirstNeighbor = value;
    }

    // --- Input text methods ---
    getInputText(): string {
        return this.inputText;
    }

    setInputText(text: string): void {
        // Allow English letters and spaces, max 20 characters (for "North Carolina", "South Carolina", etc.)
        const filtered = text.replace(/[^a-zA-Z ]/g, '').slice(0, 20);
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

    addToHistory(text: string): void {
        // Directly add text to history (used for correct answers only)
        if (text.trim().length > 0) {
            this.inputHistory.push(text);
        }
    }

    getInputHistory(): string[] {
        return this.inputHistory;
    }

    // --- State neighbor methods ---
    /**
     * Gets the neighbors of a state.
     * @param stateCode The 2-letter state code (case-insensitive)
     * @returns Array of neighboring state codes, or empty array if state not found
     */
    getNeighbors(stateCode: string): string[] {
        const neighbors = stateAdjacencyList.get(stateCode.toLowerCase());
        return neighbors ? Array.from(neighbors) : [];
    }

    /**
     * Checks if stateB is a neighbor of stateA.
     * @param stateA The 2-letter code for the source state (case-insensitive)
     * @param stateB The 2-letter code for the state to check (case-insensitive)
     * @returns true if stateB is a neighbor of stateA, false otherwise
     */
    isNeighbor(stateA: string, stateB: string): boolean {
        return stateAdjacencyList.get(stateA.toLowerCase())?.has(stateB.toLowerCase()) ?? false;
    }

    /**
     * Gets the full name of a state from its abbreviation.
     * @param stateCode The 2-letter state code (case-insensitive)
     * @returns The full state name, or undefined if not found
     */
    getStateName(stateCode: string): string | undefined {
        return stateNames.get(stateCode.toLowerCase());
    }

    /**
     * Finds a state code by its full name (case-insensitive).
     * @param stateName The full state name
     * @returns The 2-letter state code, or undefined if not found
     */
    getStateCodeByName(stateName: string): string | undefined {
        const lowerName = stateName.toLowerCase().trim();
        for (const [code, name] of stateNames.entries()) {
            if (name.toLowerCase() === lowerName) {
                return code;
            }
        }
        return undefined;
    }

    /**
     * Gets the initial state code (the pink state at game start, for display purposes only).
     */
    getCurrentStateCode(): string | null {
        return this.initialStateCode;
    }

    /**
     * Sets the initial state (pink) at game start and highlights its neighbors (red).
     * This is only used for the initial setup.
     * @param stateCode The 2-letter state code to select as initial
     */
    setCurrentState(stateCode: string): void {
        // Reset all states to original color first
        this.states.forEach((state) => {
            if (!state.getIsGuessed()) {
                state.color(state.originalColor);
            } else {
                state.color('#00ff00'); // Green for guessed states
            }
        });

        this.initialStateCode = stateCode.toLowerCase();
        const initialState = this.states.get(this.initialStateCode);
        
        if (initialState) {
            // Set initial state to pink
            initialState.color('pink');

            // Set unguessed neighbor states to red
            const neighbors = this.getNeighbors(this.initialStateCode);
            neighbors.forEach((neighborCode) => {
                const neighborState = this.states.get(neighborCode);
                if (neighborState && !neighborState.getIsGuessed()) {
                    neighborState.color('red');
                }
            });
        }
    }

    /**
     * Helper method to update the display of guessable (red) states.
     * Shows all unguessed neighbors of all guessed states in red.
     * Once a state becomes red (guessable), it stays red until guessed.
     * Public to allow developer flags to trigger state updates.
     */
    public updateGuessableStates(): void {
        // Don't reset colors! We only ADD to the set of red states, never remove
        
        // After first neighbor is guessed, initial state becomes guessable
        if (this.hasGuessedFirstNeighbor && this.initialStateCode) {
            const initialState = this.states.get(this.initialStateCode);
            if (initialState && !initialState.getIsGuessed() && initialState.getColor() !== 'red') {
                initialState.color('red');
            }
        }

        // For all guessed states, show their unguessed neighbors in red
        this.states.forEach((state, code) => {
            if (state.getIsGuessed()) {
                const neighbors = this.getNeighbors(code);
                neighbors.forEach((neighborCode) => {
                    const neighborState = this.states.get(neighborCode);
                    // Only change to red if not already guessed (green)
                    if (neighborState && !neighborState.getIsGuessed() && neighborState.getColor() !== 'red') {
                        neighborState.color('red');
                    }
                });
            }
        });
    }

    /**
     * Check if a state name is valid (exists in the state list)
     * @param stateName The full name of the state to check
     * @returns true if the state name is valid, false otherwise
     */
    isValidStateName(stateName: string): boolean {
        return this.getStateCodeByName(stateName) !== undefined;
    }

    /**
     * Processes a player's guess with the new simplified rules:
     * - First guess must be a neighbor of the initial state (NOT the initial state itself)
     * - After first correct guess, initial state becomes guessable (red)
     * - Any red (guessable) state can be guessed
     * - Guessing a state unlocks its neighbors (turns them red)
     * 
     * @param guessedStateName The full name of the state the player guessed
     * @returns true if the guess was correct, false otherwise
     */
    processGuess(guessedStateName: string): boolean {
        // Find the state code for the guessed name
        const guessedStateCode = this.getStateCodeByName(guessedStateName);
        if (!guessedStateCode) {
            console.log(`Unknown state name: ${guessedStateName}`);
            return false;
        }

        const guessedState = this.states.get(guessedStateCode);
        if (!guessedState) {
            return false;
        }

        // Check if already guessed
        if (guessedState.getIsGuessed()) {
            console.log(`${guessedStateName} was already guessed`);
            return false;
        }

        // Check if the state is currently guessable
        const currentColor = guessedState.getColor();
        
        // At the start (before first neighbor is guessed), pink state is NOT guessable
        if (!this.hasGuessedFirstNeighbor && guessedStateCode === this.initialStateCode) {
            console.log(`${guessedStateName} is the initial state and cannot be guessed yet. Guess a neighbor first!`);
            return false;
        }
        
        // Only red states are guessable (pink is only guessable after it turns red)
        if (currentColor !== 'red') {
            console.log(`${guessedStateName} is not currently guessable (must be red)`);
            return false;
        }

        // Mark as guessed and turn green
        guessedState.isGuessed(true);
        guessedState.color('#00ff00'); // Green

        console.log(`✓ Correct! ${guessedStateName} guessed`);

        // Mark that we've guessed the first neighbor
        if (!this.hasGuessedFirstNeighbor) {
            this.hasGuessedFirstNeighbor = true;
            console.log('First neighbor guessed! Initial state is now guessable.');
        }

        // Update which states are now guessable (red)
        this.updateGuessableStates();

        return true;
    }
}
