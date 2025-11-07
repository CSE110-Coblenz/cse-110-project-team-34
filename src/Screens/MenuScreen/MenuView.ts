import Konva from 'konva';
import { ensureLiefFontLoaded, ensureKa1FontLoaded, ensureDungeonFontLoaded, waitForFontsReady } from '../../utils/FontLoader';
import { createPixelImage } from '../../utils/KonvaHelpers';

// Export the class so main.ts (or ViewManager.ts) can import it
export class MenuView {
	// This group will hold all the visual elements of the menu
	private group: Konva.Group;
	private stage: Konva.Stage;
	private backgroundLayer: Konva.Layer;
	private contentLayer: Konva.Layer;
	private overlayLayer: Konva.Layer; // New layer for black/white screen overlays
	private backgroundImage: Konva.Image | null = null;
	private overlayBackgroundImage: Konva.Image | null = null;
	private overlayGifElement: HTMLImageElement | null = null; // DOM element for animated GIF
	private vignette: Konva.Rect | null = null; // Vignette effect for animation
	private chingSound: HTMLAudioElement; // Preloaded audio
	private backgroundMusic: HTMLAudioElement; // Looping background music
	private introVoice: HTMLAudioElement; // Intro voice audio
	private muteButton: Konva.Group | null = null; // Mute/unmute button group
	private muteButtonIcon: Konva.Image | null = null; // Icon within mute button
	private muteButtonText: Konva.Text | null = null; // Text within mute button
	private isMuted: boolean = false; // Track mute state

	// Exposed button groups so the Controller can attach handlers
	public practiceButton: Konva.Group;
	public classicButton: Konva.Group;
	public crackedButton: Konva.Group;

