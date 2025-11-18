// Game Model for Practice Mode

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

// Pure data state - no DOM manipulation
export class State {
    public code: string;
    public originalColor: string;
    private _currentColor: string;
    private _isGuessed: boolean = false;
    private _isHighlighted: boolean = false;

    constructor(code: string, originalColor: string = '#cccccc') {
        this.code = code;
        this.originalColor = originalColor;
        this._currentColor = originalColor;
    }

    color(newColor: string): State {
        this._currentColor = newColor;
        return this;
    }

    isGuessed(guessed: boolean): State {
        this._isGuessed = guessed;
        return this;
    }

    highlight(highlighted: boolean): State {
        this._isHighlighted = highlighted;
        return this;
    }

    getColor(): string {
        return this._currentColor;
    }

    getIsGuessed(): boolean {
        return this._isGuessed;
    }

    getIsHighlighted(): boolean {
        return this._isHighlighted;
    }

    reset(): State {
        this._currentColor = this.originalColor;
        this._isGuessed = false;
        this._isHighlighted = false;
        return this;
    }

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

    get overlayScaleX(): number {
        return this.baseOverlayScaleX * (window.innerWidth / 1920);
    }

    get overlayScaleY(): number {
        return this.baseOverlayScaleY * (window.innerHeight / 1080);
    }

    centerOverlay: boolean = true;

    private baseOverlayMapOffsetY: number = -90;
    
    get overlayMapOffsetY(): number {
        return this.baseOverlayMapOffsetY * (window.innerHeight / 1080);
    }

    // Left-side image configuration
    leftSideImageSrc: string = '/Humble Gift - Paper UI System v1.1/Sprites/Paper UI Pack/Plain/9 Rewards/1.png';
    private baseLeftSideImageScaleX: number = 2;
    private baseLeftSideImageScaleY: number = 2;
    
    get leftSideImageScaleX(): number {
        return this.baseLeftSideImageScaleX * (window.innerWidth / 1920);
    }
    
    get leftSideImageScaleY(): number {
        return this.baseLeftSideImageScaleY * (window.innerHeight / 1080);
    }
    
    leftSideImageRotationDeg: number = -90;
    
    private baseLeftSideImageMarginLeft: number = -260;
    
    get leftSideImageMarginLeft(): number {
        return this.baseLeftSideImageMarginLeft * (window.innerWidth / 1920);
    }
    
    private baseLeftSideImageOffsetY: number = 90;
    
    get leftSideImageOffsetY(): number {
        return this.baseLeftSideImageOffsetY * (window.innerHeight / 1080);
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
    
    private baseBelowOverlayMarginTop: number = -25;
    
    get belowOverlayMarginTop(): number {
        return this.baseBelowOverlayMarginTop * (window.innerHeight / 1080);
    }

    // --- Game data (business logic) ---
    private states: Map<string, State> = new Map();
    private allStatesCodes: string[] = [];
    private initialStateCode: string | null = null;
    private hasGuessedFirstNeighbor: boolean = false;
    private inputText: string = '';
    private inputHistory: string[] = [];

    constructor() {
        console.log('Practice Mode GameModel initialized');
    }

    /** Initialize states from a list of state codes. */
    initializeStates(stateCodes: string[], defaultColor: string = '#cccccc'): void {
        this.states.clear();
        this.allStatesCodes = [...stateCodes];
        stateCodes.forEach((code) => {
            const state = new State(code, defaultColor);
            this.states.set(code, state);
        });
        console.log(`Practice Mode: initialized ${this.states.size} states`);
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
    }

    setAllStatesColor(color: string): void {
        this.states.forEach((s) => s.color(color));
    }

    getStatesGuessedCount(): number {
        let count = 0;
        this.states.forEach((state) => {
            if (state.getIsGuessed()) {
                count++;
            }
        });
        return count;
    }

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

    addToHistory(text: string): void {
        if (text.trim().length > 0) {
            this.inputHistory.push(text);
        }
    }

    getInputHistory(): string[] {
        return this.inputHistory;
    }

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

        this.updateGuessableStates();

        return true;
    }
}

