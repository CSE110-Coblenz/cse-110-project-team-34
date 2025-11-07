import Konva from 'konva';
import { GameModel, State } from './GameModel';
import { ensureLiefFontLoaded } from '../../utils/FontLoader';
import { createPixelImage } from '../../utils/KonvaHelpers';

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

    // The constructor must accept a Konva.Stage, as ViewManager.ts passes one in.
    constructor(stage: Konva.Stage, model: GameModel) {
        this.stage = stage;
        this.model = model;
        
        // Create background layer first (renders behind everything)
        this.backgroundLayer = new Konva.Layer();
        this.stage.add(this.backgroundLayer);
        
    // Ensure custom 'Lief' font is available for any future text usage on Game screen
    ensureLiefFontLoaded();

        // Load and add the background image
        this.loadBackgroundImage();
        
        // Create main layer for other content
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

    // Create a container for the SVG (View only mounts it)
    this.createSVGContainer();

    // Apply initial vertical offset from the model (overlay + map only)
    this.setOverlayMapOffsetY(this.model.overlayMapOffsetY);
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

    /**
     * Load the background parchment image
     */
    private loadBackgroundImage(): void {
        const imageObj = new Image();
        imageObj.onload = () => {
            // Create Konva image (pixel-art rendering)
            this.backgroundImage = createPixelImage(imageObj, { x: 0, y: 0 });
            
            // Scale the image to fill the entire stage (stretch to corners)
            const scaleX = this.stage.width() / imageObj.width;
            const scaleY = this.stage.height() / imageObj.height;
            
            // Use independent scaling for width and height to fill the entire screen
            this.backgroundImage.scaleX(scaleX);
            this.backgroundImage.scaleY(scaleY);
            
            // Position at top-left corner (0, 0) - image will stretch to fill screen
            this.backgroundImage.x(0);
            this.backgroundImage.y(0);
            
            // Add to background layer
            this.backgroundLayer.add(this.backgroundImage);
            this.backgroundLayer.draw();
            
            console.log('✓ Background parchment image loaded');
        };
        
        imageObj.onerror = () => {
            console.error('❌ Failed to load background image');
        };
        
    // Set the image source - use forward slashes for web paths
    imageObj.src = this.model.baseBackgroundSrc;

        // Load the overlay image that should sit above the base background
        const overlayObj = new Image();
        overlayObj.onload = () => {
            this.overlayBackgroundImage = createPixelImage(overlayObj, { x: 0, y: 0 });

            // Keep original (natural) size: do NOT stretch to stage
            this.overlayBackgroundImage.scaleX(this.model.overlayScaleX);
            this.overlayBackgroundImage.scaleY(this.model.overlayScaleY);

            // Center the overlay if configured
            if (this.model.centerOverlay) {
                const img = this.overlayBackgroundImage;
                const displayedWidth = img.width() * img.scaleX();
                const displayedHeight = img.height() * img.scaleY();
                const centerX = (this.stage.width() - displayedWidth) / 2;
                const centerY = (this.stage.height() - displayedHeight) / 2;
                img.x(centerX);
                img.y(centerY);
            }

            // Record the base (centered) position to support offsetting without moving the base background
            this.overlayBaseX = this.overlayBackgroundImage.x();
            this.overlayBaseY = this.overlayBackgroundImage.y();

            // Apply initial overlay/map offset now that base position is known
            this.applyOverlayMapOffset();

            // Add AFTER base background so it sits on top of it but remains in the background layer
            this.backgroundLayer.add(this.overlayBackgroundImage);
            this.backgroundLayer.draw();

            console.log('✓ Game overlay background image loaded');
        };

        overlayObj.onerror = () => {
            console.error('❌ Failed to load game overlay background image');
        };

        // Web-served path from /public
        overlayObj.src = this.model.overlayBackgroundSrc;

        // Load the left-side image (rotated CCW 90 degrees) and position it on the left
        const leftObj = new Image();
        leftObj.onload = () => {
            this.leftSideImage = createPixelImage(leftObj, { x: 0, y: 0 });

            // Apply scaling
            this.leftSideImage.scaleX(this.model.leftSideImageScaleX);
            this.leftSideImage.scaleY(this.model.leftSideImageScaleY);

            // Set rotation around the image center
            const naturalW = leftObj.width;
            const naturalH = leftObj.height;
            this.leftSideImage.offsetX(naturalW / 2);
            this.leftSideImage.offsetY(naturalH / 2);
            this.leftSideImage.rotation(this.model.leftSideImageRotationDeg);

            // Compute displayed size (pre-rotation) for positioning
            const displayedW = naturalW * this.leftSideImage.scaleX();
            const displayedH = naturalH * this.leftSideImage.scaleY();

            // Position near the left edge, vertically centered, with configurable vertical offset
            const x = this.model.leftSideImageMarginLeft + displayedW / 2;
            const y = (this.stage.height() / 2) + (this.model.leftSideImageOffsetY || 0);
            this.leftSideImage.x(x);
            this.leftSideImage.y(y);

            // Add after other backgrounds so it appears above base/overlay but still behind the SVG map
            this.backgroundLayer.add(this.leftSideImage);
            this.backgroundLayer.draw();

            console.log('✓ Left-side image loaded and positioned');
        };

        leftObj.onerror = () => {
            console.error('❌ Failed to load left-side image');
        };

        leftObj.src = this.model.leftSideImageSrc;

        // Load image to be placed below the overlay (no rotation by default)
        const belowObj = new Image();
        belowObj.onload = () => {
            this.belowOverlayImage = createPixelImage(belowObj, { x: 0, y: 0 });

            // Apply scaling from model
            this.belowOverlayImage.scaleX(this.model.belowOverlayImageScaleX);
            this.belowOverlayImage.scaleY(this.model.belowOverlayImageScaleY);

            // Position relative to the overlay
            this.updateBelowOverlayPosition();

            // Add after base/overlay so it remains behind the SVG map
            this.backgroundLayer.add(this.belowOverlayImage);
            this.backgroundLayer.draw();

            console.log('✓ Below-overlay image loaded and positioned');
        };

        belowObj.onerror = () => {
            console.error('❌ Failed to load below-overlay image');
        };

        belowObj.src = this.model.belowOverlayImageSrc;
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

            // Optional: add visual styling for guessed states
            if (state.getIsGuessed()) {
                // Example: add a class or stroke
                pathElement.style.stroke = '#000';
                pathElement.style.strokeWidth = '2';
            } else {
                pathElement.style.stroke = '';
                pathElement.style.strokeWidth = '';
            }
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