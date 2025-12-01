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

    private baseGameView : BaseGameView;

    constructor(stage: Konva.Stage, layer: Konva.Layer, baseGameView: BaseGameView) {
        this.stage = stage;
        this.layer = layer;
        this.baseGameView = baseGameView;

        // === Konva popup group (for visuals like rectangles/text) ===
        this.popupGroup = new Konva.Group({ visible: false });
        this.layer.add(this.popupGroup);

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
        this.minigamePopupContainer.style.pointerEvents = 'none'; // Don't block input when hidden
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
        this.questionDiv.style.fontFamily = 'Lief, Arial, sans-serif';
        this.questionDiv.style.color = 'white';
        this.questionDiv.style.textAlign = 'center';
        this.questionDiv.style.marginBottom = '10px';
        this.contentContainer.appendChild(this.questionDiv);

        // placeholder containers for state imgs
        this.stateAImg = document.createElement('div');
        this.stateAImg.style.width = '100px';
        this.stateAImg.style.height = '100px';
        this.stateAImg.style.gridColumn = '2 / 3';
        this.stateAImg.style.marginLeft = '50px'
        this.stateAImg.style.gridRow = '2 / 3';
        this.contentContainer.appendChild(this.stateAImg);

        this.stateBImg = document.createElement('div');
        this.stateBImg.style.width = '100px';
        this.stateBImg.style.height = '100px';
        this.stateBImg.style.gridColumn = '4 / 5';
        this.stateBImg.style.gridRow = '2 / 3';
        this.contentContainer.appendChild(this.stateBImg);


        // input box for guesses
        this.guessInput = document.createElement('input');
        this.guessInput.style.width = '30px';
        this.guessInput.style.height = '20px';
        this.guessInput.style.marginBottom = '10px';
        this.guessInput.style.alignSelf = 'center';
        this.guessInput.style.gridColumn = '3 / 4';
        this.guessInput.style.marginLeft = '35px';
        this.guessInput.style.marginTop = '35px'; 
        this.guessInput.style.gridRow = '3 / 4';
        this.guessInput.style.outline = 'none';
        this.guessInput.style.border = '2px solid gray';
        this.guessInput.style.fontFamily = 'Lief, Arial, sans-serif';
        this.guessInput.style.caretColor = 'transparent';
        this.contentContainer.appendChild(this.guessInput);

        // correct/incorrect answer text
        this.resultText = document.createElement('div');
        this.resultText.style.fontFamily = 'Lief, Arial, sans-serif';
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

    // set state images in the popup
    setStateImages(stateAName: string, stateBName: string, stateACode: string, stateBCode: string) {
        // Clear the placeholder backgrounds
        this.stateAImg.innerHTML = '';
        this.stateBImg.innerHTML = '';
        this.stateAImg.style.backgroundColor = '';
        this.stateBImg.style.backgroundColor = '';

        // Helper to create SVG for a state
        const createStateSVG = (stateCode: string, name: string, container: HTMLDivElement, color: string, textColor: string) => {
            const stateElement = this.baseGameView.getStatePath(stateCode);
            
            if (stateElement) {
                const bbox = stateElement.getBBox();
                const svgNS = "http://www.w3.org/2000/svg";
                const svgContainer = document.createElementNS(svgNS, "svg");
                svgContainer.setAttribute("width", "100");
                svgContainer.setAttribute("height", "100");
                
                // Add padding and set viewBox
                const padding = 5;
                svgContainer.setAttribute("viewBox", `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding*2} ${bbox.height + padding*2}`);
                
                const clonedPath = stateElement.cloneNode(true) as SVGPathElement;
                clonedPath.setAttribute("fill", color);
                clonedPath.setAttribute("stroke", "white");
                clonedPath.setAttribute("stroke-width", "2");
                clonedPath.removeAttribute("transform"); 
                
                svgContainer.appendChild(clonedPath);
                container.appendChild(svgContainer);
                
                // Add Label
                const label = document.createElement("div");
                label.textContent = name;
                label.style.color = "white";
                label.style.marginTop = "5px";
                label.style.fontFamily = 'Lief, Arial, sans-serif';
                label.style.fontSize = '16px';
                container.appendChild(label);
                
                // Style container
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'center';
            } else {
                // Fallback
                container.style.backgroundColor = color;
                container.style.fontFamily = 'Lief, Arial, sans-serif';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';
                container.style.color = textColor;
                container.textContent = name;
            }
        };

        createStateSVG(stateACode, stateAName, this.stateAImg, '#104F80', 'white');
        createStateSVG(stateBCode, stateBName, this.stateBImg, '#CBE9FF', 'black');
    }

    // show question for popup
    showMinigameQuestion(stateAName: string, stateBName: string, stateACode: string, stateBCode: string) {
        this.questionDiv.textContent = 
            `What's the smallest number of states that connect ${stateAName} and ${stateBName}?`;
        this.setStateImages(stateAName, stateBName, stateACode, stateBCode);
        this.minigamePopupContainer.style.visibility = 'visible';
        this.minigamePopupContainer.style.pointerEvents = 'all'; // Enable input when showing question
        this.guessInput.value = '';
        this.guessInput.focus();
    }


    // show correct/incorrect result
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
        this.minigamePopupContainer.style.pointerEvents = 'all'; // Enable input when visible

        // Hide after 3 seconds
        setTimeout(() => {
            this.resultText.style.visibility = 'hidden';
            this.minigamePopupContainer.style.visibility = 'hidden';
            this.minigamePopupContainer.style.pointerEvents = 'none'; // Disable input blocking when hidden
        }, 3000);
    }

    // register callback for when a guess is submitted
    onGuessSubmitted(callback: GuessCallback) {
        this.onGuess = callback;
    }
}
