import Konva from 'konva';
import { ensureLiefFontLoaded, ensureKa1FontLoaded, waitForFontsReady } from '../../utils/FontLoader';
import { createPixelImage } from '../../utils/KonvaHelpers';

// Export the class so main.ts (or ViewManager.ts) can import it
export class MenuView {
	// This group will hold all the visual elements of the menu
	private group: Konva.Group;
	private stage: Konva.Stage;
	private backgroundLayer: Konva.Layer;
	private contentLayer: Konva.Layer;
	private backgroundImage: Konva.Image | null = null;
	private overlayBackgroundImage: Konva.Image | null = null;
	private overlayGifElement: HTMLImageElement | null = null; // DOM element for animated GIF

	// Exposed button groups so the Controller can attach handlers
	public practiceButton: Konva.Group;
	public classicButton: Konva.Group;
	public crackedButton: Konva.Group;

	// The constructor receives the main stage from the App/ViewManager
	constructor(stage: Konva.Stage) {
		this.stage = stage;

		// Ensure the custom fonts are registered early
		ensureLiefFontLoaded();
		ensureKa1FontLoaded();
		
		// Create background layer first (renders behind everything)
		this.backgroundLayer = new Konva.Layer();
		this.stage.add(this.backgroundLayer);
		// Set canvas z-index via DOM
		const bgCanvas = this.backgroundLayer.getCanvas()._canvas as HTMLCanvasElement;
		bgCanvas.style.zIndex = '0';
		
		// Load and add the background image
		this.loadBackgroundImage();
		
		// Create content layer for buttons (renders on top of background)
		this.contentLayer = new Konva.Layer();
		this.contentLayer.setZIndex(10); // Ensure content is above the GIF
		this.stage.add(this.contentLayer);
		// Set canvas z-index via DOM to be above the GIF
		const contentCanvas = this.contentLayer.getCanvas()._canvas as HTMLCanvasElement;
		contentCanvas.style.zIndex = '10';
		
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

		// Add title text using the Ka1 font
		const sampleText = new Konva.Text({
			text: 'STATE OF PANIC',
			fontFamily: 'Ka1',
			fontSize: 72,
			fill: 'white',
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
	 * Load the background images
	 */
	private loadBackgroundImage(): void {
		// Load the base background image (behind everything)
		const baseImageObj = new Image();
		baseImageObj.onload = () => {
			// Create Konva image with NN scaling (pixel-art rendering)
			const baseBackground = createPixelImage(baseImageObj, { x: 0, y: 0 });
			
			// Scale to fill the entire stage
			const scaleX = this.stage.width() / baseImageObj.width;
			const scaleY = this.stage.height() / baseImageObj.height;
			const scale = Math.max(scaleX, scaleY); // Cover the entire stage
			
			baseBackground.scaleX(scale);
			baseBackground.scaleY(scale);
			
			// Center the scaled image on the stage
			const scaledWidth = baseImageObj.width * scale;
			const scaledHeight = baseImageObj.height * scale;
			const centerX = (this.stage.width() - scaledWidth) / 2;
			const centerY = (this.stage.height() - scaledHeight) / 2;
			baseBackground.x(centerX);
			baseBackground.y(centerY);
			
			// Add to background layer (at the bottom)
			this.backgroundLayer.add(baseBackground);
			baseBackground.moveToBottom();
			this.backgroundLayer.draw();
			
			console.log('✓ Base background image loaded for menu');
		};
		
		baseImageObj.onerror = () => {
			console.error('❌ Failed to load base background image');
		};
		
		// Set the base background source
		baseImageObj.src = '/Humble Gift - Paper UI System v1.1/background image menu.jpg';
		
		// Load the overlay background image (book desk)
		const imageObj = new Image();
		imageObj.onload = () => {
			// Create Konva image (pixel-art rendering)
			this.backgroundImage = createPixelImage(imageObj, { x: 0, y: 0 });
			
			// Scale to custom size
			this.backgroundImage.scaleX(1.8);
			this.backgroundImage.scaleY(1.55);
			
			// Center the scaled image on the stage
			const scaledWidth = imageObj.width * 1.8;
			const scaledHeight = imageObj.height * 1.55;
			const centerX = (this.stage.width() - scaledWidth) / 2;
			const centerY = (this.stage.height() - scaledHeight) / 2;
			this.backgroundImage.x(centerX);
			this.backgroundImage.y(centerY);
			
			// Add to background layer (on top of base background)
			this.backgroundLayer.add(this.backgroundImage);
			this.backgroundLayer.draw();
			
			console.log('✓ Overlay background image loaded for menu');
		};
		
		imageObj.onerror = () => {
			console.error('❌ Failed to load overlay background image');
		};
		
		// Set the overlay image source - use forward slashes for web paths (served from /public)
		imageObj.src = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/1.png';

		// Load the animated GIF overlay as a DOM element (not Konva) so it can animate
		this.overlayGifElement = document.createElement('img');
		this.overlayGifElement.src = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/geunyeong-park-book.gif';
		this.overlayGifElement.style.position = 'absolute';
		this.overlayGifElement.style.top = '38%';
		this.overlayGifElement.style.left = '50%';
		this.overlayGifElement.style.transform = 'translate(-50%, -50%) scale(1.5)'; // Center and scale to 1.5x
		this.overlayGifElement.style.transformOrigin = 'center center'; // Scale from center
		this.overlayGifElement.style.width = 'auto'; // Use original size (scale handles sizing)
		this.overlayGifElement.style.height = 'auto'; // Use original size (scale handles sizing)
		this.overlayGifElement.style.pointerEvents = 'none'; // Don't block clicks on buttons
		this.overlayGifElement.style.zIndex = '5'; // Above background (z=0) but below content layer (z=10)
		this.overlayGifElement.style.imageRendering = 'pixelated'; // Crisp pixel art
		this.overlayGifElement.style.display = 'none'; // Hidden by default
		
		// Add to the stage container (between background and content layers)
		const stageContainer = this.stage.container();
		stageContainer.style.position = 'relative'; // Ensure container is positioned
		stageContainer.appendChild(this.overlayGifElement);
		
		this.overlayGifElement.onload = () => {
			console.log('✓ Menu overlay animated GIF loaded');
		};
		
		this.overlayGifElement.onerror = () => {
			console.error('❌ Failed to load menu overlay animated GIF');
		};
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
		if (this.overlayGifElement) {
			this.overlayGifElement.style.display = 'block';
		}
	}

	// Method for the App/ViewManager to hide this screen
	hide() {
		this.backgroundLayer.hide();
		this.contentLayer.hide();
		this.group.hide();
		if (this.overlayGifElement) {
			this.overlayGifElement.style.display = 'none';
		}
	}
}