import { MenuController } from "./Screens/MenuScreen/MenuController";
import { GameController as ClassicGameController } from "./Screens/GameScreen (Classic Mode)/classicController";
import { GameController as PracticeGameController } from "./Screens/Game Screen (Practice Mode)/practiceController";
import { GameController as CrackedGameController } from "./Screens/Game Screen (Cracked Mode)/crackedController";
import { ResultsController as ClassicResultsController } from "./Screens/ResultsScreen (Classic Mode)/classicResultsController";
import { ResultsController as CrackedResultsController} from "./Screens/ResultsScreen (Cracked Mode)/crackedResultsController";
import { ResultsController as PracticeResultsController} from "./Screens/ResultsScreen (Practice Mode)/practiceResultsController";

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
    classicGameController: ClassicGameController | null = null;
    practiceGameController: PracticeGameController | null = null;
    crackedGameController: CrackedGameController | null = null;
    resultsController: ResultsController | null = null;
    private lastGameMode: "classic" | "practice" | "cracked" | null = null;
    private menuIntroCompleted = false;
    classicResultsController: ClassicResultsController | null = null;
    practiceResultsController: PracticeResultsController | null = null;
    crackedResultsController: CrackedResultsController | null = null

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
        if (skipMenuScreen !== "off") {
            this.showGameScreen(skipMenuScreen);
        } else {
            this.showMenuScreen();
        }
    }

    switchToScreen(screen: Screen) {
        if (screen.type === "menu") {
            this.showMenuScreen();
        } else if (screen.type === "game") {
            // Transition to Practice Mode game screen (uses Game Screen (Practice Mode) folder)
            // Transition to Classic Mode game screen (uses GameScreen (Classic Mode) folder)
            // Transition to Cracked Mode game screen (uses Game Screen (Cracked Mode) folder)
            this.showGameScreen(screen.mode);
        } else if (screen.type === "result") {
            this.showResultsScreen(screen.score, screen.mode);
        }
    }

    showMenuScreen() {
        // Hide and destroy other screens
        if (this.classicGameController) {
            this.classicGameController.hide();
            this.classicGameController.destroy();
            this.classicGameController = null;
        }
        if (this.practiceGameController) {
            this.practiceGameController.hide();
            this.practiceGameController.destroy();
            this.practiceGameController = null;
        }
        if (this.crackedGameController) {
            this.crackedGameController.hide();
            this.crackedGameController.destroy();
            this.crackedGameController = null;
        }
        if (this.classicResultsController) {
            this.classicResultsController.hide();
            this.classicResultsController = null;
        }
        if (this.practiceResultsController) {
            this.practiceResultsController.hide();
            this.practiceResultsController = null;
        }
        if (this.crackedResultsController) {
            this.crackedResultsController.hide();
            this.crackedResultsController = null;
        }
        
        this.layer.destroyChildren(); // Clear the layer
        // Always mark intro as completed after first game
        const skipIntro = this.menuIntroCompleted || skipMenuScreen !== "off";
        this.menuController = new MenuController(
            { switchToScreen: (screen) => this.switchToScreen(screen) },
            this.stage,
            { autoCompleteIntro: skipIntro },
        );
        this.menuController.show();
        this.currentScreen = GameScreen.Menu;
        this.layer.draw();
    }

    showGameScreen(mode: "classic" | "practice" | "cracked") {
        // Hide and destroy other screens
        if (this.menuController) {
            this.menuController.hide();
            this.menuController = null;
        }
        if (this.classicResultsController) {
            this.classicResultsController.hide();
            this.classicResultsController = null;
        }
        if (this.practiceResultsController) {
            this.practiceResultsController.hide();
            this.practiceResultsController = null;
        }
        if (this.crackedResultsController) {
            this.crackedResultsController.hide();
            this.crackedResultsController = null;
        }
        
        // Clean up any existing game controllers
        if (this.classicGameController) {
            this.classicGameController.hide();
            this.classicGameController.destroy();
            this.classicGameController = null;
        }
        if (this.practiceGameController) {
            this.practiceGameController.hide();
            this.practiceGameController.destroy();
            this.practiceGameController = null;
        }
        if (this.crackedGameController) {
            this.crackedGameController.hide();
            this.crackedGameController.destroy();
            this.crackedGameController = null;
        }
        
        this.layer.destroyChildren();
        this.menuIntroCompleted = true;
        
        this.lastGameMode = mode;

        // Create the appropriate game controller based on mode
        if (mode === "practice") {
            this.practiceGameController = new PracticeGameController({ switchToScreen: (screen) => this.switchToScreen(screen) }, this.stage);
            this.practiceGameController.show();
        } else if (mode === "classic") {
            this.classicGameController = new ClassicGameController({ switchToScreen: (screen) => this.switchToScreen(screen) }, this.stage);
            this.classicGameController.show();
        } else if (mode === "cracked") {
            this.crackedGameController = new CrackedGameController({ switchToScreen: (screen) => this.switchToScreen(screen) }, this.stage);
            this.crackedGameController.show();
        }
    }

    showResultsScreen(score: number, mode: "classic" | "practice" | "cracked") {
        // Hide and destroy other screens
        if (this.menuController) {
            this.menuController.hide();
            this.menuController = null;
        }
        if (this.classicGameController) {
            this.classicGameController.hide();
            this.classicGameController.destroy();
            this.classicGameController = null;
        }
        if (this.practiceGameController) {
            this.practiceGameController.hide();
            this.practiceGameController.destroy();
            this.practiceGameController = null;
        }
        if (this.crackedGameController) {
            this.crackedGameController.hide();
            this.crackedGameController.destroy();
            this.crackedGameController = null;
        }
        
        this.layer.destroyChildren();
        const restartMode = this.lastGameMode ?? "practice";
        this.resultsController = new ResultsController({ switchToScreen: (screen) => this.switchToScreen(screen) }, this.stage, restartMode);
        this.resultsController.setScore(score);
        this.resultsController.show();
        
        if (mode === 'practice') {
            this.practiceResultsController = new PracticeResultsController({ switchToScreen: (screen) => this.switchToScreen(screen) }, this.stage);
            this.practiceResultsController.setScore(score);
        } else if (mode === 'classic') {
            this.classicResultsController = new ClassicResultsController({ switchToScreen: (screen) => this.switchToScreen(screen) }, this.stage);
            this.classicResultsController.setScore(score);
        } else if (mode === 'cracked') {
            this.crackedResultsController = new CrackedResultsController({ switchToScreen: (screen) => this.switchToScreen(screen) }, this.stage);
            this.crackedResultsController.setScore(score);
        }   
        
        this.currentScreen = GameScreen.Results;
        this.layer.draw();
    }
}

// Initialize the main application
new Main();
