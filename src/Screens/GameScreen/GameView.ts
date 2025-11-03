import Konva from 'konva';

// Export the class so ViewManager.ts can import it
export class GameView {

    private stage: Konva.Stage;
    private layer: Konva.Layer;

    // The constructor must accept a Konva.Stage, as ViewManager.ts passes one in.
    constructor(stage: Konva.Stage) {
        this.stage = stage;
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // --- Placeholder ---
        // You can add your game-specific view logic (map, text, etc.) here
        // For now, we'll just hide it by default.
        this.layer.hide();
    }

    // show() method is required by ViewManager.ts
    show() {
        this.layer.show();
        // ... any logic to start rendering the game ...
    }

    // hide() method is required by ViewManager.ts
    hide() {
        this.layer.hide();
        // ... any logic to stop rendering the game ...
    }
}