import Konva from 'konva';

type GuessCallback = (guess: number) => void;

export class BridgeView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private popupGroup: Konva.Group;
    private questionText: Konva.Text;
    private stateARect: Konva.Rect;
    private stateBRect: Konva.Rect;
    private guessInput: HTMLInputElement;
    private submitBtn: HTMLButtonElement;
    private onGuess: GuessCallback | null = null;

    constructor(containerId: string, width: number, height: number) {
        this.stage = new Konva.Stage({
            container: containerId,
            width,
            height,
        });

        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // Popup group
        this.popupGroup = new Konva.Group({ visible: false });
        this.layer.add(this.popupGroup);

        // Background rectangle
        const bg = new Konva.Rect({
            width: 300,
            height: 250,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 2,
            cornerRadius: 10,
        });
        this.popupGroup.add(bg);

        // Question text
        this.questionText = new Konva.Text({
            x: 10,
            y: 10,
            width: 280,
            text: '',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: 'black',
            align: 'center',
        });
        this.popupGroup.add(this.questionText);

        // Two rectangles for state images
        this.stateARect = new Konva.Rect({
            x: 30,
            y: 50,
            width: 100,
            height: 100,
            fill: '#eee',
            stroke: '#ccc',
            strokeWidth: 2,
        });
        this.popupGroup.add(this.stateARect);

        this.stateBRect = new Konva.Rect({
            x: 170,
            y: 50,
            width: 100,
            height: 100,
            fill: '#eee',
            stroke: '#ccc',
            strokeWidth: 2,
        });
        this.popupGroup.add(this.stateBRect);

        // HTML input for guess
        this.guessInput = document.createElement('input');
        this.guessInput.type = 'number';
        this.guessInput.style.position = 'absolute';
        this.guessInput.style.left = `${this.stage.container().offsetLeft + 80}px`;
        this.guessInput.style.top = `${this.stage.container().offsetTop + 170}px`;
        this.guessInput.style.width = '140px';
        document.body.appendChild(this.guessInput);

        // Submit button
        this.submitBtn = document.createElement('button');
        this.submitBtn.textContent = 'Submit';
        this.submitBtn.style.position = 'absolute';
        this.submitBtn.style.left = `${this.stage.container().offsetLeft + 110}px`;
        this.submitBtn.style.top = `${this.stage.container().offsetTop + 200}px`;
        document.body.appendChild(this.submitBtn);

        this.submitBtn.addEventListener('click', () => {
            if (this.onGuess) {
                const value = parseInt(this.guessInput.value);
                if (!isNaN(value)) this.onGuess(value);
            }
        });
    }

    /** Show popup question */
    showMinigameQuestion(stateA: string, stateB: string) {
        this.questionText.text(`Guess the minimum number of states connecting ${stateA.toUpperCase()} and ${stateB.toUpperCase()}:`);
        this.popupGroup.visible(true);

        // TODO: set state images here using Konva.Image
        // Example placeholder:
        this.stateARect.fill('#eee');
        this.stateBRect.fill('#eee');

        this.layer.draw();
        this.guessInput.value = '';
        this.guessInput.focus();
    }

    /** Show result and hide popup */
    showMinigameResult(isCorrect: boolean, answer: number) {
        alert(isCorrect ? 'Correct!' : `Wrong! The answer is ${answer}.`);
        this.popupGroup.visible(false);
        this.layer.draw();
    }

    /** Register callback for guess submission */
    onGuessSubmitted(callback: GuessCallback) {
        this.onGuess = callback;
    }
}
