import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { GameView } from "./GameView";
import { GameModel } from "./GameModel";
import { MULTIPLIER } from "../../gameConstants.ts"; 
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

		// Load the US map via View (View owns the SVG DOM)
		this.view.loadMap('/Blank_US_Map_(states_only).svg').then((stateCodes) => {
			// Initialize model with the state codes discovered by the view
			this.model.initializeStates(stateCodes, '#adeaffff');
			
			// Sync the view to show the model's initial state
			this.view.updateViewFromModel();

			// initialize multiplier display
			this.view.initializeMultiplier();

			// Expose for console debugging
			(window as any).gameModel = this.model;
			console.log('💡 Access gameModel in console: window.gameModel');
			console.log('💡 Example: window.gameModel.getState("ca")?.color("red")');
			console.log('💡 After changing model, call: window.gameController.refreshView()');
			(window as any).gameController = this;

			// SANDBOX MODE - Uncomment to run automated tests
			// runSandbox(this.model);
		});
	}	getView() {
		return this.view;
	}

	// we will call this when the player answers a state correctly
	whenCorrectAnswer(): void {
		this.view.increaseMultiplier();
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
