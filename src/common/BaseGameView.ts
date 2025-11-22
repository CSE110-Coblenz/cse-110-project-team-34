/**
 * BaseGameView - Parent class containing shared rendering logic (Step 3: Increase Cohesion)
 * 
 * This base class extracts the common view responsibilities across Classic, Practice, and Cracked modes:
 * - Image loading (sequential, deterministic)
 * - SVG map container and styling
 * - Input text and history display
 * - Responsive layout handling
 * 
 * Applying "Increase Cohesion" tactic (Chapter 8, Software Architecture in Practice)
 * to separate "Game Mechanics Rendering" (shared) from "Mode-Specific Configuration" (deferred).
 */

import Konva from 'konva';
import { BaseGameModel } from './BaseGameModel';
import { createPixelImage } from '../utils/KonvaHelpers';
import { ensureLiefFontLoaded } from '../utils/FontLoader';

// Helper for sequential layer drawing
async function drawSequentially(...layers: Konva.Layer[]): Promise<void> {
    for (const layer of layers) {
        layer.draw();
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }
}

export abstract class BaseGameView {
    protected stage: Konva.Stage;
    protected backgroundLayer: Konva.Layer;
    protected layer: Konva.Layer;
    protected model: BaseGameModel;
    
    protected svgContainer: HTMLDivElement | null = null;
    protected svgPathElements: Map<string, SVGPathElement> = new Map();
    private minigamePopup!: HTMLDivElement;
    
    protected backgroundImage: Konva.Image | null = null;
    protected overlayBackgroundImage: Konva.Image | null = null;
    protected leftSideImage: Konva.Image | null = null;
    protected belowOverlayImage: Konva.Image | null = null;
    
    protected overlayMapOffsetY: number = 0;
    protected overlayBaseX: number | null = null;
    protected overlayBaseY: number | null = null;
    
    protected onCorrectAnswerCallback: (() => void) | null = null;
    
    // Text input
    protected inputTextLayer!: Konva.Layer;
    protected inputTextDisplay!: Konva.Text;
    
    // Input history
    protected historyLayer!: Konva.Layer;
    protected historyTextDisplay!: Konva.Text;

