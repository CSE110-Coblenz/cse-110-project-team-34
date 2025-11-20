import Konva from 'konva';
import { GameModel, State } from './practiceModel';
import { createPixelImage } from '../../utils/KonvaHelpers';

// Helper for sequential layer drawing
async function drawSequentially(...layers: Konva.Layer[]): Promise<void> {
    for (const layer of layers) {
        layer.draw();
        await new Promise((resolve) => requestAnimationFrame(resolve));
    }
}

// Game View for Practice Mode
export class GameView {
    private stage: Konva.Stage;
    private backgroundLayer: Konva.Layer;
    private layer: Konva.Layer;
    private model: GameModel;
    private svgContainer: HTMLDivElement | null = null;
    private svgPathElements: Map<string, SVGPathElement> = new Map(); // View's DOM map
    private backgroundImage: Konva.Image | null = null;
    private overlayBackgroundImage: Konva.Image | null = null;
    private leftSideImage: Konva.Image | null = null;
    private belowOverlayImage: Konva.Image | null = null;
    private overlayMapOffsetY: number = 0;
    private overlayBaseX: number | null = null;
    private overlayBaseY: number | null = null;
    private onCorrectAnswerCallback: (() => void) | null = null;

    // FOR THE TEXT INPUT BOX
    private inputTextLayer!: Konva.Layer;
    private inputTextDisplay!: Konva.Text;

    // FOR THE INPUT HISTORY LIST
    private historyLayer!: Konva.Layer;
    private historyTextDisplay!: Konva.Text;

    constructor(stage: Konva.Stage, model: GameModel) {
        this.stage = stage;
        this.model = model;
        
        // Create background layer first (renders behind everything)
        this.backgroundLayer = new Konva.Layer();
        this.stage.add(this.backgroundLayer);
        
        // Create main layer for other content
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
        
        // Create a container for the SVG
        this.createSVGContainer();

        // Initialize text input
        this.initializeTextInput();

        // Initialize input history display
        this.initializeHistoryDisplay();
        
        // Apply initial vertical offset from the model
        this.setOverlayMapOffsetY(this.model.overlayMapOffsetY);
        
        console.log('Practice Mode GameView initialized');
    }

    /** Initialize and load assets in deterministic order */
    async init(): Promise<void> {
        await this.loadImagesSequentially();
        await drawSequentially(this.backgroundLayer, this.layer);
    }

