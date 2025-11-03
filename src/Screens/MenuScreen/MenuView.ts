import Konva from "konva";

// Use 'export' to make this class visible to other files
export class MenuView {
    
    private stage: Konva.Stage;
    private layer: Konva.Layer;

    constructor(stage: Konva.Stage) {
        this.stage = stage;
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // Begin drawing the menu screen here
    }

    // Method to show this screen
    show() {
        this.layer.show();
    }

    // Method to hide this screen
    hide() {
        this.layer.hide();
    }
}