	// The constructor receives the main stage from the App/ViewManager
	constructor(stage: Konva.Stage) {
		this.stage = stage;

		// Preload ching sound audio
		this.chingSound = new Audio('/audio/ching sound.mp3');
		this.chingSound.preload = 'auto';
		
		// Preload background music
		this.backgroundMusic = new Audio('/audio/phonk-music-349676.mp3');
		this.backgroundMusic.preload = 'auto';
		this.backgroundMusic.loop = true; // Loop continuously
		
		// Preload intro voice
		this.introVoice = new Audio('/audio/intro voice.m4a');
		this.introVoice.preload = 'auto';

		// Ensure the custom fonts are registered early
		ensureLiefFontLoaded();
		ensureKa1FontLoaded();
		ensureDungeonFontLoaded();
		
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
		
		// Create overlay layer for black/white screen effects (above everything)
		this.overlayLayer = new Konva.Layer();
		this.stage.add(this.overlayLayer);
		const overlayCanvas = this.overlayLayer.getCanvas()._canvas as HTMLCanvasElement;
		overlayCanvas.style.zIndex = '100'; // Above all content
		
		this.group = new Konva.Group();
		this.contentLayer.add(this.group);

		// Get the full screen dimensions from the stage
		const width = this.stage.width();
		const height = this.stage.height();
		
		// Create initial black screen overlay
		const blackScreen = new Konva.Rect({
			x: 0,
			y: 0,
			width: width,
			height: height,
			fill: 'black',
			opacity: 1,
		});
		this.overlayLayer.add(blackScreen);
		
		// Create "START" button on black screen
		const startButtonWidth = 200;
		const startButtonHeight = 80;
		const startButton = new Konva.Group({
			x: (width - startButtonWidth) / 2,
			y: (height - startButtonHeight) / 2,
		});
		
		const startButtonRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: startButtonWidth,
			height: startButtonHeight,
			fill: '#ffffff',
			stroke: '#000000',
			strokeWidth: 3,
			cornerRadius: 10,
		});
		startButton.add(startButtonRect);
		
		const startButtonText = new Konva.Text({
			text: 'START',
			fontSize: 48,
			fontFamily: 'DungeonFont',
			x: 0,
			y: 0,
			width: startButtonWidth,
			height: startButtonHeight,
			align: 'center',
			verticalAlign: 'middle',
			fill: '#000000',
		});
		startButton.add(startButtonText);
		
		// Add hover effects
		startButton.on('mouseenter', () => {
			startButtonRect.fill('#e0e0e0');
			document.body.style.cursor = 'pointer';
		});
		startButton.on('mouseleave', () => {
			startButtonRect.fill('#ffffff');
			document.body.style.cursor = 'default';
		});
		
		this.overlayLayer.add(startButton);
		this.overlayLayer.draw();
		
		// Click handler for start button - triggers all animations
		startButton.on('click', () => {
			// Remove start button immediately
			startButton.destroy();
			this.overlayLayer.draw();
			
			// Wait 1 second before starting the animation sequence
			setTimeout(() => {
				this.startAnimationSequence(blackScreen, width, height, stateText, ofText, panicText, stateTween, ofTween, panicTween);
			}, 500);
		});

		// --- Create stacked buttons (vertical layout) ---
		const buttonWidth = 300;
		const buttonHeight = 80;
		const buttonSpacing = 60;
		
		// --- 1. Practice Button (Top) ---
		this.practiceButton = new Konva.Group({
			x: 0,
			y: 0,
		});
		
		const practiceRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: buttonWidth,
			height: buttonHeight,
			fill: '#f0f0f0',
			stroke: 'black',
			strokeWidth: 2,
			cornerRadius: 8,
		});
		this.practiceButton.add(practiceRect);

		const practiceText = new Konva.Text({
			text: 'PRACTICE',
			fontSize: 48,
			fontFamily: 'DungeonFont',
			x: 0,
			y: 0,
			width: buttonWidth,
			height: buttonHeight,
			align: 'center',
			verticalAlign: 'middle',
			fill: 'black',
		});
		this.practiceButton.add(practiceText);

		// Hover effect for practice button
		this.practiceButton.on('mouseenter', () => {
			practiceRect.fill('#d0d0d0');
			document.body.style.cursor = 'pointer';
		});
		this.practiceButton.on('mouseleave', () => {
			practiceRect.fill('#f0f0f0');
			document.body.style.cursor = 'default';
		});

		// --- 2. Classic Button (Middle) ---
		this.classicButton = new Konva.Group({
			x: 0,
			y: buttonHeight + buttonSpacing,
		});

		const classicRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: buttonWidth,
			height: buttonHeight,
			fill: '#e0e0e0',
			stroke: 'black',
			strokeWidth: 2,
			cornerRadius: 8,
		});
		this.classicButton.add(classicRect);

		const classicText = new Konva.Text({
			text: 'CLASSIC',
			fontSize: 48,
			fontFamily: 'DungeonFont',
			x: 0,
			y: 0,
			width: buttonWidth,
			height: buttonHeight,
			align: 'center',
			verticalAlign: 'middle',
			fill: 'black',
		});
		this.classicButton.add(classicText);

		// Hover effect for classic button
		this.classicButton.on('mouseenter', () => {
			classicRect.fill('#c0c0c0');
			document.body.style.cursor = 'pointer';
		});
		this.classicButton.on('mouseleave', () => {
			classicRect.fill('#e0e0e0');
			document.body.style.cursor = 'default';
		});

		// --- 3. Cracked Button (Bottom) ---
		this.crackedButton = new Konva.Group({
			x: 0,
			y: (buttonHeight + buttonSpacing) * 2,
		});

		const crackedRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: buttonWidth,
			height: buttonHeight,
			fill: '#d0d0d0',
			stroke: 'black',
			strokeWidth: 2,
			cornerRadius: 8,
		});
		this.crackedButton.add(crackedRect);

		const crackedText = new Konva.Text({
			text: 'CRACKED',
			fontSize: 48,
			fontFamily: 'DungeonFont',
			x: 0,
			y: 0,
			width: buttonWidth,
			height: buttonHeight,
			align: 'center',
			verticalAlign: 'middle',
			fill: 'black',
		});
		this.crackedButton.add(crackedText);

		// Hover effect for cracked button
		this.crackedButton.on('mouseenter', () => {
			crackedRect.fill('#b0b0b0');
			document.body.style.cursor = 'pointer';
		});
		this.crackedButton.on('mouseleave', () => {
			crackedRect.fill('#d0d0d0');
			document.body.style.cursor = 'default';
		});
		
		// --- 4. Mute Button (to the right of Classic button) ---
		// Load the unmuted icon (default state)
		const unmuteIconObj = new Image();
		unmuteIconObj.onload = () => {
			// Create a group for the mute button (icon + text)
			this.muteButton = new Konva.Group({
				x: buttonWidth + 40, // 40px spacing from classic button
				y: buttonHeight + buttonSpacing, // Same Y as classic button
			});
			
			// Create the icon
			this.muteButtonIcon = createPixelImage(unmuteIconObj, { x: 0, y: 0 });
			this.muteButtonIcon.scaleX(3); // 3x scale
			this.muteButtonIcon.scaleY(3); // 3x scale
			this.muteButton.add(this.muteButtonIcon);
			
			// Create the text to the right of the icon
			const iconWidth = unmuteIconObj.width * 3; // Width of scaled icon
			this.muteButtonText = new Konva.Text({
				text: 'Mute music',
				fontSize: 24,
				fontFamily: 'DungeonFont',
				x: iconWidth + 10, // 10px spacing from icon
				y: 0,
				fill: 'white',
				verticalAlign: 'top',
			});
			this.muteButton.add(this.muteButtonText);
			
			// Add hover effect to the entire group
			this.muteButton.on('mouseenter', () => {
				document.body.style.cursor = 'pointer';
			});
			this.muteButton.on('mouseleave', () => {
				document.body.style.cursor = 'default';
			});
			
			// Add click handler to toggle mute
			this.muteButton.on('click', () => {
				this.toggleMute();
			});
			
			this.group.add(this.muteButton);
			this.contentLayer.draw();
		};
		unmuteIconObj.src = '/Humble Gift - Paper UI System v1.1/Sprites/Content/2 Icons/10.png';
		
		// Add all three buttons to the main menu group (they're now in a vertical stack)
		this.group.add(this.practiceButton, this.classicButton, this.crackedButton);
		
		// Position the button group (all buttons move together)
		this.group.x(((width - buttonWidth) / 2) - 250);  // Center horizontally
		this.group.y((height / 2) - 200);  // Center vertically (adjust as needed)

		// Add title text using the Ka1 font - "OF" centered, with manual positioning for STATE and PANIC
		const titleY = 20;
		const fontSize = 72;
		
		// Final X positions for STATE and PANIC
		const stateXPosition = 655;
		const panicXPosition = 1120;
		
		// Create text objects
		const stateText = new Konva.Text({
			text: 'STATE',
			fontFamily: 'Ka1',
			fontSize: fontSize,
			fill: 'white',
		});
		
		const ofText = new Konva.Text({
			text: 'OF',
			fontFamily: 'Ka1',
			fontSize: fontSize,
			fill: 'white',
		});
		
		const panicText = new Konva.Text({
			text: 'PANIC',
			fontFamily: 'Ka1',
			fontSize: fontSize,
			fill: 'white',
		});
		
		// Calculate final positions
		const ofXPosition = (width - ofText.width()) / 2;
		
		// Set offset for proper scaling from center of text
		stateText.offsetX(stateText.width() / 2);
		stateText.offsetY(stateText.height() / 2);
		ofText.offsetX(ofText.width() / 2);
		ofText.offsetY(ofText.height() / 2);
		panicText.offsetX(panicText.width() / 2);
		panicText.offsetY(panicText.height() / 2);
		
		// Set STARTING properties (huge, invisible, off-screen)
		// STATE starts from left
		stateText.x(-500);
		stateText.y(titleY + stateText.height() / 2);
		stateText.opacity(0);
		stateText.scaleX(5);
		stateText.scaleY(5);
		
		// OF starts from top
		ofText.x(ofXPosition + ofText.width() / 2);
		ofText.y(-500);
		ofText.opacity(0);
		ofText.scaleX(5);
		ofText.scaleY(5);
		
		// PANIC starts from right
		panicText.x(width + 500);
		panicText.y(titleY + panicText.height() / 2);
		panicText.opacity(0);
		panicText.scaleX(5);
		panicText.scaleY(5);
		
		// Add title text to overlay layer (above black screen)
		this.overlayLayer.add(stateText, ofText, panicText);
		this.overlayLayer.draw();
		
		// Create landing animations - 2x faster (0.3s duration)
		const stateTween = new Konva.Tween({
			node: stateText,
			duration: 0.3,
			x: stateXPosition + stateText.width() / 2,
			y: titleY + stateText.height() / 2,
			opacity: 1,
			scaleX: 1,
			scaleY: 1,
			easing: Konva.Easings.EaseOut,
		});
		
		const ofTween = new Konva.Tween({
			node: ofText,
			duration: 0.3,
			x: ofXPosition + ofText.width() / 2,
			y: titleY + ofText.height() / 2,
			opacity: 1,
			scaleX: 1,
			scaleY: 1,
			easing: Konva.Easings.EaseOut,
		});
		
		const panicTween = new Konva.Tween({
			node: panicText,
			duration: 0.3,
			x: panicXPosition + panicText.width() / 2,
			y: titleY + panicText.height() / 2,
			opacity: 1,
			scaleX: 1,
			scaleY: 1,
			easing: Konva.Easings.EaseOut,
		});
		
		// Start hidden by default, the App/ViewManager will show it
		this.hide();

	}
	
	/**
	 * Start the full animation sequence (triggered by start button click)
	 */
	private startAnimationSequence(
		blackScreen: Konva.Rect,
		width: number,
		height: number,
		stateText: Konva.Text,
		ofText: Konva.Text,
		panicText: Konva.Text,
		stateTween: Konva.Tween,
		ofTween: Konva.Tween,
		panicTween: Konva.Tween
	): void {
		// Play animations in sequence with 1.0s delay between each
		waitForFontsReady().then(() => {
			// Play intro voice when animation starts
			this.introVoice.currentTime = 0;
			this.introVoice.play();
			
			// Text animations
			stateTween.play();
			setTimeout(() => ofTween.play(), 1000);    // OF starts 1.0s after STATE
			setTimeout(() => panicTween.play(), 2000); // PANIC starts 1.0s after OF
			
			// After all text animations complete + 0.8s delay (2000ms + 300ms + 800ms = 3100ms total)
			setTimeout(() => {
				// Remove black screen
				blackScreen.destroy();
				this.overlayLayer.draw();
				
				// Play ching sound effect (use preloaded audio - no need to catch, user clicked so it will work)
				this.chingSound.currentTime = 0; // Reset to start
				this.chingSound.play();
				
				// Start looping background music
				this.backgroundMusic.currentTime = 0;
				this.backgroundMusic.play();
				
				// Create white screen overlay
				const whiteScreen = new Konva.Rect({
					x: 0,
					y: 0,
					width: width,
					height: height,
					fill: 'white',
					opacity: 1,
				});
				this.overlayLayer.add(whiteScreen);
				this.overlayLayer.draw();
				
				// Fade out white screen
				const whiteFadeTween = new Konva.Tween({
					node: whiteScreen,
					duration: 1.5, // 1.5 seconds fade
					opacity: 0,
					easing: Konva.Easings.EaseInOut,
					onFinish: () => {
						// Remove white screen completely once fade is done
						whiteScreen.destroy();
						this.overlayLayer.draw();
						
						// Start vignette animation 7 seconds after white screen appears
						setTimeout(() => {
							this.animateVignette(width, height);
						}, 5800);
					}
				});
				whiteFadeTween.play();
			}, 2900); // Start white fade 0.8s after PANIC animation finishes
		});
	}
	
	/**
	 * Animate the vignette from large (no black visible) to normal size
	 */
	private animateVignette(width: number, height: number): void {
		if (!this.vignette) return;
		
		const vignetteCenterX = width / 2;
		const vignetteCenterY = height / 2;
		const finalVignetteRadius = Math.sqrt(vignetteCenterX * vignetteCenterX + vignetteCenterY * vignetteCenterY);
		
		// Animate the radial gradient end radius from large to normal
		const vignetteTween = new Konva.Tween({
			node: this.vignette,
			duration: 0.8, // 0.8 seconds animation
			fillRadialGradientEndRadius: finalVignetteRadius,
			easing: Konva.Easings.EaseInOut
		});
		vignetteTween.play();
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
			
			// Create dramatic vignette effect (dark edges, lighter center)
			const stageWidth = this.stage.width();
			const stageHeight = this.stage.height();
			const vignetteCenterX = stageWidth / 2;
			const vignetteCenterY = stageHeight / 2;
			
			// Calculate radius to reach corners (diagonal distance) - this is the final size
			const finalVignetteRadius = Math.sqrt(vignetteCenterX * vignetteCenterX + vignetteCenterY * vignetteCenterY);
			
			// Start with a much larger radius so the black area is not visible
			const startVignetteRadius = finalVignetteRadius * 3; // 3x larger to hide black edges
			
			this.vignette = new Konva.Rect({
				x: 0,
				y: 0,
				width: stageWidth,
				height: stageHeight,
				fillRadialGradientStartPoint: { x: vignetteCenterX, y: vignetteCenterY },
				fillRadialGradientStartRadius: 0,
				fillRadialGradientEndPoint: { x: vignetteCenterX, y: vignetteCenterY },
				fillRadialGradientEndRadius: startVignetteRadius, // Start large
				fillRadialGradientColorStops: [
					0, 'rgba(0, 0, 0, 0)',      // Transparent at center
					0.5, 'rgba(0, 0, 0, 0.3)',  // Slight darkening midway
					0.8, 'rgba(0, 0, 0, 0.7)',  // Heavy darkening
					1, 'rgba(0, 0, 0, 0.9)'     // Very dark at edges/corners
				]
			});
			
			this.backgroundLayer.add(this.vignette);
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
		this.overlayGifElement.src = '/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/book opening.gif';
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
		this.overlayLayer.show();
		this.group.show();
		if (this.overlayGifElement) {
			this.overlayGifElement.style.display = 'block';
		}
	}

	// Method for the App/ViewManager to hide this screen
	hide() {
		this.backgroundLayer.hide();
		this.contentLayer.hide();
		this.overlayLayer.hide();
		this.group.hide();
		if (this.overlayGifElement) {
			this.overlayGifElement.style.display = 'none';
		}
		// Stop background music when hiding the menu
		this.stopMusic();
	}
	
	// Method to stop the background music (called when transitioning to game screen)
	public stopMusic() {
		this.backgroundMusic.pause();
		this.backgroundMusic.currentTime = 0;
	}
	
	// Method to toggle mute/unmute
	private toggleMute() {
		this.isMuted = !this.isMuted;
		
		if (this.isMuted) {
			// Mute the music by setting volume to 0
			this.backgroundMusic.volume = 0;
			
			// Switch to muted icon (11.png)
			if (this.muteButtonIcon) {
				const mutedIconObj = new Image();
				mutedIconObj.onload = () => {
					if (this.muteButtonIcon && this.muteButton) {
						// Remove old icon
						this.muteButtonIcon.destroy();
						
						// Create new icon with muted image
						this.muteButtonIcon = createPixelImage(mutedIconObj, { x: 0, y: 0 });
						this.muteButtonIcon.scaleX(3);
						this.muteButtonIcon.scaleY(3);
						
						// Add to button group at the beginning (behind text)
						this.muteButton.add(this.muteButtonIcon);
						this.muteButtonIcon.moveToBottom();
						this.contentLayer.draw();
					}
				};
				mutedIconObj.src = '/Humble Gift - Paper UI System v1.1/Sprites/Content/2 Icons/11.png';
			}
		} else {
			// Unmute the music by setting volume back to full
			this.backgroundMusic.volume = 1;
			
			// Switch to unmuted icon (10.png)
			if (this.muteButtonIcon) {
				const unmuteIconObj = new Image();
				unmuteIconObj.onload = () => {
					if (this.muteButtonIcon && this.muteButton) {
						// Remove old icon
						this.muteButtonIcon.destroy();
						
						// Create new icon with unmuted image
						this.muteButtonIcon = createPixelImage(unmuteIconObj, { x: 0, y: 0 });
						this.muteButtonIcon.scaleX(3);
						this.muteButtonIcon.scaleY(3);
						
						// Add to button group at the beginning (behind text)
						this.muteButton.add(this.muteButtonIcon);
						this.muteButtonIcon.moveToBottom();
						this.contentLayer.draw();
					}
				};
				unmuteIconObj.src = '/Humble Gift - Paper UI System v1.1/Sprites/Content/2 Icons/10.png';
			}
		}
	}
}