    constructor(stage: Konva.Stage, model: BaseGameModel) {
        this.stage = stage;
        this.model = model;
        
        // Create background layer first
        this.backgroundLayer = new Konva.Layer();
        this.stage.add(this.backgroundLayer);
        
        // Ensure custom font is loaded
        ensureLiefFontLoaded();
        
        // Create main layer
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
        
        // Initialize shared components
        this.createSVGContainer();
        this.initializeTextInput();
        this.initializeHistoryDisplay();
        this.initializeMinigamePopup();

        // Inject CSS for pulse effect 
        this.injectPulseCSSCorrect();
        this.injectPulseCSSWrong();
        
        // Apply initial offset
        this.setOverlayMapOffsetY(this.model.overlayMapOffsetY);
        
        // Resize listener
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /** Initialize and load assets in deterministic order */
    async init(): Promise<void> {
        await this.loadImagesSequentially();
        await drawSequentially(this.backgroundLayer, this.layer);
    }

    /** Sequential image loading to avoid race conditions */
    protected async loadImagesSequentially(): Promise<void> {
        // 1. Base background
        await this.loadImage(this.model.baseBackgroundSrc, (img) => {
            this.backgroundImage = this.createScaledImage(img, true);
            this.backgroundLayer.add(this.backgroundImage);
            console.log('✓ Base background loaded');
        });

        // 2. Overlay (centered and scaled)
        await this.loadImage(this.model.overlayBackgroundSrc, (img) => {
            this.overlayBackgroundImage = this.createScaledImage(img, false);
            const overlay = this.overlayBackgroundImage;
            overlay.scaleX(this.model.overlayScaleX);
            overlay.scaleY(this.model.overlayScaleY);

            if (this.model.centerOverlay) {
                const displayedW = overlay.width() * overlay.scaleX();
                const displayedH = overlay.height() * overlay.scaleY();
                overlay.x((this.stage.width() - displayedW) / 2);
                overlay.y((this.stage.height() - displayedH) / 2);
            }

            this.overlayBaseX = overlay.x();
            this.overlayBaseY = overlay.y();
            this.applyOverlayMapOffset();

            this.backgroundLayer.add(overlay);
            console.log('✓ Overlay background loaded');
        });

        // 3. Left-side image
        await this.loadImage(this.model.leftSideImageSrc, (img) => {
            this.leftSideImage = createPixelImage(img, { x: 0, y: 0 });
            this.leftSideImage.scaleX(this.model.leftSideImageScaleX);
            this.leftSideImage.scaleY(this.model.leftSideImageScaleY);
            this.leftSideImage.rotation(this.model.leftSideImageRotationDeg);

            const naturalW = img.width;
            const naturalH = img.height;
            this.leftSideImage.offsetX(naturalW / 2);
            this.leftSideImage.offsetY(naturalH / 2);

            const displayedW = naturalW * this.leftSideImage.scaleX();
            const x = this.model.leftSideImageMarginLeft + displayedW / 2;
            const y = (this.stage.height() / 2) + (this.model.leftSideImageOffsetY || 0);
            this.leftSideImage.x(x);
            this.leftSideImage.y(y);

            this.backgroundLayer.add(this.leftSideImage);
            this.updateHistoryDisplay();
            console.log('✓ Left-side image loaded');
        });

        // 4. Below-overlay image
        await this.loadImage(this.model.belowOverlayImageSrc, (img) => {
            this.belowOverlayImage = createPixelImage(img, { x: 0, y: 0 });
            this.belowOverlayImage.scaleX(this.model.belowOverlayImageScaleX);
            this.belowOverlayImage.scaleY(this.model.belowOverlayImageScaleY);
            this.updateBelowOverlayPosition();
            this.backgroundLayer.add(this.belowOverlayImage);
            this.updateInputTextDisplay();
            console.log('✓ Below-overlay image loaded');
        });

        await drawSequentially(this.backgroundLayer);
    }

    /** Promise-based image loader */
    protected async loadImage(src: string, onload: (img: HTMLImageElement) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            const imageObj = new Image();
            imageObj.onload = () => {
                onload(imageObj);
                resolve();
            };
            imageObj.onerror = () => {
                console.error(`❌ Failed to load image: ${src}`);
                reject(new Error(`Image failed: ${src}`));
            };
            imageObj.src = src;
        });
    }

    /** Helper to scale and stretch image if needed */
    protected createScaledImage(img: HTMLImageElement, stretch: boolean): Konva.Image {
        const imageNode = createPixelImage(img, { x: 0, y: 0 });
        if (stretch) {
            const scaleX = this.stage.width() / img.width;
            const scaleY = this.stage.height() / img.height;
            imageNode.scaleX(scaleX);
            imageNode.scaleY(scaleY);
        }
        return imageNode;
    }

    /** Create a DOM container to hold the SVG */
    protected createSVGContainer(): void {
        this.svgContainer = document.createElement('div');
        this.svgContainer.id = 'us-map-container';
        this.svgContainer.style.position = 'absolute';
        this.svgContainer.style.top = '0';
        this.svgContainer.style.left = '0';
        this.svgContainer.style.width = '100%';
        this.svgContainer.style.height = '100%';
        this.svgContainer.style.display = 'flex';
        this.svgContainer.style.justifyContent = 'center';
        this.svgContainer.style.alignItems = 'center';
        this.svgContainer.style.pointerEvents = 'auto';
        this.svgContainer.style.visibility = 'hidden';
        this.svgContainer.style.overflow = 'visible';
        
        document.body.appendChild(this.svgContainer);
    }

    /** Calculate responsive SVG scale based on window dimensions */
    protected getResponsiveSVGScale(): number {
        const widthScale = window.innerWidth / 1920;
        const heightScale = window.innerHeight / 1080;
        const scale = Math.min(widthScale, heightScale);
        return scale * 1;
    }

    /** Apply responsive styles to SVG element */
    protected applySVGStyles(svg: SVGSVGElement): void {
        const scale = this.getResponsiveSVGScale();
        svg.style.transform = `scale(${scale})`;
        svg.style.transformOrigin = 'center center';
        svg.style.display = 'block';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }

    /** Initialize text input display */
    protected initializeTextInput(): void {
        this.inputTextLayer = new Konva.Layer();
        this.stage.add(this.inputTextLayer);

        this.inputTextDisplay = new Konva.Text({
            x: 0,
            y: 0,
            text: '',
            fontSize: 32,
            fontFamily: 'Lief',
            fill: 'black',
            align: 'center',
            verticalAlign: 'middle'
        });

        this.inputTextLayer.add(this.inputTextDisplay);
        
        // Set up keyboard event listeners
        window.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    /** Handle keyboard input */
    protected handleKeyPress(e: KeyboardEvent): void {
        // Only handle if the game view is visible
        if (this.backgroundLayer.isVisible() === false) return;

        if (e.key === 'Enter') {
            // Process the guess before adding to history
            const inputText = this.model.getInputText();
            if (inputText.trim().length > 0) {
                const isCorrect = this.model.processGuess(inputText);
                
                if (isCorrect) {
                    // Call the callback to notify controller of correct answer
                    if (this.onCorrectAnswerCallback) {
                        this.onCorrectAnswerCallback();
                    }

                    // Only add to history if correct (as lowercase)
                    this.model.addToHistory(inputText.toLowerCase());
                    this.updateViewFromModel(); // Update colors
                    this.refreshHistory();
                }
                // If incorrect, don't add to history
            }
            // Always clear the input text after Enter
            this.model.clearInputText();
            this.refreshInputText();
        } else if (e.key === 'Backspace') {
            // Remove last character
            const currentText = this.model.getInputText();
            this.model.setInputText(currentText.slice(0, -1));
            this.refreshInputText();
        } else if (e.key.length === 1 && /[a-zA-Z ]/.test(e.key)) {
            // Add the character (allowing spaces for state names like "New York")
            const currentText = this.model.getInputText();
            this.model.setInputText(currentText + e.key);
            this.refreshInputText();
        }
    }

    /** Initialize input history display */
    protected initializeHistoryDisplay(): void {
        this.historyLayer = new Konva.Layer();
        this.stage.add(this.historyLayer);

        this.historyTextDisplay = new Konva.Text({
            x: 0,
            y: 0,
            text: '',
            fontSize: 24,
            fontFamily: 'Lief',
            fill: 'black',
            align: 'center',
            verticalAlign: 'top',
            width: 200,
            padding: 10
        });

        this.historyLayer.add(this.historyTextDisplay);
    }

    /** Update input text display position */
    protected updateInputTextDisplay(): void {
        if (!this.belowOverlayImage) return;

        const below = this.belowOverlayImage;
        const imgX = below.x();
        const imgY = below.y();
        const imgWidth = below.width() * below.scaleX();
        const imgHeight = below.height() * below.scaleY();

        // Responsive font size based on image height
        const fontSize = Math.max(16, imgHeight * 0.15);
        this.inputTextDisplay.fontSize(fontSize);

        // Center the text on the image
        this.inputTextDisplay.width(imgWidth);
        this.inputTextDisplay.x(imgX);
        this.inputTextDisplay.y(imgY + imgHeight / 2 - fontSize); // Vertically centered

        this.inputTextLayer.batchDraw();
    }

    /** Update history display position */
    protected updateHistoryDisplay(): void {
        if (!this.leftSideImage) return;

        const left = this.leftSideImage;
        const imgX = left.x();
        const imgY = left.y();
        const imgWidth = left.width() * left.scaleX();
        const imgHeight = left.height() * left.scaleY();
        
        // Responsive font size based on window height
        const fontSize = Math.max(14, window.innerHeight * 0.02);
        this.historyTextDisplay.fontSize(fontSize);
        
        // Account for rotation: the image is rotated -90 degrees
        // After rotation, the top of the image is on the left side
        // Calculate position to start from the top of the rotated image
        const topLeftX = imgX - imgHeight / 2;
        const topLeftY = imgY - imgWidth / 2;

        // Responsive padding
        const paddingX = imgHeight * 0.2;
        const paddingY = imgHeight * 0.1;

        this.historyTextDisplay.x(topLeftX + paddingX);
        this.historyTextDisplay.y(topLeftY + paddingY);
        this.historyTextDisplay.width(imgHeight - 2 * paddingX); // Fit within rotated width

        this.historyLayer.batchDraw();
    }

    /** Update below-overlay image position */
    protected updateBelowOverlayPosition(): void {
        if (!this.overlayBackgroundImage || !this.belowOverlayImage) return;

        const overlay = this.overlayBackgroundImage;
        const below = this.belowOverlayImage;

        const overlayBottom = overlay.y() + (overlay.height() * overlay.scaleY());
        const belowY = overlayBottom + this.model.belowOverlayMarginTop;

        below.y(belowY);
        const displayedW = below.width() * below.scaleX();
        below.x((this.stage.width() - displayedW) / 2);

        this.updateInputTextDisplay();
    }

    /** Set overlay and map vertical offset */
    setOverlayMapOffsetY(offsetY: number): void {
        this.overlayMapOffsetY = offsetY;
        this.applyOverlayMapOffset();
    }

    /** Apply the vertical offset to overlay and SVG */
    protected applyOverlayMapOffset(): void {
        if (this.overlayBackgroundImage && this.overlayBaseY !== null) {
            this.overlayBackgroundImage.y(this.overlayBaseY + this.overlayMapOffsetY);
        }
        if (this.svgContainer) {
            this.svgContainer.style.transform = `translateY(${this.overlayMapOffsetY}px)`;
        }
        this.updateBelowOverlayPosition();
    }

    /** Handle window resize */
    protected handleResize(): void {
        if (this.svgContainer && this.svgContainer.firstElementChild) {
            const svg = this.svgContainer.firstElementChild as SVGSVGElement;
            this.applySVGStyles(svg);
        }
        
        if (this.backgroundImage) {
            const scaleX = this.stage.width() / (this.backgroundImage.width() / this.backgroundImage.scaleX());
            const scaleY = this.stage.height() / (this.backgroundImage.height() / this.backgroundImage.scaleY());
            this.backgroundImage.scaleX(scaleX);
            this.backgroundImage.scaleY(scaleY);
        }

        this.updateBelowOverlayPosition();
        this.updateInputTextDisplay();
        this.updateHistoryDisplay();
        
        this.backgroundLayer.batchDraw();
        this.layer.batchDraw();
    }

    /** Refresh input text from model */
    refreshInputText(): void {
        this.inputTextDisplay.text(this.model.getInputText());
        this.inputTextLayer.batchDraw();
    }

    /** Refresh history from model */
    refreshHistory(): void {
        const history = this.model.getInputHistory();
        const displayText = history.slice(-10).join('\n');
        this.historyTextDisplay.text(displayText);
        this.historyLayer.batchDraw();
    }

    /** Load and display the US map SVG */
    async loadMap(svgPath: string): Promise<string[]> {
        const response = await fetch(svgPath);
        if (!response.ok) {
            console.error('❌ Failed to fetch SVG');
            return [];
        }
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');
        
        if (!svgElement || !this.svgContainer) return [];

        this.applySVGStyles(svgElement);
        this.svgContainer.appendChild(svgElement);
        this.svgContainer.style.visibility = 'visible';

        // Parse state codes from class attributes
        const stateCodes = this.parseStatePaths(svgElement);
        
        console.log(`✓ US Map SVG loaded with ${stateCodes.length} states`);
        return stateCodes;
    }
    
    /** Parse SVG path elements by class attribute and return list of state codes */
    protected parseStatePaths(svg: SVGSVGElement): string[] {
        this.svgPathElements.clear();
        const STATE_CODE_PATTERN = /^[a-z]{2}$/;
        const paths = svg.querySelectorAll('path');
        const stateCodes: string[] = [];

        if (paths.length === 0) {
            console.warn('⚠️ No path elements found in SVG');
        }

        paths.forEach((path) => {
            const classAttr = path.getAttribute('class') || '';
            const classTokens = classAttr.split(/\s+/).map((c) => c.trim()).filter(Boolean);
            const stateCode = classTokens.find((t) => STATE_CODE_PATTERN.test(t));

            if (!stateCode) return; // skip non-state paths
            if (stateCode === 'dc') return; // skip DC
            if (this.svgPathElements.has(stateCode)) {
                console.log(`⚠️ Duplicate state code "${stateCode}" found - using first occurrence`);
                return;
            }

            this.svgPathElements.set(stateCode, path as SVGPathElement);
            stateCodes.push(stateCode);
            
            // Setup will be done by child classes if needed
            this.setupStatePathInteraction(path as SVGPathElement, stateCode);
        });

        if (stateCodes.length === 0) {
            console.error('❌ No states were parsed! Check if paths have class attributes');
        }

        return stateCodes;
    }
    
    /** Hook for child classes to set up click handlers - override if needed */
    protected setupStatePathInteraction(path: SVGPathElement, stateCode: string): void {
        // Base implementation does nothing - child classes can override
    }

    /** Update SVG colors from model state */
    refreshMap(): void {
        const states = this.model.getAllStates();
        states.forEach((state, code) => {
            const path = this.svgPathElements.get(code);
            if (path) {
                path.style.fill = state.getColor();
            }
        });
    }

    /** Randomly pick a state and highlight it with its neighbors */
    pickRandomState(): void {
        const allStates = this.model.getAllStatesCodes();
        if (allStates.length === 0) return;
        
        // Pick a random state
        const randomIndex = Math.floor(Math.random() * allStates.length);
        const randomStateCode = allStates[randomIndex];
        
        console.log(`🎲 Randomly selected state: ${randomStateCode}`);
        
        // Use the model's setCurrentState method
        this.model.setCurrentState(randomStateCode);
        
        // Update the view to reflect the changes
        this.updateViewFromModel();
    }

    /** Sync the view with the model's current state */
    updateViewFromModel(): void {
        const states = this.model.getAllStates();
        states.forEach((state, code) => {
            const pathElement = this.svgPathElements.get(code);
            if (!pathElement) return;

            // If state is guessed, it should be green regardless of its current color
            if (state.getIsGuessed()) {
                pathElement.setAttribute('fill', '#00ff00'); // Green for guessed
            } else {
                pathElement.setAttribute('fill', state.getColor());
            }
            
            // Update highlight opacity
            pathElement.style.opacity = state.getIsHighlighted() ? '0.7' : '1';
        });

        // Update input text and history
        this.refreshInputText();
        this.refreshHistory();
    }

    /** Show all layers */
    show(): void {
        this.backgroundLayer.show();
        this.layer.show();
        if (this.inputTextLayer) this.inputTextLayer.show();
        if (this.historyLayer) this.historyLayer.show();
        if (this.svgContainer) this.svgContainer.style.visibility = 'visible';
    }

    /** Hide all layers */
    hide(): void {
        this.backgroundLayer.hide();
        this.layer.hide();
        if (this.inputTextLayer) this.inputTextLayer.hide();
        if (this.historyLayer) this.historyLayer.hide();
        if (this.svgContainer) this.svgContainer.style.visibility = 'hidden';
    }

    /** Set callback for correct answer events */
    setOnCorrectAnswerCallback(callback: () => void): void {
        this.onCorrectAnswerCallback = callback;
    }

    private initializeMinigamePopup(): void {
        this.minigamePopup = document.createElement('div');
        this.minigamePopup.innerText = "this is a minigame pop up";
        this.minigamePopup.style.position = 'absolute';
        this.minigamePopup.style.top = '50%';
        this.minigamePopup.style.left = '50%';
        this.minigamePopup.style.transform = 'translate(-50%, -50%)';
        this.minigamePopup.style.backgroundColor = 'black';
        this.minigamePopup.style.color = 'yellow';
        this.minigamePopup.style.padding = '20px';
        this.minigamePopup.style.border = '2px solid white';
        this.minigamePopup.style.zIndex = '2000';
        this.minigamePopup.style.display = 'none';
        document.body.appendChild(this.minigamePopup);
    }

    showMinigamePopup(): void {
        this.minigamePopup.style.display = 'block';
    }

    hideMinigamePopup(): void {
        this.minigamePopup.style.display = 'none';
    }

    getMinigamePopupElement(): HTMLDivElement {
        return this.minigamePopup;
    }

    // inject pulse for making green pulse around the svg map
    private injectPulseCSSCorrect(): void {
    if (document.getElementById("pulse-style-green")) return;

    const style = document.createElement("style");
    style.id = "pulse-style-green";
    style.textContent = `
        @keyframes green-pulse-filter {
            0% { filter: drop-shadow(0 0 0 rgba(0,255,0,0)); }
            50% { filter: drop-shadow(0 0 20px rgba(3, 170, 3, 0.95)); }
            100% { filter: drop-shadow(0 0 0 rgba(0,255,0,0)); }
        }

        .pulse-once-green {
            animation: green-pulse-filter 0.4s ease-out;
        }
    `;
    document.head.appendChild(style);
}

    // inject pulse for making red pulse around the svg map

private injectPulseCSSWrong(): void {
    if (document.getElementById("pulse-style-red")) return;

    const style = document.createElement("style");
    style.id = "pulse-style-red";
    style.textContent = `
        @keyframes red-pulse-filter {
            0% { filter: drop-shadow(0 0 0 rgba(255,0,0,0)); }
            50% { filter: drop-shadow(0 0 20px rgba(255,0,0,0.95)); }
            100% { filter: drop-shadow(0 0 0 rgba(255,0,0,0)); }
        }

        .pulse-once-red {
            animation: red-pulse-filter 0.4s ease-out;
        }
    `;
    document.head.appendChild(style);
}

    // pulses green on correct answer
    pulseMapSVGCorrect(): void {
        if (!this.svgContainer || !this.svgContainer.firstElementChild) return;
        const svg = this.svgContainer.firstElementChild as HTMLElement;

        const className = 'pulse-once-green';

        svg.classList.remove(className);
        void svg.offsetWidth;
        svg.classList.add(className);

        const handleAnimationEnd = () => {
            svg.classList.remove(className);
            svg.removeEventListener('animationend', handleAnimationEnd);
        };
        svg.addEventListener('animationend', handleAnimationEnd);
    }

    pulseMapSVGWrong(): void {
        if (!this.svgContainer || !this.svgContainer.firstElementChild) return;
        const svg = this.svgContainer.firstElementChild as HTMLElement;

        const className = 'pulse-once-red';

        svg.classList.remove(className);
        void svg.offsetWidth;
        svg.classList.add(className);

        const handleAnimationEnd = () => {
            svg.classList.remove(className);
            svg.removeEventListener('animationend', handleAnimationEnd);
        };
        svg.addEventListener('animationend', handleAnimationEnd);
    }   


    /** Cleanup */
    destroy(): void {
        window.removeEventListener('resize', this.handleResize.bind(this));
        if (this.svgContainer) {
            document.body.removeChild(this.svgContainer);
        }
    }
}
