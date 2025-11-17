import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { GameView } from "./GameView";
import { GameModel } from "./GameModel";
// Uncomment to enable sandbox testing
// import { runSandbox } from "./sandbox";

export class GameController {
	private screenSwitcher: ScreenSwitcher;
	private view: GameView;
	private model: GameModel;

	constructor(screenSwitcher: ScreenSwitcher, stage: Konva.Stage) {
		this.screenSwitcher = screenSwitcher;

		// Create the Model and View
		this.model = new GameModel();
		this.view = new GameView(stage, this.model);

		// NEW: initialize GameView (load images sequentially)
		this.initializeView();


	}
	
	private async initializeView() {
		try {
			// Load images sequentially (background, overlay, etc.)
			await this.view.init();

			// Load the US map SVG
			const stateCodes = await this.view.loadMap('/Blank_US_Map_(states_only).svg');

			// Initialize model with state codes discovered by the view
			this.model.initializeStates(stateCodes, '#adeaffff');

            // Sync the view to reflect the model
            this.view.updateViewFromModel();

            // initialize multiplier display
            this.view.initializeMultiplier();

            // Set up callback for correct answers
            this.view.setOnCorrectAnswerCallback(() => this.whenCorrectAnswer());

            // Pick a random state on load
            this.view.pickRandomState();			// Start multiplier decrease timer (handled by controller)
			setInterval(() => {
				this.model.decreaseMultiplier();
				this.refreshView();
			}, 1000); // runs every 1000 ms (1 second)

			// Start game clock timer
			setInterval(() => {
				this.model.incrementGameClock();
				this.refreshView();
			}, 1000); // runs every 1000 ms (1 second)

			// Expose for console debugging
			(window as any).gameModel = this.model;
			console.log('💡 Access gameModel in console: window.gameModel');
			console.log('💡 Example: window.gameModel.getState("ca")?.color("red")');
			console.log('💡 After changing model, call: window.gameController.refreshView()');
			(window as any).gameController = this;

			// SANDBOX MODE - Uncomment to run automated tests
			// runSandbox(this.model);

		} catch (err) {
			console.error('❌ Failed to initialize GameController:', err);
		}
	}
	
	getView() {
		return this.view;
	}

	// we will call this when the player answers a state correctly
	whenCorrectAnswer(): void {
		this.model.increaseMultiplier();
		this.refreshView();
	}

	show(): void {
		this.view.show();
	}

	hide(): void {
		this.view.hide();
	}

	/** Expose a public method to refresh the view (useful for console debugging). */
	refreshView(): void {
		this.view.updateViewFromModel();
	}
}
