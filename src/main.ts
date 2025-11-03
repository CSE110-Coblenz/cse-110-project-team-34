import { MenuController } from "./Screens/MenuScreen/MenuController";
import { GameController } from "./Screens/GameScreen/GameController";
import { ResultsController } from "./Screens/ResultsScreen/ResultsController";
import Konva from 'konva';

enum GameScreen {
    Menu,
    Game,
    Results,
}

class Main {
    stage: Konva.Stage;
    layer: Konva.Layer;
    currentScreen: GameScreen = GameScreen.Menu;

    constructor() {
        const stageWidth = window.innerWidth;
        const stageHeight = window.innerHeight;

        this.stage = new Konva.Stage({
            container: 'app', // Assumes you have a <div id="app"></div> in your HTML
            width: stageWidth,
            height: stageHeight,
        });

        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // Resize the stage when the window is resized
        window.addEventListener('resize', () => {
            this.stage.width(window.innerWidth);
            this.stage.height(window.innerHeight);
            this.layer.draw();
        });

        // Start the menu screen (or your initial screen)
        this.showMenuScreen();
    }

    showMenuScreen() {
        this.layer.destroyChildren(); // Clear the layer
        const menuController = new MenuController({ switchToScreen: () => this.showGameScreen() }, this.stage);
        this.layer.add(menuController.getView().getGroup());
        menuController.show(); // Show the menu
        this.currentScreen = GameScreen.Menu;
        this.layer.draw();
    }

    showGameScreen() {
        this.layer.destroyChildren();
        const gameController = new GameController({ switchToScreen: () => this.showResultsScreen() });
        this.layer.add(gameController.getView().getGroup());
        this.currentScreen = GameScreen.Game;
        this.layer.draw();
    }

    showResultsScreen() {
        this.layer.destroyChildren();
        const resultsController = new ResultsController({ switchToScreen: () => this.showMenuScreen() });
        this.layer.add(resultsController.getView().getGroup());
        this.currentScreen = GameScreen.Results;
        this.layer.draw();
    }
}

// Initialize the main application
new Main();