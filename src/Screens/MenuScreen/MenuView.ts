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
	private baseBackgroundImage: Konva.Image | null = null; // store base for zoom
	private overlayBackgroundImage: Konva.Image | null = null;
	private overlayGifElement: HTMLImageElement | null = null; // DOM element for animated GIF
	private crackedFireGif: HTMLImageElement | null = null; // DOM fire gif for CRACKED hover
	private vignette: Konva.Rect | null = null; // Vignette effect for animation
	// Audio visualizer fields
	private audioContext: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private mediaElementSource: MediaElementAudioSourceNode | null = null;
	private freqData: Uint8Array | null = null;
	private visualizerLayer: Konva.Layer | null = null;
	private visualizerGroup: Konva.Group | null = null;
	private visualizerBars: Konva.Line[] = [];
	private visualizerAnim: Konva.Animation | null = null;
	private titleFlashIntervalId: number | null = null; // interval id for flashing title
	// References for title to animate out later
	private titleStateText: Konva.Text | null = null;
	private titleOfText: Konva.Text | null = null;
	private titlePanicText: Konva.Text | null = null;
	// Bounce interval for the book GIF
	private bookBounceIntervalId: number | null = null;
	// Prevent duplicate exit animations
	private isExiting: boolean = false;

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

		// Prepare DOM fire GIF for cracked button hover
		if (!this.crackedFireGif) {
			this.crackedFireGif = document.createElement('img');
			this.crackedFireGif.src = '/Humble Gift - Paper UI System v1.1/fire.gif';
			this.crackedFireGif.style.position = 'absolute';
			this.crackedFireGif.style.width = `${buttonWidth}px`;
			this.crackedFireGif.style.height = `${buttonHeight}px`;
			this.crackedFireGif.style.objectFit = 'cover';
			this.crackedFireGif.style.imageRendering = 'pixelated';
			this.crackedFireGif.style.pointerEvents = 'none';
			this.crackedFireGif.style.display = 'none';
			// Place between background (0) and content (10) so it's behind the text drawn on content layer
			this.crackedFireGif.style.zIndex = '5';
			const stageContainer = this.stage.container();
			stageContainer.style.position = 'relative';
			stageContainer.appendChild(this.crackedFireGif);
		}

		// Hover effect for cracked button: show fire gif behind text
		this.crackedButton.on('mouseenter', () => {
			// Position the gif to align with the cracked button's absolute position
			const abs = this.crackedButton.getAbsolutePosition();
			if (this.crackedFireGif) {
				this.crackedFireGif.style.left = `${abs.x}px`;
				this.crackedFireGif.style.top = `${abs.y}px`;
				this.crackedFireGif.style.display = 'block';
			}
			// Change CRACKED text color to red on hover
			crackedText.fill('red');
			// Make the rect transparent so the gif is visible behind the text
			crackedRect.fill('rgba(0,0,0,0)');
			this.contentLayer.batchDraw();
			document.body.style.cursor = 'pointer';
		});
		this.crackedButton.on('mouseleave', () => {
			// Hide the gif and restore the button fill
			if (this.crackedFireGif) {
				this.crackedFireGif.style.display = 'none';
			}
			// Restore CRACKED text color
			crackedText.fill('black');
			crackedRect.fill('#d0d0d0');
			this.contentLayer.batchDraw();
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

		// Add title text using the Ka1 font - "OF" centered, with proportional positioning for STATE and PANIC
		const titleY = 20;
		const fontSize = 72;
		
		// Calculate proportional X positions based on stage width
		// OF centered, STATE half of OF width to its left, PANIC at half of OF width to the right
		
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
		const baseSpacing = fontSize * 2;

		// Adjust left/right spacing slightly
		const leftSpacing = baseSpacing;
		const rightSpacing = baseSpacing * 0.65;

		// Center "OF"
		const ofXPosition = width / 2;

		// Recalculate positions
		const stateXPosition = ofXPosition - ofText.width() / 2 - leftSpacing - stateText.width() / 2;
		const panicXPosition = ofXPosition + ofText.width() / 2 + rightSpacing + panicText.width() / 2;


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
		
		// Keep references and add title text to overlay layer (above black screen)
		this.titleStateText = stateText;
		this.titleOfText = ofText;
		this.titlePanicText = panicText;
		this.overlayLayer.add(stateText, ofText, panicText);
		this.overlayLayer.draw();
		
		// Create landing animations - 2x faster (0.3s duration)
		const stateTween = new Konva.Tween({
			node: stateText,
			duration: 0.3,
			x: stateXPosition,// + stateText.width() / 2,
			y: titleY + stateText.height() / 2,
			opacity: 1,
			scaleX: 1,
			scaleY: 1,
			easing: Konva.Easings.EaseOut,
		});
		
		const ofTween = new Konva.Tween({
			node: ofText,
			duration: 0.3,
			x: ofXPosition,// + ofText.width() / 2,
			y: titleY + ofText.height() / 2,
			opacity: 1,
			scaleX: 1,
			scaleY: 1,
			easing: Konva.Easings.EaseOut,
		});
		
		const panicTween = new Konva.Tween({
			node: panicText,
			duration: 0.3,
			x: panicXPosition,// + panicText.width() / 2,
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
				// Restore volume unless user muted it
				this.backgroundMusic.volume = this.isMuted ? 0 : 1;
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

				// Prepare audio analyzer and visualizer bars ahead of time
				this.ensureAudioAnalyzer();
				this.setupVisualizerBars();

				// Start vignette animation as soon as the white screen appears.
				// It should finish exactly when title flashing & book bounce begin.
				const bounceDelayMs = 5800; // delay after white fade finishes before title/bounce start
				const whiteFadeSeconds = 1.5; // must match whiteFadeTween duration below
				const totalVignetteSeconds = whiteFadeSeconds + (bounceDelayMs / 1000);
				this.animateVignette(width, height, totalVignetteSeconds);
				
				// Fade out white screen
				const whiteFadeTween = new Konva.Tween({
					node: whiteScreen,
					duration: whiteFadeSeconds, // 1.5 seconds fade
					opacity: 0,
					easing: Konva.Easings.EaseInOut,
					onFinish: () => {
						// Remove white screen completely once fade is done
						whiteScreen.destroy();
						this.overlayLayer.draw();

							// Start title flashing and book GIF bounce at the original timing
							setTimeout(() => {
								this.startTitleFlash(500);
								this.startBookBounce();
								// Also start audio visualizer now
								this.ensureAudioAnalyzer();
								this.setupVisualizerBars();
								if (this.visualizerGroup) this.visualizerGroup.show();
								this.startVisualizer();
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
	private animateVignette(width: number, height: number, durationSec: number = 0.8): void {
		if (!this.vignette) return;
		
		const vignetteCenterX = width / 2;
		const vignetteCenterY = height / 2;
		const finalVignetteRadius = Math.sqrt(vignetteCenterX * vignetteCenterX + vignetteCenterY * vignetteCenterY) * 0.7;
		
		// Animate the radial gradient end radius from large to normal
		const vignetteTween = new Konva.Tween({
			node: this.vignette,
			duration: durationSec, // customizable duration
			fillRadialGradientEndRadius: finalVignetteRadius,
			easing: Konva.Easings.EaseInOut
		});
		vignetteTween.play();
	}

	/**
	 * Start continuous flashing of the title between red and white.
	 * periodMs controls the time between color toggles.
	 */
	private startTitleFlash(periodMs: number = 500): void {
		// Clear previous if any
		if (this.titleFlashIntervalId) {
			clearInterval(this.titleFlashIntervalId);
			this.titleFlashIntervalId = null;
		}

		const nodes: (Konva.Text | null)[] = [this.titleStateText, this.titleOfText, this.titlePanicText];
		let isRed = false;
		const applyColor = () => {
			nodes.forEach(n => {
				if (!n) return;
				n.fill(isRed ? '#ff3b3b' : 'white');
			});
			this.overlayLayer.batchDraw();
		};

		applyColor();
		this.titleFlashIntervalId = window.setInterval(() => {
			isRed = !isRed;
			applyColor();
		}, periodMs);
	}

	/** Ensure Web Audio analyser is created and connected to backgroundMusic */
	private ensureAudioAnalyzer(): void {
		if (this.analyser && this.audioContext && this.freqData) return;
		if (!this.backgroundMusic) return;
		try {
			// Create context/analyser once
			if (!this.audioContext) this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			if (!this.analyser) this.analyser = this.audioContext.createAnalyser();
			this.analyser.fftSize = 256; // 128 bins
			const bufferLength = this.analyser.frequencyBinCount;
			this.freqData = new Uint8Array(bufferLength);
			// Connect music element to analyser if not already
			if (!this.mediaElementSource) {
				this.mediaElementSource = this.audioContext.createMediaElementSource(this.backgroundMusic);
				this.mediaElementSource.connect(this.analyser);
				this.analyser.connect(this.audioContext.destination);
			}
		} catch (e) {
			console.warn('Audio analyzer setup failed:', e);
		}
	}

	/** Create visualizer layer and bars behind the GIF (once) */
	private setupVisualizerBars(): void {
		if (this.visualizerGroup) return; // already created
		if (!this.analyser || !this.freqData) return;
		// Create layer positioned between background (0) and GIF (5)
		this.visualizerLayer = new Konva.Layer();
		this.stage.add(this.visualizerLayer);
		const vizCanvas = this.visualizerLayer.getCanvas()._canvas as HTMLCanvasElement;
		vizCanvas.style.zIndex = '4';

			this.visualizerGroup = new Konva.Group({ visible: false });
		this.visualizerLayer.add(this.visualizerGroup);

		const width = this.stage.width();
		const height = this.stage.height();
		const centerX = width / 2;
		const centerY = height / 2;
		const radius = Math.min(width, height) * 0.336; // inner radius (~2.4x original)
		const bufferLength = this.analyser.frequencyBinCount;
		const anglePerBar = (Math.PI * 2) / bufferLength;

		this.visualizerBars = [];
		for (let i = 0; i < bufferLength; i++) {
			const angle = i * anglePerBar;
			const sx = centerX + Math.cos(angle) * radius;
			const sy = centerY + Math.sin(angle) * radius;
			const bar = new Konva.Line({
				points: [sx, sy, sx, sy],
				stroke: 'rgba(255,255,255,0.85)',
				strokeWidth: 3,
				lineCap: 'butt',
			});
			this.visualizerBars.push(bar);
			this.visualizerGroup.add(bar);
		}

		this.visualizerLayer.draw();
	}

	/** Start the circular audio visualizer */
	private startVisualizer(): void {
		if (!this.audioContext || !this.analyser || !this.freqData || !this.visualizerLayer || !this.visualizerGroup) return;
		// Resume context if suspended (mobile/autoplay policies)
		if (this.audioContext.state === 'suspended') {
			this.audioContext.resume().catch(() => {});
		}
		// Avoid duplicating animation
		if (this.visualizerAnim) return;
		const width = this.stage.width();
		const height = this.stage.height();
		const centerX = width / 2;
		const centerY = height / 2;
		const radius = Math.min(width, height) * 0.336; // ~2.4x original
		const bufferLength = this.analyser.frequencyBinCount;
		const anglePerBar = (Math.PI * 2) / bufferLength;
		const maxBarLen = Math.min(width, height) * 0.432; // ~2.4x original

		this.visualizerAnim = new Konva.Animation(() => {
			if (!this.analyser || !this.freqData) return;
			this.analyser.getByteFrequencyData(this.freqData as any);
			for (let i = 0; i < bufferLength; i++) {
				const val = this.freqData[i] ?? 0; // 0..255
				const len = (val / 255) * maxBarLen;
				const angle = i * anglePerBar;
				const sx = centerX + Math.cos(angle) * radius;
				const sy = centerY + Math.sin(angle) * radius;
				const ex = centerX + Math.cos(angle) * (radius + len);
				const ey = centerY + Math.sin(angle) * (radius + len);
				const bar = this.visualizerBars[i];
				bar.points([sx, sy, ex, ey]);
			}
		}, this.visualizerLayer);
		this.visualizerAnim.start();
	}

	/** Stop and hide the visualizer */
	private stopVisualizer(): void {
		if (this.visualizerAnim) {
		  this.visualizerAnim.stop();
		  this.visualizerAnim = null;
		}
		if (this.visualizerGroup) {
		  this.visualizerGroup.hide();
		}
		if (this.visualizerLayer) {
		  this.visualizerLayer.visible(false);   // <— add this line
		  this.visualizerLayer.batchDraw();
		}
	}
	  

	/** Stop the continuous title flashing and restore to white */
	private stopTitleFlash(): void {
		if (this.titleFlashIntervalId) {
			clearInterval(this.titleFlashIntervalId);
			this.titleFlashIntervalId = null;
		}
		const nodes: (Konva.Text | null)[] = [this.titleStateText, this.titleOfText, this.titlePanicText];
		nodes.forEach(n => n && n.fill('white'));
		this.overlayLayer.batchDraw();
	}
	
	/**
	 * Start the bouncing animation for the book GIF
	 */
	private startBookBounce(): void {
		if (!this.overlayGifElement) return;
		
		// Get the current top position (38%)
		const currentTop = parseFloat(this.overlayGifElement.style.top) || 38;
		
		// Create a looping bounce effect (up 7px, then back down immediately)
		const bounce = () => {
			if (!this.overlayGifElement) return;
			
			// Move up 7px
			this.overlayGifElement.style.top = `${currentTop - 0.36}%`; // ~7px at typical screen height
			
			// Immediately move back down after a very short delay
			setTimeout(() => {
				if (!this.overlayGifElement) return;
				this.overlayGifElement.style.top = `${currentTop}%`;
			}, 50); // 50ms = very quick transition
		};

		// Start the bounce loop (every 500ms for quick bouncing)
		if (this.bookBounceIntervalId) {
			clearInterval(this.bookBounceIntervalId);
		}
		this.bookBounceIntervalId = window.setInterval(bounce, 500);
	}

	/** Stop the book GIF bounce animation */
	private stopBookBounce(): void {
		if (this.bookBounceIntervalId) {
			clearInterval(this.bookBounceIntervalId);
			this.bookBounceIntervalId = null;
		}
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
			this.baseBackgroundImage = baseBackground;
			
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
			
			// Don't add vignette yet - wait for overlay image to load first
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
			
			// Now add the vignette on top of the overlay image
			if (this.vignette) {
				this.backgroundLayer.add(this.vignette);
			}
			
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
		
		// Properly clean up the visualizer
		this.stopVisualizer();
		if (this.visualizerLayer) {
			this.visualizerLayer.destroy();
			this.visualizerLayer = null as any;
		  }
		  this.visualizerGroup = null as any;
		  this.visualizerBars = [];
		  this.mediaElementSource = null as any;
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

	/**
	 * Animate exiting the menu: slide title up, book+buttons left then off to the right.
	 * Calls onComplete() when done so controller can switch screens.
	 */
	public animateExit(onComplete: () => void): void {
		if (this.isExiting) return;
		this.isExiting = true;

		// Stop bounce loop if running
		this.stopBookBounce();
		// Stop title flashing if active
		this.stopTitleFlash();
		// Stop visualizer
		this.stopVisualizer();

		const width = this.stage.width();
		const height = this.stage.height();
		const slideDistance = 50; // px left nudge
		const groupStartX = this.group.x();

		// 1) Title slides up and fades
		const titleTweens: Konva.Tween[] = [];
		const titleDuration = 0.6;
		const makeUpTween = (node: Konva.Text | null) => {
			if (!node) return;
			titleTweens.push(new Konva.Tween({
				node,
				duration: titleDuration,
				y: -200,
				opacity: 0,
				easing: Konva.Easings.EaseIn,
			}));
		};
		makeUpTween(this.titleStateText);
		makeUpTween(this.titleOfText);
		makeUpTween(this.titlePanicText);
		titleTweens.forEach(t => t.play());

		// Shared total duration for exit motion (buttons + book GIF + secondary background)
		const EXIT_ANIM_DURATION = 1.5; // seconds (change this one value to scale whole exit)
		const NUDGE_FRACTION = 0.2; // fraction of total spent on initial left nudge
		const nudgeDuration = EXIT_ANIM_DURATION * NUDGE_FRACTION;
		const flyDuration = EXIT_ANIM_DURATION - nudgeDuration;

		// Unified motion driven by requestAnimationFrame to keep relative positions locked
		const groupStart = groupStartX;
		const groupMid = groupStart - slideDistance;
		const groupEnd = width + 500;

		const bgStart = this.backgroundImage ? this.backgroundImage.x() : 0;
		const bgMid = bgStart - slideDistance;
		const bgEnd = width + 500;

		const gifStartPct = this.overlayGifElement ? parseFloat(this.overlayGifElement.style.left || '50') : 50;
		const deltaPctPerPx = 100 / width;
		const gifMidPct = gifStartPct - (slideDistance * deltaPctPerPx);
		const gifEndPct = 150; // off-screen right

		let rafId: number | null = null;
		const t0 = performance.now();
		const totalMs = EXIT_ANIM_DURATION * 1000;
		const nudgeMs = nudgeDuration * 1000;

		const step = (now: number) => {
			const elapsed = Math.min(now - t0, totalMs);
			if (elapsed <= nudgeMs) {
				const p = elapsed / nudgeMs;
				this.group.x(groupStart + (groupMid - groupStart) * p);
				if (this.backgroundImage) this.backgroundImage.x(bgStart + (bgMid - bgStart) * p);
				if (this.overlayGifElement) this.overlayGifElement.style.left = `${gifStartPct + (gifMidPct - gifStartPct) * p}%`;
			} else {
				const p = (elapsed - nudgeMs) / (totalMs - nudgeMs);
				this.group.x(groupMid + (groupEnd - groupMid) * p);
				if (this.backgroundImage) this.backgroundImage.x(bgMid + (bgEnd - bgMid) * p);
				if (this.overlayGifElement) this.overlayGifElement.style.left = `${gifMidPct + (gifEndPct - gifMidPct) * p}%`;
			}

			// Redraw layers for Konva nodes
			this.contentLayer.batchDraw();
			this.backgroundLayer.batchDraw();

			if (elapsed < totalMs) {
				rAF();
			}
		};

		const rAF = () => { rafId = requestAnimationFrame(step); };
		rAF();

		// Fade to black + zoom into base background
		const fadeRect = new Konva.Rect({ x:0, y:0, width, height, fill:'black', opacity:0 });
		this.overlayLayer.add(fadeRect);
		this.overlayLayer.draw();

		const fadeDuration = 3; // seconds

		// Fade out background music in sync with the black fade
		{
			const startVol = this.backgroundMusic ? this.backgroundMusic.volume : 1;
			const targetVol = 0;
			const totalMs = fadeDuration * 1000;
			const t0 = performance.now();
			const stepVol = (now: number) => {
				const elapsed = Math.min(now - t0, totalMs);
				const p = totalMs > 0 ? elapsed / totalMs : 1;
				const v = startVol + (targetVol - startVol) * p;
				if (this.backgroundMusic) {
					this.backgroundMusic.volume = Math.max(0, Math.min(1, v));
				}
				if (elapsed < totalMs) {
					requestAnimationFrame(stepVol);
				}
			};
			requestAnimationFrame(stepVol);
		}

		const fadeTween = new Konva.Tween({
			node: fadeRect,
			duration: fadeDuration,
			opacity: 1,
			easing: Konva.Easings.Linear,
			onFinish: () => {
				// Guarantee music fully faded on completion
				if (this.backgroundMusic) this.backgroundMusic.volume = 0;
				onComplete();
			}
		});


		// Zoom into the center of the screen: adjust scale AND position to keep center fixed
		if (this.baseBackgroundImage) {
			const currentScaleX = this.baseBackgroundImage.scaleX();
			const currentScaleY = this.baseBackgroundImage.scaleY();
			const targetScaleX = currentScaleX * 8;
			const targetScaleY = currentScaleY * 8;
			// Compute target top-left so that the image remains centered after scaling
			const imgW = this.baseBackgroundImage.width();
			const imgH = this.baseBackgroundImage.height();
			const targetW = imgW * targetScaleX;
			const targetH = imgH * targetScaleY;
			const targetX = (width - targetW) / 2;
			const targetY = (height - targetH) / 2;

			const zoomTween = new Konva.Tween({
				node: this.baseBackgroundImage,
				duration: fadeDuration,
				scaleX: targetScaleX,
				scaleY: targetScaleY,
				x: targetX,
				y: targetY,
				easing: Konva.Easings.EaseIn,
			});
			zoomTween.play();
		}

		fadeTween.play();
	}
}
