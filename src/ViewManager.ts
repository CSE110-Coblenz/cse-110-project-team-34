/*
    This file is responsible for managing the different views/screens of the application.
    It initializes the Konva stage and handles switching between the Menu, Game, and Results views.
*/

import Konva from 'konva';
import { MenuView } from './Screens/MenuScreen/MenuView';
import { GameView } from './Screens/GameScreen/GameView';
import { ResultsView } from './Screens/ResultsScreen/ResultsView';

export class ViewManager {
    stage: Konva.Stage;
    menuView: MenuView;
    gameView: GameView;
    resultsView: ResultsView;

    constructor() {
        // This class has the SINGLE RESPONSIBILITY of managing the stage
        this.stage = new Konva.Stage({
            container: 'container',
            width: window.innerWidth,
            height: window.innerHeight,
        });

        // Handles its own resizing
        window.addEventListener('resize', () => {
            this.stage.width(window.innerWidth);
            this.stage.height(window.innerHeight);
        });

        // Creates the screens, passing the stage to them
        this.menuView = new MenuView(this.stage);
        this.gameView = new GameView(this.stage);
        this.resultsView = new ResultsView(this.stage);
    }

    showMenu() {
        this.gameView.hide();
        this.resultsView.hide();
        this.menuView.show();
    }

    showGame() {
        this.menuView.hide();
        this.resultsView.hide();
        this.gameView.show();
    }

    showResults() {
        this.menuView.hide();
        this.gameView.hide();
        this.resultsView.show();
    }
}