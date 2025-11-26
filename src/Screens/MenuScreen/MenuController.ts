import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { MenuView } from "./MenuView";
import { MenuModel } from "./MenuModel";

export class MenuController {
    private view: MenuView;
    private switcher: ScreenSwitcher;
    private model: MenuModel;

    constructor(screenSwitcher: ScreenSwitcher, stage: Konva.Stage) {
        this.switcher = screenSwitcher;
        this.model = new MenuModel();
        const { classicLocked, crackedLocked } = this.model.getLockedModes();
        this.view = new MenuView(stage, {
            classicModeLocked: classicLocked,
            crackedModeLocked: crackedLocked,
        });

        // Wire up Practice button click handler
        this.view.practiceButton.on('click', () => {
            this.view.animateExit(() => {
                // Transition to Practice Mode game screen (uses Game Screen (Practice Mode) folder)
                this.switcher.switchToScreen({ type: "game", mode: "practice" });
            });
        });

        // Wire up Classic button click handler
        this.view.classicButton.on('click', () => {
            if (this.view.isClassicModeLocked()) {
                this.view.playLockedFeedback('classic');
                return;
            }
            this.view.animateExit(() => {
                // Transition to Classic Mode game screen (uses GameScreen (Classic Mode) folder)
                this.switcher.switchToScreen({ type: "game", mode: "classic" });
            });
        });
        
        // Wire up Cracked button click handler
        this.view.crackedButton.on('click', () => {
            if (this.view.isCrackedModeLocked()) {
                this.view.playLockedFeedback('cracked');
                return;
            }
            this.view.animateExit(() => {
                // Transition to Cracked Mode game screen (uses Game Screen (Cracked Mode) folder)
                this.switcher.switchToScreen({ type: "game", mode: "cracked" });
            });
        });
    }

    // This method is required by main.ts.
    // It now correctly returns the *actual* view object.
    getView() {
        return this.view;
    }

    // This method is also required by main.ts.
    // It delegates the action to the view.
    show(): void {
        this.view.show();
    }

    // This method is also required by main.ts.
    // It delegates the action to the view.
    hide(): void {
        this.view.hide();
    }
}
