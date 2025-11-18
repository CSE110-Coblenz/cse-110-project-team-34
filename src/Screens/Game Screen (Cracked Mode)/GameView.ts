import Konva from 'konva';
import { GameModel, State } from './GameModel';
import { ensureLiefFontLoaded } from '../../utils/FontLoader';
import { createPixelImage } from '../../utils/KonvaHelpers';
import { crackedModeShowGameClock, crackedModeShowInputLabel, crackedModeAllowStateClicking, crackedModeShowStatesGuessed } from '../../sandbox';

// helper for sequential layer drawing
async function drawSequentially(...layers: Konva.Layer[]): Promise<void> {
  for (const layer of layers) {
    layer.draw();
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

// Export the class so ViewManager.ts can import it
export class GameView {

    private stage: Konva.Stage;
    private backgroundLayer: Konva.Layer;
    private layer: Konva.Layer;
    private uiLayer: Konva.Layer; // Separate layer for UI elements that need responsive scaling
    private svgContainer: HTMLDivElement | null = null;
    private svgPathElements: Map<string, SVGPathElement> = new Map(); // View's DOM map
    private backgroundImage: Konva.Image | null = null;
    private overlayBackgroundImage: Konva.Image | null = null;
    private leftSideImage: Konva.Image | null = null;
    private belowOverlayImage: Konva.Image | null = null;
    // Offset applied to overlay image and US map (base background stays fixed)
    private overlayMapOffsetY: number = 0;
    private overlayBaseX: number | null = null;
    private overlayBaseY: number | null = null;
    private model: GameModel;
    private onCorrectAnswerCallback: (() => void) | null = null;

    // FOR THE GAME CLOCK (Developer) - DOM element
    private gameClockContainer: HTMLDivElement | null = null;
    private animatedClockValue: number = 0;
    private clockAnimationFrameId: number | null = null;

    // FOR THE STATES GUESSED COUNTER (Developer) - DOM element
    private statesGuessedContainer: HTMLDivElement | null = null;

    // FOR THE TEXT INPUT BOX
    private inputTextLayer!: Konva.Layer;
    private inputTextDisplay!: Konva.Text;
    private inputLabelContainer: HTMLDivElement | null = null; // DOM element for developer label

    // FOR THE INPUT HISTORY LIST
    private historyLayer!: Konva.Layer;
    private historyTextDisplay!: Konva.Text;

     // The constructor must accept a Konva.Stage, as ViewManager.ts passes one in.
    constructor(stage: Konva.Stage, model: GameModel) {
        this.stage = stage;
        this.model = model;
        
        // Create background layer first (renders behind everything)
        this.backgroundLayer = new Konva.Layer();
        this.stage.add(this.backgroundLayer);
        
        // Ensure custom 'Lief' font is available for any future text usage on Game screen
        ensureLiefFontLoaded();
        
        // Create main layer for other content
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // Create UI layer for responsive UI elements (on top of game world)
        this.uiLayer = new Konva.Layer();
        this.stage.add(this.uiLayer);

        // Create a container for the SVG (View only mounts it)
        this.createSVGContainer();

        // Initialize text input
        this.initializeTextInput();

        // Initialize input history display
        this.initializeHistoryDisplay();

        // Initialize developer features if enabled
        if (crackedModeShowGameClock) {
            this.initializeGameClock();
        }
        if (crackedModeShowStatesGuessed) {
            this.initializeStatesGuessed();
        }

        // Apply initial vertical offset from the model (overlay + map only)
        this.setOverlayMapOffsetY(this.model.overlayMapOffsetY);

        // Setup window resize listener for responsive UI
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /** Initialize and load assets in deterministic order */
    async init(): Promise<void> {
        await this.loadImagesSequentially();
        await drawSequentially(this.backgroundLayer, this.layer);
    }

    /** sequential image loading to avoid race conditions */
    private async loadImagesSequentially(): Promise<void> {
        // 1 Base background
        await this.loadImage(this.model.baseBackgroundSrc, (img) => {
            this.backgroundImage = this.createScaledImage(img, true);
            this.backgroundLayer.add(this.backgroundImage);
            console.log('✓ Base background loaded');
        });

        // 2 Overlay (centered and scaled)
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

        // 3 Left-side image
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
            // Position the history text on top of this image
            this.updateHistoryDisplay();
            console.log('✓ Left-side image loaded (input history background)');
        });

        // 4 Below-overlay image (text input background)
        await this.loadImage(this.model.belowOverlayImageSrc, (img) => {
            this.belowOverlayImage = createPixelImage(img, { x: 0, y: 0 });
            this.belowOverlayImage.scaleX(this.model.belowOverlayImageScaleX);
            this.belowOverlayImage.scaleY(this.model.belowOverlayImageScaleY);
            this.updateBelowOverlayPosition();
            this.backgroundLayer.add(this.belowOverlayImage);
            // Position the text input display on top of this image
            this.updateInputTextDisplay();
            console.log('✓ Below-overlay image loaded (text input background)');
        });

        // Draw them in guaranteed order
        await drawSequentially(this.backgroundLayer);
    }

    /** Promise-based image loader */
    private async loadImage(src: string, onload: (img: HTMLImageElement) => void): Promise<void> {
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

    /** helper to scale and stretch image if needed */
    private createScaledImage(img: HTMLImageElement, stretch: boolean): Konva.Image {
        const imageNode = createPixelImage(img, { x: 0, y: 0 });
        if (stretch) {
            const scaleX = this.stage.width() / img.width;
            const scaleY = this.stage.height() / img.height;
            imageNode.scaleX(scaleX);
            imageNode.scaleY(scaleY);
        }
        return imageNode;
    }

    /**
     * Create a DOM container to hold the SVG
     */
    private createSVGContainer(): void {
        // Create container div
        this.svgContainer = document.createElement('div');
        this.svgContainer.id = 'us-map-container';
        this.svgContainer.style.position = 'absolute';
        this.svgContainer.style.top = '0';
        this.svgContainer.style.left = '0';
        this.svgContainer.style.width = '100%';
        this.svgContainer.style.height = '100%';
        this.svgContainer.style.display = 'flex'; // use flexbox for centering
        this.svgContainer.style.justifyContent = 'center'; // center horizontally
        this.svgContainer.style.alignItems = 'center'; // center vertically
        this.svgContainer.style.pointerEvents = 'auto'; // allow interactions (clicks on states)
        this.svgContainer.style.visibility = 'hidden'; // hidden by default, use visibility instead of display
        this.svgContainer.style.overflow = 'visible'; // Don't clip the SVG
        
        // Add to body
        document.body.appendChild(this.svgContainer);
    }

    /** Calculate responsive SVG scale based on window dimensions */
    private getResponsiveSVGScale(): number {
        // Calculate scale factor based on window size relative to baseline (1920x1080)
        const widthScale = window.innerWidth / 1920;
        const heightScale = window.innerHeight / 1080;
        
        // Use the smaller scale to ensure map fits in window
        const scale = Math.min(widthScale, heightScale);
        
        // Scale down to 45% of the baseline (halved from 90%)
        return scale * 1;
    }

    /** Apply responsive styles to SVG element */
    private applySVGStyles(svg: SVGSVGElement): void {
        const scale = this.getResponsiveSVGScale();
        
        // Use CSS transform to scale the entire SVG
        svg.style.transform = `scale(${scale})`;
        svg.style.transformOrigin = 'center center';
        svg.style.display = 'block';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }

     /** Keep the belowOverlayImage positioned under the overlay, centered horizontally. */
    private updateBelowOverlayPosition(): void {
        if (!this.overlayBackgroundImage || !this.belowOverlayImage) return;
        const overlay = this.overlayBackgroundImage;
        const below = this.belowOverlayImage;

        const overlayDisplayedW = overlay.width() * overlay.scaleX();
        const overlayDisplayedH = overlay.height() * overlay.scaleY();
        const belowDisplayedW = below.width() * below.scaleX();

        // Overlay top-left
        const overlayLeft = overlay.x();
        const overlayTop = overlay.y();
        const overlayCenterX = overlayLeft + overlayDisplayedW / 2;

        // Center the below image horizontally with the overlay, place below with margin
        const x = overlayCenterX - belowDisplayedW / 2;
        const y = overlayTop + overlayDisplayedH + this.model.belowOverlayMarginTop;
        below.x(x);
        below.y(y);
        
        // Update text input position when the image moves
        this.updateInputTextDisplay();
    }

    /** Attach a parsed SVG to the View's container and style it. */
    attachMap(svg: SVGSVGElement): void {
        if (!this.svgContainer) return;
        this.svgContainer.innerHTML = '';
        this.svgContainer.appendChild(svg);
        // Apply responsive styles
        this.applySVGStyles(svg);
        console.log('US map attached to view');
    }

    /** Load and parse the SVG, building a map of state codes -> SVGPathElements. */
    async loadMap(svgPath: string): Promise<string[]> {
        if (!this.svgContainer) throw new Error('SVG container not ready');

        const response = await fetch(svgPath);
        if (!response.ok) {
            throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`);
        }

        const svgText = await response.text();
        this.svgContainer.innerHTML = svgText;

        const svg = this.svgContainer.querySelector('svg');
        if (!svg) {
            throw new Error('SVG root element not found');
        }

        // Remove all <title> elements to disable tooltips (unless allowStateClicking is enabled)
        if (!crackedModeAllowStateClicking) {
            const titles = svg.querySelectorAll('title');
            titles.forEach(title => title.remove());
        }

        // Apply responsive styles to the SVG
        this.applySVGStyles(svg);

        // Parse state paths and build the DOM map
        const stateCodes = this.parseStatePaths(svg);
        console.log(`View parsed ${stateCodes.length} state paths`);
        return stateCodes;
    }

    /** Parse SVG path elements and return list of state codes. */
    private parseStatePaths(svg: SVGSVGElement): string[] {
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
            
            // Add click handler to each state (only if developer flag is enabled)
            if (crackedModeAllowStateClicking) {
                path.addEventListener('click', () => this.handleStateClick(stateCode));
                path.style.cursor = 'pointer';
            }
        });

        if (stateCodes.length === 0) {
            console.error('❌ No states were parsed! Check if paths have class attributes');
        }

        return stateCodes;
    }

    /** Get a path element by state code (for click handlers). */
    getPathElement(stateCode: string): SVGPathElement | undefined {
        return this.svgPathElements.get(stateCode);
    }

    /** Handle state click - highlight clicked state and its neighbors */
    private handleStateClick(stateCode: string): void {
        console.log(`🖱️ State clicked: ${stateCode}`);
        
        // Use the model's setCurrentState method
        this.model.setCurrentState(stateCode);

        // Update the view to reflect the changes
        this.updateViewFromModel();
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

    /** Sync the view with the model's current state. */
	updateViewFromModel(): void {
		const states = this.model.getAllStates();
		states.forEach((state, code) => {
			const pathElement = this.svgPathElements.get(code);
			if (!pathElement) return;

			// If state is guessed, it should be green regardless of its current color
			if (state.getIsGuessed()) {
				pathElement.setAttribute('fill', '#00ff00'); // Green for guessed
			} else {
				// Update color based on model state
				pathElement.setAttribute('fill', state.getColor());
			}

			// Update highlight opacity
			pathElement.style.opacity = state.getIsHighlighted() ? '0.7' : '1';
		});
		
		// Update developer displays if enabled
		if (crackedModeShowGameClock) {
			this.updateGameClockDisplay();
		}
		if (crackedModeShowStatesGuessed) {
			this.updateStatesGuessedDisplay();
		}
	}

    /** Get all state codes currently in the view. */
    getAllStateCodes(): string[] {
        return Array.from(this.svgPathElements.keys());
    }

    /**
     * Move overlay image and US SVG together by a vertical offset.
     * Base background remains fixed. Positive moves down, negative moves up.
     */
    setOverlayMapOffsetY(offsetY: number): void {
        this.overlayMapOffsetY = offsetY;
        this.applyOverlayMapOffset();
    }

    /** Apply the current overlayMapOffsetY to overlay image and US map. */
    private applyOverlayMapOffset(): void {
        // Move overlay relative to its base position
        if (this.overlayBackgroundImage != null) {
            // Establish base if not already captured
            if (this.overlayBaseY == null) {
                this.overlayBaseX = this.overlayBackgroundImage.x();
                this.overlayBaseY = this.overlayBackgroundImage.y();
            }
            const baseY = this.overlayBaseY ?? 0;
            const baseX = this.overlayBaseX ?? this.overlayBackgroundImage.x();
            this.overlayBackgroundImage.x(baseX);
            this.overlayBackgroundImage.y(baseY + this.overlayMapOffsetY);
            this.backgroundLayer.batchDraw();
        }

        // Reposition the image that sits below the overlay whenever overlay moves
        this.updateBelowOverlayPosition();

        // Move the SVG container by the same amount
        if (this.svgContainer) {
            this.svgContainer.style.transform = `translate(0px, ${this.overlayMapOffsetY}px)`;
        }
    }

    /** Handle window resize event to reposition and rescale UI elements */
    private handleResize(): void {
        // Recalculate all positions and scales since model getters are now responsive
        
        // 1. Update overlay position and scale
        if (this.overlayBackgroundImage) {
            this.overlayBackgroundImage.scaleX(this.model.overlayScaleX);
            this.overlayBackgroundImage.scaleY(this.model.overlayScaleY);
            
            if (this.model.centerOverlay) {
                const displayedW = this.overlayBackgroundImage.width() * this.overlayBackgroundImage.scaleX();
                const displayedH = this.overlayBackgroundImage.height() * this.overlayBackgroundImage.scaleY();
                this.overlayBackgroundImage.x((this.stage.width() - displayedW) / 2);
                this.overlayBackgroundImage.y((this.stage.height() - displayedH) / 2);
            }
            
            // Reset base positions
            this.overlayBaseX = this.overlayBackgroundImage.x();
            this.overlayBaseY = this.overlayBackgroundImage.y();
            this.applyOverlayMapOffset();
        }
        
        // 2. Update left-side image
        if (this.leftSideImage) {
            this.leftSideImage.scaleX(this.model.leftSideImageScaleX);
            this.leftSideImage.scaleY(this.model.leftSideImageScaleY);
            
            const img = this.leftSideImage.image() as HTMLImageElement;
            const naturalW = img?.width || 0;
            const displayedW = naturalW * this.leftSideImage.scaleX();
            const x = this.model.leftSideImageMarginLeft + displayedW / 2;
            const y = (this.stage.height() / 2) + (this.model.leftSideImageOffsetY || 0);
            this.leftSideImage.x(x);
            this.leftSideImage.y(y);
        }
        
        // 3. Update below-overlay image
        if (this.belowOverlayImage) {
            this.belowOverlayImage.scaleX(this.model.belowOverlayImageScaleX);
            this.belowOverlayImage.scaleY(this.model.belowOverlayImageScaleY);
        }
        
        // 4. Resize SVG map responsively
        if (this.svgContainer) {
            const svg = this.svgContainer.querySelector('svg');
            if (svg) {
                this.applySVGStyles(svg);
            }
        }
        
        // 5. Reposition all UI elements based on new dimensions
        this.updateBelowOverlayPosition();
        this.updateInputTextDisplay();
        this.updateHistoryDisplay();
        this.repositionGameClock();
        this.repositionStatesGuessed();
        
        // 6. Redraw all layers
        this.backgroundLayer.batchDraw();
        this.uiLayer.batchDraw();
    }

    /**
     * Move the left-side image up/down independently of the overlay/map.
     * Positive moves down, negative moves up.
     */
    setLeftSideImageOffsetY(offsetY: number): void {
        this.model.leftSideImageOffsetY = offsetY;
        if (this.leftSideImage) {
            const y = (this.stage.height() / 2) + (this.model.leftSideImageOffsetY || 0);
            this.leftSideImage.y(y);
            this.backgroundLayer.batchDraw();
        }
    }

    // TEXT INPUT BOX METHODS
    initializeTextInput() {
        this.inputTextLayer = new Konva.Layer();
        this.stage.add(this.inputTextLayer);

        // Create DOM label for developer view (renders on top like game clock)
        if (crackedModeShowInputLabel) {
            this.inputLabelContainer = document.createElement('div');
            this.inputLabelContainer.id = 'input-label-display';
            this.inputLabelContainer.style.position = 'absolute';
            this.inputLabelContainer.style.color = '#ffff00'; // Yellow
            this.inputLabelContainer.style.backgroundColor = '#000000'; // Black background
            this.inputLabelContainer.style.padding = '5px 10px';
            this.inputLabelContainer.style.fontFamily = 'Arial';
            this.inputLabelContainer.style.fontWeight = 'bold';
            this.inputLabelContainer.style.zIndex = '10000'; // Very high z-index to be on top
            this.inputLabelContainer.style.pointerEvents = 'none'; // Don't block clicks
            this.inputLabelContainer.textContent = '(Developer View) Enter text below';
            
            document.body.appendChild(this.inputLabelContainer);
        }

        this.inputTextDisplay = new Konva.Text({
            x: 0,
            y: 0,
            text: '',
            fontSize: 0, // Will be calculated responsively
            fontFamily: 'Arial',
            fill: '#2c3e50',
            align: 'center',
            verticalAlign: 'middle',
        });

        this.inputTextLayer.add(this.inputTextDisplay);

        // Set up keyboard event listeners
        window.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    private handleKeyPress(e: KeyboardEvent): void {
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
                    this.updateHistoryDisplay();
                }
                // If incorrect, don't add to history
            }
            // Always clear the input text after Enter
            this.model.clearInputText();
            this.updateInputTextDisplay();
        } else if (e.key === 'Backspace') {
            // Remove last character
            const currentText = this.model.getInputText();
            this.model.setInputText(currentText.slice(0, -1));
            this.updateInputTextDisplay();
        } else if (e.key.length === 1 && /[a-zA-Z ]/.test(e.key)) {
            // Add the character (now allowing spaces for state names like "New York")
            const currentText = this.model.getInputText();
            this.model.setInputText(currentText + e.key);
            this.updateInputTextDisplay();
        }
    }

    private updateInputTextDisplay(): void {
        const text = this.model.getInputText();
        this.inputTextDisplay.text(text);

        // Position the text centered on the belowOverlayImage
        if (this.belowOverlayImage) {
            const imgX = this.belowOverlayImage.x();
            const imgY = this.belowOverlayImage.y();
            const imgWidth = this.belowOverlayImage.width() * this.belowOverlayImage.scaleX();
            const imgHeight = this.belowOverlayImage.height() * this.belowOverlayImage.scaleY();

            // Responsive font size based on image height
            const fontSize = Math.max(16, imgHeight * 0.15);
            this.inputTextDisplay.fontSize(fontSize);

            // Center the text
            this.inputTextDisplay.width(imgWidth);
            this.inputTextDisplay.x(imgX);
            this.inputTextDisplay.y(imgY + imgHeight / 2 - fontSize); // Vertically centered
            
            // Position DOM label above the input box (only if enabled)
            if (crackedModeShowInputLabel && this.inputLabelContainer) {
                const labelFontSize = Math.max(12, imgHeight * 0.3);
                this.inputLabelContainer.style.fontSize = `${labelFontSize}px`;
                this.inputLabelContainer.style.left = `${imgX}px`;
                this.inputLabelContainer.style.top = `${imgY - labelFontSize - 20}px`; // Above the image with gap
                this.inputLabelContainer.style.width = `${imgWidth}px`;
                this.inputLabelContainer.style.textAlign = 'center';
            }
        }

        this.inputTextLayer.batchDraw();
    }

    //INPUT HISTORY LIST METHODS
    initializeHistoryDisplay() {
        this.historyLayer = new Konva.Layer();
        this.stage.add(this.historyLayer);

        this.historyTextDisplay = new Konva.Text({
            x: 0,
            y: 0,
            text: '',
            fontSize: 0, // Will be calculated responsively
            fontFamily: 'Arial',
            fill: '#2c3e50',
            align: 'left',
            lineHeight: 1.5,
            padding: 10,
        });

        this.historyLayer.add(this.historyTextDisplay);
    }

    private updateHistoryDisplay(): void {
        const history = this.model.getInputHistory();
        
        // Create a list of all inputs without enumeration
        const historyText = history.join('\n');
        this.historyTextDisplay.text(historyText);

        // Position the text on the left-side image
        if (this.leftSideImage) {
            const imgX = this.leftSideImage.x();
            const imgY = this.leftSideImage.y();
            const imgWidth = this.leftSideImage.width() * this.leftSideImage.scaleX();
            const imgHeight = this.leftSideImage.height() * this.leftSideImage.scaleY();
            
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
        }

        this.historyLayer.batchDraw();
    }

    /** Set a callback to be invoked when a correct answer is given */
    setOnCorrectAnswerCallback(callback: () => void): void {
        this.onCorrectAnswerCallback = callback;
    }

    // GAME CLOCK METHODS (Developer)
    initializeGameClock() {
        // Create a DOM div for the game clock
        this.gameClockContainer = document.createElement('div');
        this.gameClockContainer.id = 'game-clock-display';
        this.gameClockContainer.style.position = 'absolute';
        this.gameClockContainer.style.color = '#ffff00'; // Yellow
        this.gameClockContainer.style.backgroundColor = '#000000'; // Black background
        this.gameClockContainer.style.padding = '5px 10px';
        this.gameClockContainer.style.fontFamily = 'Arial';
        this.gameClockContainer.style.fontWeight = 'bold';
        this.gameClockContainer.style.zIndex = '10000'; // Very high z-index to be on top
        this.gameClockContainer.style.pointerEvents = 'none'; // Don't block clicks
        this.gameClockContainer.textContent = `(Developer View) GameClock: ${this.model.getGameClock()}`;
        
        document.body.appendChild(this.gameClockContainer);
        
        // Position responsively
        this.repositionGameClock();
        
        // Start the smooth animation loop
        this.startClockAnimation();
    }

    private startClockAnimation(): void {
        let lastFrameTime = performance.now();
        
        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;
            
            const targetValue = this.model.getGameClock();
            
            // Always increment by approximately 1ms per millisecond of real time
            // This ensures smooth counting: 0, 1, 2, 3, 4, 5...
            if (this.animatedClockValue < targetValue) {
                this.animatedClockValue += deltaTime;
                // Clamp to target to avoid overshooting
                if (this.animatedClockValue > targetValue) {
                    this.animatedClockValue = targetValue;
                }
            } else {
                this.animatedClockValue = targetValue;
            }
            
            // Update display with animated value
            if (this.gameClockContainer) {
                this.gameClockContainer.textContent = `(Developer View) GameClock: ${Math.floor(this.animatedClockValue)}`;
            }
            
            // Continue animation
            this.clockAnimationFrameId = requestAnimationFrame(animate);
        };
        
        animate(performance.now());
    }

    updateGameClockDisplay(): void {
        // The animation loop handles the display update
        // This method is kept for compatibility but does nothing
    }

    private repositionGameClock(): void {
        if (this.gameClockContainer) {
            // Position in top-left corner with responsive offset
            const topOffset = window.innerHeight * 0.02;
            const leftOffset = window.innerWidth * 0.02;
            this.gameClockContainer.style.top = `${topOffset}px`;
            this.gameClockContainer.style.left = `${leftOffset}px`;
            
            // Responsive font size
            const fontSize = Math.max(14, window.innerHeight * 0.02);
            this.gameClockContainer.style.fontSize = `${fontSize}px`;
        }
    }

    //STATES GUESSED COUNTER METHODS (Developer)
    initializeStatesGuessed() {
        // Create a DOM div for the states guessed counter
        this.statesGuessedContainer = document.createElement('div');
        this.statesGuessedContainer.id = 'states-guessed-display';
        this.statesGuessedContainer.style.position = 'absolute';
        this.statesGuessedContainer.style.color = '#ffff00'; // Yellow
        this.statesGuessedContainer.style.backgroundColor = '#000000'; // Black background
        this.statesGuessedContainer.style.padding = '5px 10px';
        this.statesGuessedContainer.style.fontFamily = 'Arial';
        this.statesGuessedContainer.style.fontWeight = 'bold';
        this.statesGuessedContainer.style.zIndex = '10000'; // Very high z-index to be on top
        this.statesGuessedContainer.style.pointerEvents = 'none'; // Don't block clicks
        this.statesGuessedContainer.textContent = `(Developer View) States Guessed: ${this.model.getStatesGuessedCount()}`;
        
        document.body.appendChild(this.statesGuessedContainer);
        
        // Position below the game clock
        this.repositionStatesGuessed();
    }

    updateStatesGuessedDisplay(): void {
        if (this.statesGuessedContainer) {
            this.statesGuessedContainer.textContent = `(Developer View) States Guessed: ${this.model.getStatesGuessedCount()}`;
        }
    }

    private repositionStatesGuessed(): void {
        if (this.statesGuessedContainer) {
            // Position below the game clock with responsive offset
            const topOffset = window.innerHeight * 0.02;
            const leftOffset = window.innerWidth * 0.02;
            const fontSize = Math.max(14, window.innerHeight * 0.02);
            
            // Calculate vertical position: below game clock if visible, otherwise at top
            let verticalPosition = topOffset;
            if (crackedModeShowGameClock && this.gameClockContainer) {
                const clockHeight = this.gameClockContainer.offsetHeight;
                verticalPosition = topOffset + clockHeight + 5; // 5px gap
            }
            
            this.statesGuessedContainer.style.top = `${verticalPosition}px`;
            this.statesGuessedContainer.style.left = `${leftOffset}px`;
            this.statesGuessedContainer.style.fontSize = `${fontSize}px`;
        }
    }

    // show() method is required by ViewManager.ts
    show() {
        this.backgroundLayer.show();
        this.layer.show();
        if (this.inputTextLayer) {
            this.inputTextLayer.show();
        }
        if (this.historyLayer) {
            this.historyLayer.show();
        }
        if (this.svgContainer) {
            this.svgContainer.style.visibility = 'visible';
        }
    }

    // hide() method is required by ViewManager.ts
    hide() {
        this.backgroundLayer.hide();
        this.layer.hide();
        if (this.inputTextLayer) {
            this.inputTextLayer.hide();
        }
        if (this.historyLayer) {
            this.historyLayer.hide();
        }
        if (this.svgContainer) {
            this.svgContainer.style.visibility = 'hidden';
        }
    }

    destroy(): void {
        // Stop clock animation
        if (this.clockAnimationFrameId !== null) {
            cancelAnimationFrame(this.clockAnimationFrameId);
            this.clockAnimationFrameId = null;
        }
        
        // Remove developer display containers
        if (this.gameClockContainer) {
            this.gameClockContainer.remove();
            this.gameClockContainer = null;
        }
        if (this.statesGuessedContainer) {
            this.statesGuessedContainer.remove();
            this.statesGuessedContainer = null;
        }
        if (this.inputLabelContainer) {
            this.inputLabelContainer.remove();
            this.inputLabelContainer = null;
        }
        
        if (this.svgContainer) {
            this.svgContainer.remove();
            this.svgContainer = null;
        }
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyPress.bind(this));
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        this.backgroundLayer.destroy();
        this.layer.destroy();
        this.uiLayer.destroy();
        if (this.inputTextLayer) {
            this.inputTextLayer.destroy();
        }
        if (this.historyLayer) {
            this.historyLayer.destroy();
        }
    }
}
