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
    private svgPathElements: Map<string, SVGPathElement> = new Map();
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

    // gets path for specific state
    private parseStatePath(svg: SVGSVGElement, stateFilter?: string): SVGPathElement | null {
        this.svgPathElements.clear();
        const STATE_CODE_PATTERN = /^[a-z]{2}$/;
        const paths = svg.querySelectorAll('path');
        let stateElement: SVGPathElement | null = null;

        paths.forEach((path) => {
            const classAttr = path.getAttribute('class') || '';
            const classTokens = classAttr.split(/\s+/).map((c) => c.trim()).filter(Boolean);
            const stateCode = classTokens.find((t) => STATE_CODE_PATTERN.test(t));

            if (!stateCode) return; // skip non-state paths
            if (stateCode === 'dc' || stateCode === 'ak' || stateCode === 'hi') return; // skip DC, AK, HI
            if (this.svgPathElements.has(stateCode)) return; // skip duplicates

            this.svgPathElements.set(stateCode, path as SVGPathElement);

            if (stateFilter && stateCode === stateFilter) {
                stateElement = path as SVGPathElement;
            }
        });

        if (stateFilter) {
            return stateElement;
        }

        return null;
    }


    // set state images in the popup
    setStateImages(stateA: string, stateB: string) {
        // Clear the placeholder backgrounds
        this.stateAImg.innerHTML = '';

        this.stateBImg.innerHTML = '';
        this.stateAImg.style.backgroundColor = '';
        this.stateBImg.style.backgroundColor = '';

        // get the svg for specific state from BaseGameView
        const svg = this.baseGameView.getSvgElement();
        if (!svg) {
            console.error("SVG element not found");
            return;
        }
        // 
        const stateAElement = this.parseStatePath(svg, stateA.toLowerCase());
        const stateBElement = this.parseStatePath(svg, stateB.toLowerCase());


        if (stateAElement) {
            // Create an SVG container and put the state extracted from the svg inside it
            const svgNS = "http://www.w3.org/2000/svg";
            const svgContainer = document.createElementNS(svgNS, "svg");
            svgContainer.setAttribute("width", "500");
            svgContainer.setAttribute("height", "500");
            svgContainer.setAttribute("viewBox", "0 0 100 100");
            
            // Clone and style the state
            const clonedA = stateAElement.cloneNode(true) as SVGPathElement;
            clonedA.setAttribute("fill", "red");
            clonedA.setAttribute("stroke", "black");
            clonedA.setAttribute("stroke-width", "1");
            clonedA.setAttribute("transform", "translate(50,50) scale(0.8)"); // Center and scale
            
            svgContainer.appendChild(clonedA);
            this.stateAImg.appendChild(svgContainer);
        } else { // fallback image for state A
            this.stateAImg.style.backgroundColor = '#104F80';
            this.stateAImg.style.fontFamily = 'Lief, Arial, sans-serif';
            this.stateAImg.style.display = 'flex';
            this.stateAImg.style.justifyContent = 'center';
            this.stateAImg.style.alignItems = 'center';
            this.stateAImg.textContent = stateA;
        }

        if (stateBElement) {
            // Create an SVG container and put the cloned state inside it
            const svgNS = "http://www.w3.org/2000/svg";
            const svgContainer = document.createElementNS(svgNS, "svg");
            svgContainer.setAttribute("width", "100");
            svgContainer.setAttribute("height", "100");
            svgContainer.setAttribute("viewBox", "0 0 100 100");
            
            // Clone and style the state
            const clonedB = stateBElement.cloneNode(true) as SVGPathElement;
            clonedB.setAttribute("fill", "white");
            clonedB.setAttribute("stroke", "black");
            clonedB.setAttribute("stroke-width", "1");
            clonedB.setAttribute("transform", "translate(50,50) scale(0.8)"); // Center and scale
            
            svgContainer.appendChild(clonedB);
            this.stateBImg.appendChild(svgContainer);
        } else { // fallback image for state B
            this.stateBImg.style.backgroundColor = '#CBE9FF';
            this.stateBImg.style.fontFamily = 'Lief, Arial, sans-serif';
            this.stateBImg.style.display = 'flex';
            this.stateBImg.style.justifyContent = 'center';
            this.stateBImg.style.alignItems = 'center';
            this.stateBImg.textContent = stateB;
        }
    }

    // show question for popup
    showMinigameQuestion(stateA: string, stateB: string) {
        this.questionDiv.textContent = 
            `What's the smallest number of states that connect ${stateA} and ${stateB}?`;
        this.setStateImages(stateA, stateB);
        this.minigamePopupContainer.style.visibility = 'visible';
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

        // Hide after 3 seconds
        setTimeout(() => {
            this.resultText.style.visibility = 'hidden';
            this.minigamePopupContainer.style.visibility = 'hidden';
        }, 3000);
    }

    // register callback for when a guess is submitted
    onGuessSubmitted(callback: GuessCallback) {
        this.onGuess = callback;
    }
}
