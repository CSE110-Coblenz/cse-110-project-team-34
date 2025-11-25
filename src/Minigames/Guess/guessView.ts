import { GuessModel } from './guessModel';

export class GuessView {
    private container: HTMLDivElement;
    private titleText: HTMLDivElement;
    private timerText: HTMLDivElement;
    private letterContainer: HTMLDivElement;
    private messageText: HTMLDivElement;
    
    constructor(stage: any) { // Stage unused, but kept for signature compatibility
        // Main Container overlay
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        this.container.style.zIndex = '20000'; // High z-index to sit on top of everything
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.justifyContent = 'center';
        this.container.style.alignItems = 'center';
        this.container.style.fontFamily = 'Lief, Arial, sans-serif'; // Use custom font

        // Timer
        this.timerText = document.createElement('div');
        this.timerText.style.color = 'white';
        this.timerText.style.fontSize = '80px';
        this.timerText.style.marginBottom = '20px';
        this.timerText.textContent = '5';
        
        // Title
        this.titleText = document.createElement('div');
        this.titleText.style.color = '#FFD700'; // Gold
        this.titleText.style.fontSize = '48px';
        this.titleText.style.marginBottom = '60px';
        this.titleText.textContent = 'GUESS THE STATE!';

        // Letter Container
        this.letterContainer = document.createElement('div');
        this.letterContainer.style.display = 'flex';
        this.letterContainer.style.gap = '15px';
        this.letterContainer.style.marginBottom = '40px';

        // Message Text (Hidden by default)
        this.messageText = document.createElement('div');
        this.messageText.style.color = 'white';
        this.messageText.style.fontSize = '56px';
        this.messageText.style.marginTop = '40px';
        this.messageText.style.textAlign = 'center';
        this.messageText.style.textShadow = '0px 0px 10px black';
        this.messageText.style.minHeight = '70px'; // Reserve space

        this.container.appendChild(this.timerText);
        this.container.appendChild(this.titleText);
        this.container.appendChild(this.letterContainer);
        this.container.appendChild(this.messageText);
        
        document.body.appendChild(this.container);
    }

    public update(model: GuessModel): void {
        // Update Timer
        this.timerText.textContent = Math.ceil(model.timerSeconds).toString();
        if (model.timerSeconds <= 2) {
            this.timerText.style.color = '#FF4444'; // Red alert
        } else {
            this.timerText.style.color = 'white';
        }

        // Update Letters
        this.letterContainer.innerHTML = ''; // Clear
        
        const fullText = model.targetStateName; // Already uppercase

        for (let i = 0; i < fullText.length; i++) {
            const char = fullText[i];
            
            if (char === ' ') {
                const space = document.createElement('div');
                space.style.width = '30px';
                this.letterContainer.appendChild(space);
                continue;
            }

            // Determine color and content
            let displayChar = '_';
            let color = 'white';
            
            // If it's a completed index (user typed or logic revealed) -> Green
            if (model.completedIndices.has(i)) {
                displayChar = char;
                color = '#00FF00'; // Green
            } 
            // If it was originally visible -> White
            else if (model.visibleIndices.has(i)) {
                displayChar = char;
                color = 'white';
            }
            // Else (Hidden and not typed) -> Underscore

            const letterDiv = document.createElement('div');
            letterDiv.textContent = displayChar;
            letterDiv.style.color = color;
            letterDiv.style.fontSize = '80px';
            letterDiv.style.width = '60px';
            letterDiv.style.textAlign = 'center';
            
            this.letterContainer.appendChild(letterDiv);
        }
    }

    public showMessage(msg: string, color: string = 'white'): void {
        this.messageText.textContent = msg;
        this.messageText.style.color = color;
    }

    public destroy(): void {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
