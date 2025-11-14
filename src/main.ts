import { MenuController } from "./Screens/MenuScreen/MenuController";
import { GameController } from "./Screens/GameScreen/GameController";
import { ResultsController } from "./Screens/ResultsScreen/ResultsController";
import { developerOnly_skipMenuScreen } from "./Screens/GameScreen/sandbox";
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
    menuController: MenuController | null = null;
    gameController: GameController | null = null;
    resultsController: ResultsController | null = null;

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

        // Start the appropriate screen based on developer flag
        if (developerOnly_skipMenuScreen) {
            this.showGameScreen();
        } else {
            this.showMenuScreen();
        }
    }

    showMenuScreen() {
        // Hide other screens
        if (this.gameController) {
            this.gameController.hide();
        }
        if (this.resultsController) {
            this.resultsController.hide();
        }
        
        this.layer.destroyChildren(); // Clear the layer
        this.menuController = new MenuController({ switchToScreen: () => this.showGameScreen() }, this.stage);
        // Don't add the group to this.layer - MenuView manages its own layers
        this.menuController.show(); // Show the menu
        this.currentScreen = GameScreen.Menu;
        this.layer.draw();
    }

    showGameScreen() {
        // Hide menu screen
        if (this.menuController) {
            this.menuController.hide();
        }
        if (this.resultsController) {
            this.resultsController.hide();
        }
        
        this.layer.destroyChildren();
        this.gameController = new GameController({ switchToScreen: () => this.showResultsScreen() }, this.stage);
        this.gameController.show();
        this.currentScreen = GameScreen.Game;
        this.layer.draw();
    }

    showResultsScreen() {
        // Hide other screens
        if (this.menuController) {
            this.menuController.hide();
        }
        if (this.gameController) {
            this.gameController.hide();
        }
        
        this.layer.destroyChildren();
        this.resultsController = new ResultsController({ switchToScreen: () => this.showMenuScreen() });
        this.layer.add(this.resultsController.getView().getGroup());
        this.currentScreen = GameScreen.Results;
        this.layer.draw();
    }
}

// Initialize the main application
new Main();