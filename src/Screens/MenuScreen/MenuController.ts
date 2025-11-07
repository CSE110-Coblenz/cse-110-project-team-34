import Konva from "konva";
import type { ScreenSwitcher } from "../../types.ts";
import { MenuModel } from "./MenuModel"; // Import its own Model
import { MenuView } from "./MenuView";   // Import its own View

// Export the class so main.ts can import it
export class MenuController {
    private model: MenuModel;
    private view: MenuView;
    private switcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher, stage: Konva.Stage) {
        this.switcher = screenSwitcher;

        // The CONTROLLER creates and "owns" its Model and View
        this.model = new MenuModel();
        this.view = new MenuView(stage); // Controller creates its Model and View

        // --- TODO: Wire up events (The Controller's real job) ---
        // Here we add interaction logic.
        // The View will expose its buttons as properties.
        
        // Example (once you add the buttons to your MenuView):
        const withExit = (mode: "practice" | "classic" | "cracked") => {
            this.view.animateExit(() => {
                this.switcher.switchToScreen({ type: "game", mode });
            });
        };

        this.view.practiceButton.on('click', () => withExit("practice"));
        this.view.classicButton.on('click', () => withExit("classic"));
        this.view.crackedButton.on('click', () => withExit("cracked"));
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