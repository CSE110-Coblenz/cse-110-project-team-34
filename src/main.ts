import { MenuController } from "./Screens/MenuScreen/MenuController";
import { GameController } from "./Screens/GameScreen (Classic Mode)/GameController";
import { ResultsController } from "./Screens/ResultsScreen/ResultsController";
import { skipMenuScreen } from "./sandbox";
import type { Screen } from "./types";
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
        if (skipMenuScreen) {
            this.showGameScreen();
        } else {
            this.showMenuScreen();
        }
    }

    switchToScreen(screen: Screen) {
        if (screen.type === "menu") {
            this.showMenuScreen();
        } else if (screen.type === "game") {
            this.showGameScreen();
        } else if (screen.type === "result") {
            this.showResultsScreen(screen.score);
        }
    }

    showMenuScreen() {
        // Hide and destroy other screens
        if (this.gameController) {
            this.gameController.hide();
            this.gameController.destroy();
            this.gameController = null;
        }
        if (this.resultsController) {
            this.resultsController.hide();
            this.resultsController = null;
        }
        
        this.layer.destroyChildren(); // Clear the layer
        this.menuController = new MenuController({ switchToScreen: (screen) => this.switchToScreen(screen) }, this.stage);
        this.menuController.show();
        this.currentScreen = GameScreen.Menu;
        this.layer.draw();
    }

    showGameScreen() {
        // Hide and destroy other screens
        if (this.menuController) {
            this.menuController.hide();
            this.menuController = null;
        }
        if (this.resultsController) {
            this.resultsController.hide();
            this.resultsController = null;
        }
        
        this.layer.destroyChildren();
        this.gameController = new GameController({ switchToScreen: (screen) => this.switchToScreen(screen) }, this.stage);
        this.gameController.show();
        this.currentScreen = GameScreen.Game;
        this.layer.draw();
    }

    showResultsScreen(score: number) {
        // Hide and destroy other screens
        if (this.menuController) {
            this.menuController.hide();
            this.menuController = null;
        }
        if (this.gameController) {
            this.gameController.hide();
            this.gameController.destroy();
            this.gameController = null;
        }
        
        this.layer.destroyChildren();
        this.resultsController = new ResultsController({ switchToScreen: (screen) => this.switchToScreen(screen) }, this.stage);
        this.resultsController.setScore(score);
        this.resultsController.show();
        this.currentScreen = GameScreen.Results;
        this.layer.draw();
    }
}

// Initialize the main application
new Main();