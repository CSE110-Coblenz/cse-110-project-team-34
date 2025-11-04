import Konva from 'konva';

// Export the class so main.ts (or ViewManager.ts) can import it
export class MenuView {
	// This group will hold all the visual elements of the menu
	private group: Konva.Group;
	private stage: Konva.Stage;
	private backgroundLayer: Konva.Layer;
	private contentLayer: Konva.Layer;
	private backgroundImage: Konva.Image | null = null;

	// Exposed button groups so the Controller can attach handlers
	public practiceButton: Konva.Group;
	public classicButton: Konva.Group;
	public crackedButton: Konva.Group;

	// The constructor receives the main stage from the App/ViewManager
	constructor(stage: Konva.Stage) {
		this.stage = stage;
		
		// Create background layer first (renders behind everything)
		this.backgroundLayer = new Konva.Layer();
		this.stage.add(this.backgroundLayer);
		
		// Load and add the background image
		this.loadBackgroundImage();
		
		// Create content layer for buttons (renders on top of background)
		this.contentLayer = new Konva.Layer();
		this.stage.add(this.contentLayer);
		
		this.group = new Konva.Group();
		this.contentLayer.add(this.group);

		// Get the full screen dimensions from the stage
		const width = this.stage.width();
		const height = this.stage.height();
		const sectionWidth = width / 3;

		// --- 1. Practice Section (Left) ---
		this.practiceButton = new Konva.Group({
			x: 0,
			y: 0,
			width: sectionWidth,
			height: height,
			opacity: 0.5, // 50% opacity
		});

		const practiceRect = new Konva.Rect({
			width: sectionWidth,
			height: height,
			fill: '#f0f0f0', // Light gray
			stroke: 'black',
			strokeWidth: 2,
		});
		this.practiceButton.add(practiceRect);

		this.practiceButton.add(new Konva.Text({
			text: 'PRACTICE',
			fontSize: 30,
			fontStyle: 'bold',
			width: sectionWidth,
			height: height,
			align: 'center',
			verticalAlign: 'middle',
			fill: 'black',
		}));

		// Hover effect for practice button
		this.practiceButton.on('mouseenter', () => {
			practiceRect.fill('#d0d0d0');
			document.body.style.cursor = 'pointer';
		});
		this.practiceButton.on('mouseleave', () => {
			practiceRect.fill('#f0f0f0');
			document.body.style.cursor = 'default';
		});

		// --- 2. Classic Section (Middle) ---
		this.classicButton = new Konva.Group({
			x: sectionWidth,
			y: 0,
			width: sectionWidth,
			height: height,
			opacity: 0.5, // 50% opacity
		});

		const classicRect = new Konva.Rect({
			width: sectionWidth,
			height: height,
			fill: '#e0e0e0', // Medium gray
			stroke: 'black',
			strokeWidth: 2,
		});
		this.classicButton.add(classicRect);

		this.classicButton.add(new Konva.Text({
			text: 'CLASSIC',
			fontSize: 30,
			fontStyle: 'bold',
			width: sectionWidth,
			height: height,
			align: 'center',
			verticalAlign: 'middle',
			fill: 'black',
		}));

		// Hover effect for classic button
		this.classicButton.on('mouseenter', () => {
			classicRect.fill('#c0c0c0');
			document.body.style.cursor = 'pointer';
		});
		this.classicButton.on('mouseleave', () => {
			classicRect.fill('#e0e0e0');
			document.body.style.cursor = 'default';
		});

		// --- 3. Cracked Section (Right) ---
		this.crackedButton = new Konva.Group({
			x: sectionWidth * 2,
			y: 0,
			width: sectionWidth,
			height: height,
			opacity: 0.5, // 50% opacity
		});

		const crackedRect = new Konva.Rect({
			width: sectionWidth,
			height: height,
			fill: '#d0d0d0', // Darker gray
			stroke: 'black',
			strokeWidth: 2,
		});
		this.crackedButton.add(crackedRect);

		this.crackedButton.add(new Konva.Text({
			text: 'CRACKED',
			fontSize: 30,
			fontStyle: 'bold',
			width: sectionWidth,
			height: height,
			align: 'center',
			verticalAlign: 'middle',
			fill: 'black',
		}));

		// Hover effect for cracked button
		this.crackedButton.on('mouseenter', () => {
			crackedRect.fill('#b0b0b0');
			document.body.style.cursor = 'pointer';
		});
		this.crackedButton.on('mouseleave', () => {
			crackedRect.fill('#d0d0d0');
			document.body.style.cursor = 'default';
		});
		// Add all three sections to the main menu group
		this.group.add(this.practiceButton, this.classicButton, this.crackedButton);

		// Start hidden by default, the App/ViewManager will show it
		this.hide();

		// NOTE: Event listeners are the Controller's responsibility.
		// The Controller will attach .on('click', ...) handlers to
		// `practiceButton`, `classicButton`, and `crackedButton`.
	}

	/**
	 * Load the background stone image
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
			
			console.log('✓ Background stone image loaded for menu');
		};
		
		imageObj.onerror = () => {
			console.error('❌ Failed to load menu background image');
		};
		
		// Set the image source - use forward slashes for web paths
		imageObj.src = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/1.png';
	}

	// Method for the App/ViewManager to get this screen's elements
	getGroup() {
		return this.group;
	}

	// Method for the App/ViewManager to show this screen
	show() {
		this.backgroundLayer.show();
		this.contentLayer.show();
		this.group.show();
	}

	// Method for the App/ViewManager to hide this screen
	hide() {
		this.backgroundLayer.hide();
		this.contentLayer.hide();
		this.group.hide();
	}
}