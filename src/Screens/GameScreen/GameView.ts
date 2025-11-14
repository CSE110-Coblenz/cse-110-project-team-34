import Konva from 'konva';
import { GameModel, State } from './GameModel';
import { ensureLiefFontLoaded } from '../../utils/FontLoader';
import { createPixelImage } from '../../utils/KonvaHelpers';
import { MULTIPLIER } from '../../gameConstants';

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

    //FOR THE MULTIPLIER 
    private multiplier = MULTIPLIER.STARTING_VALUE;
    private multiplierLayer!: Konva.Layer;
    private mutliplierText!: Konva.Text;

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

        // Create a container for the SVG (View only mounts it)
        this.createSVGContainer();

        // Apply initial vertical offset from the model (overlay + map only)
        this.setOverlayMapOffsetY(this.model.overlayMapOffsetY);
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
            console.log('✓ Left-side image loaded');
        });

        // 4 Below-overlay image
        await this.loadImage(this.model.belowOverlayImageSrc, (img) => {
            this.belowOverlayImage = createPixelImage(img, { x: 0, y: 0 });
            this.belowOverlayImage.scaleX(this.model.belowOverlayImageScaleX);
            this.belowOverlayImage.scaleY(this.model.belowOverlayImageScaleY);
            this.updateBelowOverlayPosition();
            this.backgroundLayer.add(this.belowOverlayImage);
            console.log('✓ Below-overlay image loaded');
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
        
        // Add to body
        document.body.appendChild(this.svgContainer);
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
    }

    /** Attach a parsed SVG to the View's container and style it. */
    attachMap(svg: SVGSVGElement): void {
        if (!this.svgContainer) return;
        this.svgContainer.innerHTML = '';
        this.svgContainer.appendChild(svg);
        // Style for aspect ratio and visibility
        svg.style.maxWidth = '90%';
        svg.style.maxHeight = '90%';
        svg.style.width = 'auto';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
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

        // Style the SVG
        svg.style.maxWidth = '90%';
        svg.style.maxHeight = '90%';
        svg.style.width = 'auto';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

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

    /** Sync the view with the model's current state. */
	updateViewFromModel(): void {
		const states = this.model.getAllStates();
		states.forEach((state, code) => {
			const pathElement = this.svgPathElements.get(code);
			if (!pathElement) return;

			// Update color
			pathElement.setAttribute('fill', state.getColor());

			// Update highlight opacity
			pathElement.style.opacity = state.getIsHighlighted() ? '0.7' : '1';
		});
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

    //MULTIPLIER METHODS
    initializeMultiplier() {
        this.multiplierLayer = new Konva.Layer();
        this.stage.add(this.multiplierLayer);

        this.mutliplierText = new Konva.Text({
            x: this.stage.width() - 120,
            y: 20,
            text: `${this.multiplier.toFixed(1)}x`, //displays multiplier number
            fontSize: 50,
            fontFamily: 'Times New Roman',
            fill: 'white', 
            align:'right',   //want multiplier to be on the right side of the screem
        });

        this.multiplierLayer.add(this.mutliplierText);
        this.startMultiplierDecrease();
    }

    private startMultiplierDecrease() {
        setInterval(() => {
            this.multiplier = Math.max(MULTIPLIER.FLOOR_VALUE, (this.multiplier-MULTIPLIER.RATE_OF_DECREASING_MULTIPLIER));
            this.mutliplierText.text(`${this.multiplier.toFixed(1)}x`);  
            this.multiplierLayer.batchDraw();  //redrawing layer
        }, 1000)  //function runs every 1000 ms (1 second)
    }

    increaseMultiplier() {
        this.multiplier += MULTIPLIER.INCREMENT_AMOUNT;
        this.mutliplierText.text(`${this.multiplier.toFixed(1)}x`);
        this.multiplierLayer.batchDraw();   //redrawing layer
    }

    // show() method is required by ViewManager.ts
    show() {
        this.backgroundLayer.show();
        this.layer.show();
        if (this.svgContainer) {
            this.svgContainer.style.visibility = 'visible';
        }
    }

    // hide() method is required by ViewManager.ts
    hide() {
        this.backgroundLayer.hide();
        this.layer.hide();
        if (this.svgContainer) {
            this.svgContainer.style.visibility = 'hidden';
        }
    }

    destroy(): void {
        if (this.svgContainer) {
            this.svgContainer.remove();
            this.svgContainer = null;
        }
        this.backgroundLayer.destroy();
        this.layer.destroy();
    }
}