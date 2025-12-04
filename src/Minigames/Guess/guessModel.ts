import { stateNames } from '../../common/USMapData';

export class GuessModel {
    public targetStateCode: string = '';
    public targetStateName: string = '';
    public visibleIndices: Set<number> = new Set();
    public hiddenIndices: number[] = [];
    
    public inputString: string = '';
    public timerSeconds: number = 5;
    
    // Derived state for UI
    public isFullPathValid: boolean = true;
    public isMissingPathValid: boolean = true;
    public completedIndices: Set<number> = new Set();
    public isWon: boolean = false;

    constructor() {
        this.pickRandomState();
    }

    private pickRandomState(): void {
        const codes = Array.from(stateNames.keys());
        const randomIndex = Math.floor(Math.random() * codes.length);
        this.targetStateCode = codes[randomIndex];
        this.targetStateName = stateNames.get(this.targetStateCode)!.toUpperCase();
        
        this.generateMask();
    }

    private generateMask(): void {
        const length = this.targetStateName.length;
        // max(2, floor(30%))
        let numVisible = Math.max(2, Math.floor(length * 0.3));
        // Ensure we don't reveal the whole word (though 30% < 100%, so it's fine unless length < 2, but state names are longer)
        // Shortest state name is "OHIO" (4), "IOWA" (4), "UTAH" (4). 4 * 0.3 = 1.2 -> floor 1 -> max(2, 1) = 2. 
        // So 2 letters visible. 2 hidden. Correct.

        this.visibleIndices.clear();
        const indices = Array.from({ length }, (_, i) => i);
        
        // Shuffle indices to pick random ones
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        // Take first numVisible
        for (let i = 0; i < numVisible; i++) {
            // Skip spaces if any (New York, etc.) - State names in map are "New York".
            // We should handle spaces. Spaces should probably be automatically visible or skipped.
            // Let's treat spaces as always visible.
            if (this.targetStateName[indices[i]] === ' ') {
                numVisible++; // Pick another one
                continue;
            }
            this.visibleIndices.add(indices[i]);
        }
        
        // Add all spaces to visible indices
        for (let i = 0; i < length; i++) {
            if (this.targetStateName[i] === ' ') {
                this.visibleIndices.add(i);
            }
        }

        // Populate hidden indices
        this.hiddenIndices = [];
        for (let i = 0; i < length; i++) {
            if (!this.visibleIndices.has(i)) {
                this.hiddenIndices.push(i);
            }
        }
    }

    public handleInput(char: string): void {
        if (this.isWon || this.timerSeconds <= 0) return;
        
        // Filter only letters
        if (!/^[a-zA-Z]$/.test(char)) return;
        
        // Only allow input if we haven't filled all hidden slots
        if (this.inputString.length < this.hiddenIndices.length) {
            this.inputString += char.toUpperCase();
            this.checkWinCondition();
        }
    }

    public handleBackspace(): void {
        if (this.isWon || this.timerSeconds <= 0) return;
        if (this.inputString.length > 0) {
            this.inputString = this.inputString.slice(0, -1);
            // No need to check win on backspace (can't win by removing letters)
        }
    }

    private checkWinCondition(): void {
        // Only check if we've filled all hidden slots
        if (this.inputString.length !== this.hiddenIndices.length) {
            return;
        }

        // Construct the full guessed word
        let constructedWord = '';
        let inputIndex = 0;

        for (let i = 0; i < this.targetStateName.length; i++) {
            if (this.visibleIndices.has(i)) {
                constructedWord += this.targetStateName[i];
            } else {
                // This slot was hidden, use the user's input
                constructedWord += this.inputString[inputIndex];
                inputIndex++;
            }
        }

        // Check if it matches the target
        if (constructedWord === this.targetStateName) {
            this.isWon = true;
        }
    }

    public tickTimer(): void {
        if (!this.isWon && this.timerSeconds > 0) {
            this.timerSeconds -= 1;
        }
    }
}

