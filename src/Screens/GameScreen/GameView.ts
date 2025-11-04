import Konva from 'konva';

// State class with chainable methods
export class State {
    public name: string;
    public element: SVGPathElement;
    public originalColor: string;
    private _currentColor: string;
    private _isGuessed: boolean = false;
    private _isHighlighted: boolean = false;

    constructor(name: string, element: SVGPathElement, originalColor: string) {
        this.name = name;
        this.element = element;
        this.originalColor = originalColor;
        this._currentColor = originalColor;
    }

    // Chainable method to set color
    color(newColor: string): State {
        this._currentColor = newColor;
        this.element.setAttribute('fill', newColor);
        return this;
    }

    // Chainable method to set isGuessed
    isGuessed(guessed: boolean): State {
        this._isGuessed = guessed;
        return this;
    }

    // Chainable method to set highlight
    highlight(highlighted: boolean): State {
        this._isHighlighted = highlighted;
        this.element.style.opacity = highlighted ? '0.7' : '1';
        return this;
    }

    // Getter for current color
    getColor(): string {
        return this._currentColor;
    }

    // Getter for isGuessed
    getIsGuessed(): boolean {
        return this._isGuessed;
    }

    // Getter for isHighlighted
    getIsHighlighted(): boolean {
        return this._isHighlighted;
    }

    // Reset to original state
    reset(): State {
        this._currentColor = this.originalColor;
        this._isGuessed = false;
        this._isHighlighted = false;
        this.element.setAttribute('fill', this.originalColor);
        this.element.style.opacity = '1';
        return this;
    }

    // Set a new original color (accepts HEX, rgb, or named colors)
    setOriginalColor(newColor: string): State {
        this.originalColor = newColor;
        this._currentColor = newColor;
        this.element.setAttribute('fill', newColor);
        return this;
    }
}

// Export the class so ViewManager.ts can import it
export class GameView {

    private stage: Konva.Stage;
    private backgroundLayer: Konva.Layer;
    private layer: Konva.Layer;
    private svgContainer: HTMLDivElement | null = null;
    private states: Map<string, State> = new Map(); // Map of state name to State objects
    private backgroundImage: Konva.Image | null = null;

    // The constructor must accept a Konva.Stage, as ViewManager.ts passes one in.
    constructor(stage: Konva.Stage) {
        this.stage = stage;
        
        // Create background layer first (renders behind everything)
        this.backgroundLayer = new Konva.Layer();
        this.stage.add(this.backgroundLayer);
        
        // Load and add the background image
        this.loadBackgroundImage();
        
        // Create main layer for other content
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // Create a container for the SVG
        this.createSVGContainer();
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
        this.svgContainer.style.pointerEvents = 'none'; // no interactions
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
            // Create Konva image
            this.backgroundImage = new Konva.Image({
                image: imageObj,
                x: 0,
                y: 0,
            });
            
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
        imageObj.src = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/5.png';
    }

    /**
     * Load and display the US map SVG
     */
    async loadMap(svgPath: string): Promise<void> {
        if (!this.svgContainer) return;
        
        try {
            const response = await fetch(svgPath);
            if (!response.ok) {
                throw new Error(`Failed to load SVG: ${response.statusText}`);
            }
            
            const svgText = await response.text();
            this.svgContainer.innerHTML = svgText;
            
            // Style the SVG to fit with aspect ratio preserved
            const svg = this.svgContainer.querySelector('svg');
            if (svg) {
                svg.style.maxWidth = '90%';
                svg.style.maxHeight = '90%';
                svg.style.width = 'auto';
                svg.style.height = 'auto';
                svg.style.display = 'block';
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                
                // Parse all state paths and create State objects
                this.parseStates(svg);
            }
            
            console.log('US map loaded successfully');
            console.log(`Found ${this.states.size} states`);
        } catch (error) {
            console.error('Failed to load US map:', error);
            throw error;
        }
    }

    /**
     * Parse all state elements from the SVG and create State objects
     */
    private parseStates(svg: SVGSVGElement): void {
        // Clear existing states
        this.states.clear();
        
        // Regular expression to match exactly 2 lowercase letters (state codes only)
        const STATE_CODE_PATTERN = /^[a-z]{2}$/;
        
        // Find all path elements (each state is typically a path)
        const paths = svg.querySelectorAll('path');
        console.log(`Found ${paths.length} path elements in SVG`);
        
        if (paths.length === 0) {
            console.warn('⚠️ No path elements found in SVG!');
            return;
        }
        
        paths.forEach((path, index) => {
            // Get state abbreviation from class attribute (e.g., "ca" for California)
            const classAttr = path.getAttribute('class') || '';
            
            // Split class attribute in case multiple classes exist (e.g., "state ca")
            const classTokens = classAttr.split(/\s+/).map(c => c.trim()).filter(Boolean);
            
            // Find the first token that matches the state code pattern (2 lowercase letters)
            const stateCode = classTokens.find(token => STATE_CODE_PATTERN.test(token));
            
            if (stateCode) {
                // Exclude DC (District of Columbia) - only include the 50 U.S. states
                if (stateCode === 'dc') {
                    console.log(`⚠️ Skipping DC (District of Columbia) - not a state`);
                    return;
                }
                
                // Skip if we've already parsed this state (handles multi-path states like Michigan)
                if (this.states.has(stateCode)) {
                    console.log(`⚠️ Duplicate state code "${stateCode}" found - using first occurrence`);
                    return;
                }
                
                // Get the original fill color
                const computedStyle = window.getComputedStyle(path);
                const originalColor = path.getAttribute('fill') || 
                                     computedStyle.fill || 
                                     '#cccccc';
                
                // Create State object using the state code abbreviation
                const state = new State(stateCode, path as SVGPathElement, originalColor);
                this.states.set(stateCode, state);
                
                console.log(`✓ Parsed state: "${stateCode}" (color: ${originalColor})`);
            }
            // Silently skip non-state paths (borders, connectors, separators, etc.)
        });
        
        if (this.states.size === 0) {
            console.error('❌ No states were parsed! Check if paths have class attributes');
        }
    }

    /**
     * Get a state by name - returns the State object for method chaining
     */
    getState(stateName: string): State | undefined {
        return this.states.get(stateName);
    }

    /**
     * Get all states
     */
    getAllStates(): Map<string, State> {
        return this.states;
    }

    /**
     * Reset all states to their original state
     */
    resetAllStates(): void {
        this.states.forEach((state) => {
            state.reset();
        });
    }

    /**
     * Set the original color for all states (accepts HEX, rgb, or named colors)
     * This updates the originalColor property, so reset() will use this new color
     * @param color - The color to set (e.g., "#ff0000", "rgb(255, 0, 0)", "red")
     */
    setAllStatesOriginalColor(color: string): void {
        this.states.forEach((state) => {
            state.setOriginalColor(color);
        });
        console.log(`✓ Set original color for all ${this.states.size} states to: ${color}`);
    }

    /**
     * Set the current color for all states without changing their original color
     * @param color - The color to set (e.g., "#ff0000", "rgb(255, 0, 0)", "red")
     */
    setAllStatesColor(color: string): void {
        this.states.forEach((state) => {
            state.color(color);
        });
        console.log(`✓ Set current color for all ${this.states.size} states to: ${color}`);
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