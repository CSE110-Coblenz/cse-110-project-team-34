import Konva from 'konva';
import { GameModel } from './GameModel';

// Game View for Cracked Mode
export class GameView {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private model: GameModel;
    private messageText: Konva.Text | null = null;

    constructor(stage: Konva.Stage, model: GameModel) {
        this.stage = stage;
        this.model = model;
        
        // Create a layer for the text
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
        
        // Create centered text saying "This is cracked mode" in black
        this.messageText = new Konva.Text({
            x: 0,
            y: this.stage.height() / 2 - 50,
            width: this.stage.width(),
            text: 'This is cracked mode',
            fontSize: 64,
            fontFamily: 'Arial',
            fill: 'black',
            align: 'center',
            verticalAlign: 'middle',
        });
        
        this.layer.add(this.messageText);
        this.layer.draw();
        
        console.log('Cracked Mode GameView initialized');
    }

    show(): void {
        this.layer.show();
    }

    hide(): void {
        this.layer.hide();
    }

    destroy(): void {
        this.layer.destroy();
    }
}
