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
        
        this.inputString += char.toUpperCase();
        this.evaluatePaths();
    }

    public handleBackspace(): void {
        if (this.isWon || this.timerSeconds <= 0) return;
        if (this.inputString.length > 0) {
            this.inputString = this.inputString.slice(0, -1);
            this.evaluatePaths();
        }
    }

    private evaluatePaths(): void {
        // Reset paths
        let fullCursor = 0;
        let missingCursor = 0;
        let fullValid = true;
        let missingValid = true;

        const input = this.inputString;
        const target = this.targetStateName;

        // Iterate through input to validate paths
        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            // Validate Full Path (skipping spaces in target)
            if (fullValid) {
                // Skip spaces in target
                while (fullCursor < target.length && target[fullCursor] === ' ') {
                    fullCursor++;
                }
                
                if (fullCursor < target.length && char === target[fullCursor]) {
                    fullCursor++;
                } else {
                    fullValid = false;
                }
            }

            // Validate Missing Path
            if (missingValid) {
                if (missingCursor < this.hiddenIndices.length && char === target[this.hiddenIndices[missingCursor]]) {
                    missingCursor++;
                } else {
                    missingValid = false;
                }
            }
        }

        this.isFullPathValid = fullValid;
        this.isMissingPathValid = missingValid;
        this.completedIndices.clear();

        // Determine which indices are completed (Green)
        // Prioritize Full Path if valid, else Missing Path
        if (fullValid) {
             // Mark 0 to fullCursor-1 as completed
             // Need to map logical cursor back to actual indices (handling spaces)
             let actualIndex = 0;
             let logicalCount = 0;
             while (actualIndex < target.length && logicalCount < fullCursor) {
                 if (target[actualIndex] !== ' ') {
                     logicalCount++;
                 }
                 this.completedIndices.add(actualIndex); // Mark spaces too if passed?
                 // Actually, we just loop and mark up to current pos
                 actualIndex++;
             }
             // If fullCursor points to end, we might missed marking the last char if loop condition
             // Let's redo: simple slice
             let processedChars = 0;
             for(let i=0; i<target.length; i++) {
                 if (target[i] === ' ') continue;
                 if (processedChars < fullCursor) {
                     this.completedIndices.add(i);
                     processedChars++;
                 }
             }
        } else if (missingValid) {
            // Mark hiddenIndices[0] to hiddenIndices[missingCursor-1]
            for (let i = 0; i < missingCursor; i++) {
                this.completedIndices.add(this.hiddenIndices[i]);
            }
        }

        // Check Win Condition
        // Won if Full Path completes the word OR Missing Path completes all hidden
        // Note: Full Path must match length (ignoring spaces)
        const targetLenNoSpaces = target.replace(/ /g, '').length;
        const fullWon = fullValid && fullCursor === targetLenNoSpaces;
        const missingWon = missingValid && missingCursor === this.hiddenIndices.length;

        if (fullWon || missingWon) {
            this.isWon = true;
        }
    }

    public tickTimer(): void {
        if (!this.isWon && this.timerSeconds > 0) {
            this.timerSeconds -= 1;
        }
    }
}

