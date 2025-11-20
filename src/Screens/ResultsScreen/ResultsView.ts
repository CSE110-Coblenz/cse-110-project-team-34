import Konva from 'konva';

// Export the class so ViewManager.ts can import it
export class ResultsView {

    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private winText: Konva.Text;

    // The constructor must accept a Konva.Stage, as ViewManager.ts passes one in.
    constructor(stage: Konva.Stage) {
        this.stage = stage;
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // Create "you win :)" text at the center
        this.winText = new Konva.Text({
            x: 0,
            y: 0,
            text: 'you win :)',
            fontSize: 72,
            fontFamily: 'Arial',
            fill: '#000000ff', // Green color
            align: 'center',
            verticalAlign: 'middle'
        });

        // Center the text
        this.winText.x((this.stage.width() - this.winText.width()) / 2);
        this.winText.y((this.stage.height() - this.winText.height()) / 2);

        this.layer.add(this.winText);

        // --- Placeholder ---
        // You can add your results screen UI (scores, "Play Again?" button) here
        // For now, we'll just hide it by default.
        this.layer.hide();
    }

    // show() method is required by ViewManager.ts
    show() {
        this.layer.show();
        this.layer.draw();
        // ... any logic to start rendering the results ...
    }

    // hide() method is required by ViewManager.ts
    hide() {
        this.layer.hide();
        // ... any logic to stop rendering the results ...
    }

    // Update the score display
    updateScore(score: number) {
        // For now, we just show "you win :)" regardless of score
        // You can add score display later if needed
    }
}