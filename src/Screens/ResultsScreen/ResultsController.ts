import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";

export class ResultsController {
	private screenSwitcher: ScreenSwitcher;
	private group: Konva.Group;
	private score: number = 0;

	constructor(screenSwitcher: ScreenSwitcher) {
		this.screenSwitcher = screenSwitcher;
		this.group = new Konva.Group();
		this.group.visible(false);
		
		// TODO: Initialize results view components
	}

	getView() {
		return {
			getGroup: () => this.group,
			show: () => this.show(),
			hide: () => this.hide(),
		};
	}

	show(): void {
		this.group.visible(true);
		// TODO: Implement show logic
	}

	hide(): void {
		this.group.visible(false);
		// TODO: Implement hide logic
	}

	showResults(score: number): void {
		this.score = score;
		this.show();
		// TODO: Implement results display logic with the score
	}
}