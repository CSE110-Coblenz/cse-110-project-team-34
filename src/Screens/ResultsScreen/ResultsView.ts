import Konva from 'konva';

// Export the class so ViewManager.ts can import it
export class ResultsView {

    private stage: Konva.Stage;
    private layer: Konva.Layer;

    // The constructor must accept a Konva.Stage, as ViewManager.ts passes one in.
    constructor(stage: Konva.Stage) {
        this.stage = stage;
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width: this.stage.width(),
            height: this.stage.height(),
            fill: "#003366", //dark blue background
        });
        this.layer.add(background);

        // Konva.Image.fromURL("/Humble Gift - Paper UI System v1.1/results_background_image.png", (backgroundImage) => {
        Konva.Image.fromURL("/Humble Gift - Paper UI System v1.1/Sprites/Book Desk/desk image.jpg", (backgroundImage) => {
            backgroundImage.x(0);
            backgroundImage.y(0);
            backgroundImage.width(this.stage.width());
            backgroundImage.height(this.stage.height());
            this.layer.add(backgroundImage);
            this.layer.draw();

            Konva.Image.fromURL("/Humble Gift - Paper UI System v1.1/certificate_image.png", (certificate) => {
            certificate.x(this.stage.width() / 2 );  // Centered horizontally
            certificate.y(this.stage.height() / 2 ); // Centered vertically
            certificate.width(750);
            certificate.height(850); 
            certificate.offsetX(certificate.width() / 2); // Offset to center
            certificate.offsetY(certificate.height() / 2); // Offset to center
            this.layer.add(certificate);
            this.layer.draw();

                const completionText = new Konva.Text({
                    x: this.stage.width() / 2 - 300,
                    y: this.stage.height() / 2 - 100,
                    text: 'Congratulations for achieving an impressive \nscore in classic mode!\n\nCan you beat your own record?',
                    fontSize: 32,
                    fontFamily: "Times New Roman",
                    fill: "black",
                });
                    this.layer.add(completionText);
                    this.layer.draw();
            });
        });

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