    /** Sequential image loading to avoid race conditions */
    private async loadImagesSequentially(): Promise<void> {
        // 1. Base background
        await this.loadImage(this.model.baseBackgroundSrc, (img) => {
            this.backgroundImage = this.createScaledImage(img, true);
            this.backgroundLayer.add(this.backgroundImage);
            console.log('✓ Base background loaded (Practice Mode)');
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
            console.log('✓ Overlay background loaded (Practice Mode)');
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
            const y = (this.stage.height() / 2) + this.model.leftSideImageOffsetY;
            this.leftSideImage.x(x);
            this.leftSideImage.y(y);

            this.backgroundLayer.add(this.leftSideImage);
            console.log('✓ Left-side image loaded (Practice Mode)');
        });

        // 4. Below-overlay image
        await this.loadImage(this.model.belowOverlayImageSrc, (img) => {
            this.belowOverlayImage = createPixelImage(img, { x: 0, y: 0 });
            this.belowOverlayImage.scaleX(this.model.belowOverlayImageScaleX);
            this.belowOverlayImage.scaleY(this.model.belowOverlayImageScaleY);
            this.updateBelowOverlayPosition();
            this.backgroundLayer.add(this.belowOverlayImage);
            console.log('✓ Below-overlay image loaded (Practice Mode)');
        });

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

    /** Helper to scale and stretch image if needed */
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

    /** Create a DOM container to hold the SVG */
    private createSVGContainer(): void {
        this.svgContainer = document.createElement('div');
        this.svgContainer.id = 'us-map-container-practice';
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
    private getResponsiveSVGScale(): number {
        const widthScale = window.innerWidth / 1920;
        const heightScale = window.innerHeight / 1080;
        const scale = Math.min(widthScale, heightScale);
        return scale * 1;
    }

    /** Apply responsive styles to SVG element */
    private applySVGStyles(svg: SVGSVGElement): void {
        const scale = this.getResponsiveSVGScale();
        svg.style.transform = `scale(${scale})`;
        svg.style.transformOrigin = 'center center';
        svg.style.display = 'block';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }

    /** Keep the belowOverlayImage positioned under the overlay, centered horizontally */
    private updateBelowOverlayPosition(): void {
        if (!this.overlayBackgroundImage || !this.belowOverlayImage) return;
        const overlay = this.overlayBackgroundImage;
        const below = this.belowOverlayImage;

        const overlayDisplayedW = overlay.width() * overlay.scaleX();
        const overlayDisplayedH = overlay.height() * overlay.scaleY();
        const belowDisplayedW = below.width() * below.scaleX();

        const overlayLeft = overlay.x();
        const overlayTop = overlay.y();
        const overlayCenterX = overlayLeft + overlayDisplayedW / 2;

        const x = overlayCenterX - belowDisplayedW / 2;
        const y = overlayTop + overlayDisplayedH + this.model.belowOverlayMarginTop;
        below.x(x);
        below.y(y);
    }

    /** Load and parse the SVG */
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

        // Apply responsive styles to the SVG
        this.applySVGStyles(svg);

        // Parse state paths and build the DOM map
        const stateCodes = this.parseStatePaths(svg);
        console.log(`✓ US map loaded (Practice Mode) - ${stateCodes.length} states parsed`);
        return stateCodes;
    }

    /** Apply the current overlayMapOffsetY to overlay image and US map */
    private applyOverlayMapOffset(): void {
        if (this.overlayBackgroundImage != null) {
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

        this.updateBelowOverlayPosition();

        if (this.svgContainer) {
            this.svgContainer.style.transform = `translate(0px, ${this.overlayMapOffsetY}px)`;
        }
    }

    /** Set the overlay map offset */
    setOverlayMapOffsetY(offsetY: number): void {
        this.overlayMapOffsetY = offsetY;
        this.applyOverlayMapOffset();
    }

    show(): void {
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

    hide(): void {
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
        if (this.svgContainer) {
            this.svgContainer.remove();
            this.svgContainer = null;
        }
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyPress.bind(this));
        
        this.backgroundLayer.destroy();
        this.layer.destroy();
        if (this.inputTextLayer) {
            this.inputTextLayer.destroy();
        }
        if (this.historyLayer) {
            this.historyLayer.destroy();
        }
    }

    /** Parse SVG path elements and return list of state codes with click handlers */
    private parseStatePaths(svg: SVGSVGElement): string[] {
        this.svgPathElements.clear();
        const STATE_CODE_PATTERN = /^[a-z]{2}$/;
        const paths = svg.querySelectorAll('path');
        const stateCodes: string[] = [];

        paths.forEach((path) => {
            const classAttr = path.getAttribute('class') || '';
            const classTokens = classAttr.split(/\s+/).map((c) => c.trim()).filter(Boolean);
            const stateCode = classTokens.find((t) => STATE_CODE_PATTERN.test(t));

            if (!stateCode) return;
            if (stateCode === 'dc') return;
            if (this.svgPathElements.has(stateCode)) return;

            this.svgPathElements.set(stateCode, path as SVGPathElement);
            stateCodes.push(stateCode);
        });

        return stateCodes;
    }

    /** Randomly pick a state and highlight it with its neighbors */
    pickRandomState(): void {
        const allStates = this.model.getAllStatesCodes();
        if (allStates.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * allStates.length);
        const randomStateCode = allStates[randomIndex];
        
        console.log(`🎲 Randomly selected state: ${randomStateCode}`);
        this.model.setCurrentState(randomStateCode);
        this.updateViewFromModel();
    }

    /** Sync the view with the model's current state */
    updateViewFromModel(): void {
        const states = this.model.getAllStates();
        states.forEach((state, code) => {
            const pathElement = this.svgPathElements.get(code);
            if (!pathElement) return;

            if (state.getIsGuessed()) {
                pathElement.setAttribute('fill', '#00ff00');
            } else {
                pathElement.setAttribute('fill', state.getColor());
            }

            pathElement.style.opacity = state.getIsHighlighted() ? '0.7' : '1';
        });
    }

    /** TEXT INPUT BOX METHODS */
    initializeTextInput() {
        this.inputTextLayer = new Konva.Layer();
        this.stage.add(this.inputTextLayer);

        this.inputTextDisplay = new Konva.Text({
            x: 0,
            y: 0,
            text: '',
            fontSize: 0,
            fontFamily: 'Arial',
            fill: '#2c3e50',
            align: 'center',
            verticalAlign: 'middle',
        });

        this.inputTextLayer.add(this.inputTextDisplay);
        window.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    private handleKeyPress(e: KeyboardEvent): void {
        if (this.backgroundLayer.isVisible() === false) return;

        if (e.key === 'Enter') {
            const inputText = this.model.getInputText();
            if (inputText.trim().length > 0) {
                const isCorrect = this.model.processGuess(inputText);
                
                if (isCorrect) {
                    if (this.onCorrectAnswerCallback) {
                        this.onCorrectAnswerCallback();
                    }
                    this.model.addToHistory(inputText.toLowerCase());
                    this.updateViewFromModel();
                    this.updateHistoryDisplay();
                }
            }
            this.model.clearInputText();
            this.updateInputTextDisplay();
        } else if (e.key === 'Backspace') {
            const currentText = this.model.getInputText();
            this.model.setInputText(currentText.slice(0, -1));
            this.updateInputTextDisplay();
        } else if (e.key.length === 1 && /[a-zA-Z ]/.test(e.key)) {
            const currentText = this.model.getInputText();
            this.model.setInputText(currentText + e.key);
            this.updateInputTextDisplay();
        }
    }

    private updateInputTextDisplay(): void {
        const text = this.model.getInputText();
        this.inputTextDisplay.text(text);

        if (this.belowOverlayImage) {
            const imgX = this.belowOverlayImage.x();
            const imgY = this.belowOverlayImage.y();
            const imgWidth = this.belowOverlayImage.width() * this.belowOverlayImage.scaleX();
            const imgHeight = this.belowOverlayImage.height() * this.belowOverlayImage.scaleY();

            const fontSize = Math.max(16, imgHeight * 0.15);
            this.inputTextDisplay.fontSize(fontSize);

            this.inputTextDisplay.width(imgWidth);
            this.inputTextDisplay.x(imgX);
            this.inputTextDisplay.y(imgY + imgHeight / 2 - fontSize);
        }

        this.inputTextLayer.batchDraw();
    }

    /** INPUT HISTORY LIST METHODS */
    initializeHistoryDisplay() {
        this.historyLayer = new Konva.Layer();
        this.stage.add(this.historyLayer);

        this.historyTextDisplay = new Konva.Text({
            x: 0,
            y: 0,
            text: '',
            fontSize: 0,
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
        const historyText = history.join('\n');
        this.historyTextDisplay.text(historyText);

        if (this.leftSideImage) {
            const imgX = this.leftSideImage.x();
            const imgY = this.leftSideImage.y();
            const imgHeight = this.leftSideImage.height() * this.leftSideImage.scaleY();
            
            const fontSize = Math.max(14, window.innerHeight * 0.02);
            this.historyTextDisplay.fontSize(fontSize);
            
            const topLeftX = imgX - imgHeight / 2;
            const topLeftY = imgY - (this.leftSideImage.width() * this.leftSideImage.scaleX()) / 2;

            const paddingX = imgHeight * 0.2;
            const paddingY = imgHeight * 0.1;

            this.historyTextDisplay.x(topLeftX + paddingX);
            this.historyTextDisplay.y(topLeftY + paddingY);
            this.historyTextDisplay.width(imgHeight - 2 * paddingX);
        }

        this.historyLayer.batchDraw();
    }

    /** Set a callback to be invoked when a correct answer is given */
    setOnCorrectAnswerCallback(callback: () => void): void {
        this.onCorrectAnswerCallback = callback;
    }
}

