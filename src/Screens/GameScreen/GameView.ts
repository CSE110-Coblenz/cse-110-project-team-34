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
}

// Export the class so ViewManager.ts can import it
export class GameView {

    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private svgContainer: HTMLDivElement | null = null;
    private states: Map<string, State> = new Map(); // Map of state name to State objects

    // The constructor must accept a Konva.Stage, as ViewManager.ts passes one in.
    constructor(stage: Konva.Stage) {
        this.stage = stage;
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
        
        // Find all path elements (each state is typically a path)
        const paths = svg.querySelectorAll('path');
        console.log(`Found ${paths.length} path elements in SVG`);
        
        if (paths.length === 0) {
            console.warn('⚠️ No path elements found in SVG!');
            return;
        }
        
        paths.forEach((path, index) => {
            // Get state abbreviation from class attribute (e.g., "ca" for California)
            const stateClass = path.getAttribute('class') || '';
            
            if (stateClass) {
                // Get the original fill color
                const computedStyle = window.getComputedStyle(path);
                const originalColor = path.getAttribute('fill') || 
                                     computedStyle.fill || 
                                     '#cccccc';
                
                // Create State object using the class abbreviation
                const state = new State(stateClass, path as SVGPathElement, originalColor);
                this.states.set(stateClass, state);
                
                console.log(`✓ Parsed state: "${stateClass}" (color: ${originalColor})`);
            } else {
                console.warn(`⚠️ Path ${index} has no class attribute`);
            }
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

    // show() method is required by ViewManager.ts
    show() {
        this.layer.show();
        if (this.svgContainer) {
            this.svgContainer.style.visibility = 'visible';
        }
    }

    // hide() method is required by ViewManager.ts
    hide() {
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
        this.layer.destroy();
    }
}