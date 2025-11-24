// Displays data and UI

import Konva from 'konva';
import { BaseGameView } from '../../common/BaseGameView';

type GuessCallback = (guess: number) => void;

export class BridgeView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private popupGroup: Konva.Group;
    private stateAImg: HTMLDivElement;
    private stateBImg: HTMLDivElement;
    private questionDiv: HTMLDivElement;
    private guessInput: HTMLInputElement;
    private resultText: HTMLDivElement;
    private onGuess: GuessCallback | null = null;

    private minigamePopupContainer: HTMLDivElement;
    private contentContainer: HTMLDivElement;

    private wasMainGameActive: boolean = false;

    constructor(stage: Konva.Stage, layer: Konva.Layer) {
        this.stage = stage;
        this.layer = layer;

        // === Konva popup group (for visuals like rectangles/text) ===
        this.popupGroup = new Konva.Group({ visible: false });
        this.layer.add(this.popupGroup);

        // === HTML modal container for inputs ===
        // gray overlay behind the popup
        this.minigamePopupContainer = document.createElement('div');
        this.minigamePopupContainer.style.position = 'fixed';
        this.minigamePopupContainer.style.top = '0';
        this.minigamePopupContainer.style.left = '0';
        this.minigamePopupContainer.style.width = '100%';
        this.minigamePopupContainer.style.height = '100%';
        this.minigamePopupContainer.style.display = 'flex';
        this.minigamePopupContainer.style.justifyContent = 'center';
        this.minigamePopupContainer.style.alignItems = 'center';
        this.minigamePopupContainer.style.flexDirection = 'column-reverse';
        this.minigamePopupContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.minigamePopupContainer.style.zIndex = '10000';
        this.minigamePopupContainer.style.visibility = 'hidden';
        document.body.appendChild(this.minigamePopupContainer);

        // container for actual minigame content
        this.contentContainer = document.createElement('div');
        this.contentContainer.style.background = '#001d3d';
        this.contentContainer.style.padding = '20px';
        this.contentContainer.style.borderRadius = '10px';
        this.contentContainer.style.textAlign = 'center';
        this.contentContainer.style.display = 'grid';
        this.contentContainer.style.gridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr';
        this.contentContainer.style.gridTemplateRows = 'auto';
        this.contentContainer.style.width = '600px';
        this.contentContainer.style.height = '400px';
        this.minigamePopupContainer.appendChild(this.contentContainer);

        // question text
        this.questionDiv = document.createElement('div');
        this.questionDiv.style.gridColumn = '1 / 7';  // span all six columns
        this.questionDiv.style.gridRow = '1 / 2';
        this.questionDiv.style.fontSize = '24px';
        this.questionDiv.style.fontFamily = 'sans-serif';
        this.questionDiv.style.color = 'white';
        this.questionDiv.style.textAlign = 'center';
        this.questionDiv.style.marginBottom = '10px';
        this.contentContainer.appendChild(this.questionDiv);

        // placeholder containers for state imgs
        this.stateAImg = document.createElement('div');
        this.stateAImg.style.width = '100px';
        this.stateAImg.style.height = '100px';
        this.stateAImg.style.backgroundColor = '#104F80'; // placeholder color
        this.stateAImg.style.gridColumn = '2 / 3';
        this.stateAImg.style.marginLeft = '50px'
        this.stateAImg.style.gridRow = '2 / 3';
        this.contentContainer.appendChild(this.stateAImg);

        this.stateBImg = document.createElement('div');
        this.stateBImg.style.width = '100px';
        this.stateBImg.style.height = '100px';
        this.stateBImg.style.backgroundColor = '#CBE9FF'; // different placeholder color
        this.stateBImg.style.gridColumn = '4 / 5';
        this.stateBImg.style.gridRow = '2 / 3';
        this.contentContainer.appendChild(this.stateBImg);


        // === Input and submit button ===
        this.guessInput = document.createElement('input');
        // this.guessInput.type = 'number';
        this.guessInput.style.width = '30px';
        this.guessInput.style.height = '20px';
        this.guessInput.style.marginBottom = '10px';
        this.guessInput.style.alignSelf = 'center';
        this.guessInput.style.gridColumn = '3 / 4';
        this.guessInput.style.marginLeft = '35px';
        this.guessInput.style.marginTop = '35px'; 
        this.guessInput.style.gridRow = '3 / 4';
        this.guessInput.style.outline = 'none';
        this.guessInput.style.caretColor = 'transparent';
        this.contentContainer.appendChild(this.guessInput);

        // correct/incorrect answer text
        this.resultText = document.createElement('div');
        this.resultText.style.fontFamily = 'sans-serif';
        this.resultText.style.padding = '10px';
        this.minigamePopupContainer.appendChild(this.resultText);

        // ensures only numbers can be entered
        this.guessInput.addEventListener('input', (e) => {
        this.guessInput.value = this.guessInput.value.replace(/[^\d]/g, '');
        });

        // enter key submits guess
        this.guessInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const value = parseInt(this.guessInput.value);
                if (!isNaN(value) && this.onGuess) this.onGuess(value);

                // Prevent the event from bubbling to main game
                e.stopPropagation();
                e.preventDefault();
            }
        });
    }

    /** Show popup question */
    showMinigameQuestion(stateA: string, stateB: string) {
        this.questionDiv.textContent = 
            `What's the smallest number of states that connect ${stateA} and ${stateB}?`;
        this.minigamePopupContainer.style.visibility = 'visible';
        this.guessInput.value = '';
        this.guessInput.focus();
    }


    /** Show result and hide popup */
    showMinigameResult(isCorrect: boolean, answer: number) {
        if (isCorrect === true) {
            this.resultText.style.color = 'lightgreen';
            this.resultText.textContent = 'Correct!';
        } else if (isCorrect === false) {
            this.resultText.style.color = 'red';
            this.resultText.textContent = `Wrong! The answer is ${answer}.`;
        }
        this.resultText.style.visibility = 'visible';
        this.minigamePopupContainer.style.visibility = 'visible';

        // Hide after 3 seconds
        setTimeout(() => {
            this.resultText.style.visibility = 'hidden';
            this.minigamePopupContainer.style.visibility = 'hidden';
        }, 3000);
    }

    /** Register callback for guess submission */
    onGuessSubmitted(callback: GuessCallback) {
        this.onGuess = callback;
    }
}
