import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { GameView } from "./GameView";
// Uncomment to enable sandbox testing
// import { runSandbox } from "./sandbox";

export class GameController {
	private screenSwitcher: ScreenSwitcher;
	private view: GameView;

	constructor(screenSwitcher: ScreenSwitcher, stage: Konva.Stage) {
		this.screenSwitcher = screenSwitcher;
		
		// Create the view
		this.view = new GameView(stage);
		
		// Load the US map
		this.view.loadMap('/Blank_US_Map_(states_only).svg').then(() => {
			console.log('Map loaded successfully!');
			console.log(`Total states found: ${this.view.getAllStates().size}`);
			
			// Set all states to light blue (#ADD8E6)
			this.view.setAllStatesOriginalColor('#adeaffff');
			
			// Make gameView accessible globally for testing in console
			(window as any).gameView = this.view;
			console.log('💡 Access gameView in console: window.gameView');
			console.log('💡 Example: window.gameView.getState("ca")?.color("red")');
			
			// SANDBOX MODE - Uncomment to run automated tests
			//runSandbox(this.view);
		});
	}

	getView() {
		return this.view;
	}

	show(): void {
		this.view.show();
	}

	hide(): void {
		this.view.hide();
	}
}