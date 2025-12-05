import Konva from 'konva';

// Export the class so ViewManager.ts can import it
export class ResultsView {

    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private scoreText: Konva.Text | null = null;  // Text to display the score
    private onReturnToMenu: (() => void )| null = null; // Callback for return to menu

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
                    text: 'Well done on completing practice mode!\n\nKeep practicing to master your\ngeography skills!',
                    fontSize: 38,
                    fontFamily: "Times New Roman",
                    fill: "#09668ed3",
                });
                    this.layer.add(completionText);

                    this.addBackToMenuButton();  // Add the "Return To Menu!" button
                    this.layer.draw();
            });
        });
    }

    setOnReturnToMenu(callback: () => void) {
        this.onReturnToMenu = callback;
    }

    addBackToMenuButton() {
        const buttonWidth = 200;
        const buttonHeight = 60;
        const backToMenuButton = new Konva.Rect({
            x: this.stage.width() / 2 - buttonWidth / 2,
            y: this.stage.height() / 2 + 150,
            width: buttonWidth,
            height: buttonHeight,
            fill: "#003366",
            cornerRadius: 10,
            shadowColor: "black",
            shadowBlur: 10,
            shadowOffset: { x: 2, y: 2 },
            shadowOpacity: 0.5,
            cursor: "pointer",
        });
        const buttonText = new Konva.Text({
            x: backToMenuButton.x() + 20,
            y: backToMenuButton.y() + 15,
            text: "Return To Menu!",
            fontSize: 24,
            fontFamily: "Times New Roman",
            fill: "white",
        });

        const handleClickButtom = () => {
            if (this.onReturnToMenu) {
                this.onReturnToMenu();
            }
        };

        backToMenuButton.on("click", handleClickButtom);
        buttonText.on("click", handleClickButtom);

        this.layer.add(backToMenuButton);
        this.layer.add(buttonText);
        this.layer.draw();
    }

    // Update the score display
    updateScore(score: number) : void{
        // For now, we just show "you win :)" regardless of score
        // You can add score display later if needed
        if(this.scoreText) {
            this.scoreText.text(`Final Score: ${score}`);
            this.layer.draw();
            return;
        }
        this.scoreText = new Konva.Text({
            x: this.stage.width() / 2 - 300,
            y: this.stage.height() / 2 + 55,
            text: `Final Score: ${score}`,
            fontSize: 38,
            fontFamily: "Times New Roman",
            fill: "black",
        });
    
        this.layer.add(this.scoreText); 
        this.layer.draw();
    }

    // show() method is required by ViewManager.ts
    show() {
        this.layer.show();
        this.layer.draw();
    }

    // hide() method is required by ViewManager.ts
    hide() {
        this.layer.hide();
        // ... any logic to stop rendering the results ...
    }
}