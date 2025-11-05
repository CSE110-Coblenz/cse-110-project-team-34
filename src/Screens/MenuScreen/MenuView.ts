import Konva from 'konva';
import { ensureLiefFontLoaded, waitForFontsReady } from '../../utils/FontLoader';

// Export the class so main.ts (or ViewManager.ts) can import it
export class MenuView {
	// This group will hold all the visual elements of the menu
	private group: Konva.Group;
	private stage: Konva.Stage;
	private backgroundLayer: Konva.Layer;
	private contentLayer: Konva.Layer;
	private backgroundImage: Konva.Image | null = null;
	private overlayBackgroundImage: Konva.Image | null = null;

	// Exposed button groups so the Controller can attach handlers
	public practiceButton: Konva.Group;
	public classicButton: Konva.Group;
	public crackedButton: Konva.Group;

	// The constructor receives the main stage from the App/ViewManager
	constructor(stage: Konva.Stage) {
		this.stage = stage;

		// Ensure the custom 'Lief' font is registered early
		ensureLiefFontLoaded();
		
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
		// Make the visible button half the size of the section and center it
		const practiceRectWidth = sectionWidth * 0.5;
		const practiceRectHeight = height * 0.5;
		const practiceRect = new Konva.Rect({
			x: (sectionWidth - practiceRectWidth) / 2,
			y: (height - practiceRectHeight) / 2,
			width: practiceRectWidth,
			height: practiceRectHeight,
			fill: '#f0f0f0', // Light gray
			stroke: 'black',
			strokeWidth: 2,
			cornerRadius: 8,
		});
		this.practiceButton.add(practiceRect);

		this.practiceButton.add(new Konva.Text({
			text: 'PRACTICE',
			fontSize: 24,
			fontFamily: 'Lief',
			fontStyle: 'bold',
			x: practiceRect.x(),
			y: practiceRect.y(),
			width: practiceRectWidth,
			height: practiceRectHeight,
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

		const classicRectWidth = sectionWidth * 0.5;
		const classicRectHeight = height * 0.5;
		const classicRect = new Konva.Rect({
			x: (sectionWidth - classicRectWidth) / 2,
			y: (height - classicRectHeight) / 2,
			width: classicRectWidth,
			height: classicRectHeight,
			fill: '#e0e0e0', // Medium gray
			stroke: 'black',
			strokeWidth: 2,
			cornerRadius: 8,
		});
		this.classicButton.add(classicRect);

		this.classicButton.add(new Konva.Text({
			text: 'CLASSIC',
			fontSize: 24,
			fontFamily: 'Lief',
			fontStyle: 'bold',
			x: classicRect.x(),
			y: classicRect.y(),
			width: classicRectWidth,
			height: classicRectHeight,
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

		const crackedRectWidth = sectionWidth * 0.5;
		const crackedRectHeight = height * 0.5;
		const crackedRect = new Konva.Rect({
			x: (sectionWidth - crackedRectWidth) / 2,
			y: (height - crackedRectHeight) / 2,
			width: crackedRectWidth,
			height: crackedRectHeight,
			fill: '#d0d0d0', // Darker gray
			stroke: 'black',
			strokeWidth: 2,
			cornerRadius: 8,
		});
		this.crackedButton.add(crackedRect);

		this.crackedButton.add(new Konva.Text({
			text: 'CRACKED',
			fontSize: 24,
			fontFamily: 'Lief',
			fontStyle: 'bold',
			x: crackedRect.x(),
			y: crackedRect.y(),
			width: crackedRectWidth,
			height: crackedRectHeight,
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

		// Minimal: add a single text label using the custom 'Lief' font
		const sampleText = new Konva.Text({
			text: 'STATE OF PANIC',
			fontFamily: 'Lief',
			fontSize: 36,
			fill: 'yellow',
			x: 0,
			y: 20,
			width: width,
			align: 'center',
		});
		this.contentLayer.add(sampleText);
		this.contentLayer.draw();

		// Start hidden by default, the App/ViewManager will show it
		this.hide();

		// Redraw text after fonts are ready so custom font renders if used
		waitForFontsReady().then(() => {
			this.contentLayer.batchDraw();
		});

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
		
		// Set the image source - use forward slashes for web paths (served from /public)
		imageObj.src = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/1.png';

		// Load the secondary background overlay that appears above the base background
		const overlayObj = new Image();
		overlayObj.onload = () => {
			this.overlayBackgroundImage = new Konva.Image({
				image: overlayObj,
				x: 0,
				y: 0,
			});

			// Scale overlay to fill the entire stage
			const overlayScaleX = this.stage.width() / overlayObj.width;
			const overlayScaleY = this.stage.height() / overlayObj.height;
			this.overlayBackgroundImage.scaleX(overlayScaleX);
			this.overlayBackgroundImage.scaleY(overlayScaleY);
			this.overlayBackgroundImage.x(0);
			this.overlayBackgroundImage.y(0);

			// Add AFTER the base background so it sits on top of it but remains in the background layer
			this.backgroundLayer.add(this.overlayBackgroundImage);
			this.backgroundLayer.draw();

			console.log('✓ Menu overlay background image loaded');
		};

		overlayObj.onerror = () => {
			console.error('❌ Failed to load menu overlay background image');
		};

		// Web-served path from /public to the provided book.png
		overlayObj.src = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/book.png';
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