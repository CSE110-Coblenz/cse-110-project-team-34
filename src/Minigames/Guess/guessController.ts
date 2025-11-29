import Konva from 'konva';
import { GuessModel } from './guessModel';
import { GuessView } from './guessView';

export class GuessController {
    private model: GuessModel;
    private view: GuessView;
    private onComplete: (score: number) => void;
    private timerInterval: any;
    private isRunning: boolean = true;

    constructor(stage: Konva.Stage, onComplete: (score: number) => void) {
        this.onComplete = onComplete;
        this.model = new GuessModel();
        this.view = new GuessView(stage);

        // Initial render
        this.view.update(this.model);

        // Setup Input
        window.addEventListener('keydown', this.handleInput);

        // Setup Timer
        this.timerInterval = setInterval(() => {
            this.tick();
        }, 1000);
    }

    private handleInput = (e: KeyboardEvent) => {
        if (!this.isRunning) return;

        if (e.key === 'Backspace') {
            this.model.handleBackspace();
        } else if (e.key.length === 1) {
            this.model.handleInput(e.key);
        }

        this.view.update(this.model);

        if (this.model.isWon) {
            this.handleWin();
        }
    };

    private tick(): void {
        if (!this.isRunning) return;

        this.model.tickTimer();
        this.view.update(this.model);

        if (this.model.timerSeconds <= 0 && !this.model.isWon) {
            this.handleLoss();
        }
    }

    private handleWin(): void {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.view.showMessage("YOU GUESSED IT!!", '#00FF00'); // Green
        
        setTimeout(() => {
            this.cleanup();
            this.onComplete(500); // Reward 500 points
        }, 1500); // Delay to show success message
    }

    private handleLoss(): void {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.view.showMessage(`TIME'S UP! It was ${this.model.targetStateName}`, '#FF4444'); // Red
        
        setTimeout(() => {
            this.cleanup();
            this.onComplete(0); // No reward
        }, 2000); // Delay to show failure
    }

    private cleanup(): void {
        window.removeEventListener('keydown', this.handleInput);
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.view.destroy();
    }
}

