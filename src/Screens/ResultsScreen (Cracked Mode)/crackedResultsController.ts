import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { ResultsView } from "./crackedResultsView.ts";

export class ResultsController {
    private screenSwitcher: ScreenSwitcher;
    private view: ResultsView;
    private score: number = 0;

    constructor(screenSwitcher: ScreenSwitcher, stage: Konva.Stage) {
        this.screenSwitcher = screenSwitcher;
        this.view = new ResultsView(stage);

        this.view.setOnReturnToMenu(() => {
            this.screenSwitcher.switchToScreen({ type: "menu" });
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

    setScore(score: number): void {
        this.score = score;
        //this.view.updateScore(score);
    }
}