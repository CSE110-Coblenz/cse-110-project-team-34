# Game Screens Architecture

> Complete application flow from Menu → Game Modes → Results with MVC architecture using Base classes for shared logic

## Architecture Overview Class Diagram

```mermaid
classDiagram
    %% Base Layer
    class BaseGameController {
        <<abstract>>
        #screenSwitcher: ScreenSwitcher
        #view: BaseGameView
        #model: BaseGameModel
        +constructor(screenSwitcher, stage)
        #createModel()* BaseGameModel
        #createView(stage, model)* BaseGameView
        #setupModeSpecificFeatures()*
        #onCorrectAnswer()*
        #initializeView()
        #checkWinCondition()
        +show()
        +hide()
        +destroy()
        +refreshView()
    }

    class BaseGameView {
        <<abstract>>
        #stage: Konva.Stage
        #model: BaseGameModel
        #backgroundLayer: Konva.Layer
        #layer: Konva.Layer
        #svgContainer: HTMLDivElement
        #inputTextDisplay: Konva.Text
        #historyTextDisplay: Konva.Text
        +constructor(stage, model)
        +loadImages(imgSrcs)
        +loadMap(svgPath)
        #parseStatePaths(svg)
        #setupStatePathInteraction(path, stateCode)*
        +updateViewFromModel()
        +handleKeyPress(event)
        #handleResize()
        #updateInputTextDisplay()
        #updateHistoryDisplay()
        +show()
        +hide()
        +destroy()
    }

    class BaseGameModel {
        <<abstract>>
        #states: Map~string, StateData~
        #currentStateCode: string
        #inputText: string
        #inputHistory: string[]
        +getState(code)
        +setCurrentState(code)
        +getInputText()
        +setInputText(text)
        +addToHistory(text)
        +getStatesGuessedCount()
        +onCorrectGuess()*
    }

    %% Menu Screen
    class MenuController {
        -view: MenuView
        -switcher: ScreenSwitcher
        +constructor(screenSwitcher, stage)
        +getView()
        +show()
        +hide()
    }

    class MenuView {
        -stage: Konva.Stage
        -layer: Konva.Layer
        +practiceButton: Konva.Group
        +classicButton: Konva.Group
        +crackedButton: Konva.Group
        +constructor(stage)
        +animateExit(callback)
        +show()
        +hide()
    }

    class MenuModel {
        -selectedMode: string
        +getSelectedMode()
        +setSelectedMode(mode)
    }

    %% Classic Mode
    class ClassicController {
        #model: GameModel
        #view: GameView
        #createModel() GameModel
        #createView(stage, model) GameView
        #setupModeSpecificFeatures()
        #onCorrectAnswer()
    }

    class ClassicView {
        -uiLayer: Konva.Layer
        -multiplierLayer: Konva.Layer
        -multiplierText: Konva.Text
        -playerPointsLayer: Konva.Layer
        -playerPointsText: Konva.Text
        -gameClockContainer: HTMLDivElement
        -statesGuessedContainer: HTMLDivElement
        -inputLabelContainer: HTMLDivElement
        +constructor(stage, model)
        -initializeMultiplier()
        -initializePlayerPoints()
        -initializeGameClock()
        -initializeStatesGuessed()
        -initializeInputLabel()
        #setupStatePathInteraction(path, code)
        #updateViewFromModel()
        #handleResize()
        #updateInputTextDisplay()
        +refreshMultiplier()
        +refreshPlayerPoints()
    }

    class ClassicModel {
        -multiplier: number
        -playerPoints: number
        -gameClock: number
        +getMultiplier()
        +increaseMultiplier()
        +decreaseMultiplier()
        +getPlayerPoints()
        +addPoints(points)
        +getGameClock()
        +incrementGameClock()
        +onCorrectGuess()
    }

    %% Practice Mode
    class PracticeController {
        #createModel() GameModel
        #createView(stage, model) GameView
        #setupModeSpecificFeatures()
        #onCorrectAnswer()
    }

    class PracticeView {
        +constructor(stage, model)
    }

    class PracticeModel {
        +onCorrectGuess()
    }

    %% Cracked Mode
    class CrackedController {
        #model: GameModel
        #view: GameView
        #createModel() GameModel
        #createView(stage, model) GameView
        #setupModeSpecificFeatures()
        #onCorrectAnswer()
    }

    class CrackedView {
        -uiLayer: Konva.Layer
        -losePopupContainer: HTMLDivElement
        -gameClockContainer: HTMLDivElement
        -statesGuessedContainer: HTMLDivElement
        -inputLabelContainer: HTMLDivElement
        +constructor(stage, model)
        -initializeGameClock()
        -initializeStatesGuessed()
        -initializeInputLabel()
        -showLosePopup()
        -hideLosePopup()
        #setupStatePathInteraction(path, code)
        #handleKeyPress(event)
        #updateViewFromModel()
        #handleResize()
        #updateInputTextDisplay()
    }

    class CrackedModel {
        -lives: number
        -gameClock: number
        -losePopupShown: boolean
        +getLives()
        +decrementLives()
        +getGameClock()
        +incrementGameClock()
        +isValidStateName(name)
        +onCorrectGuess()
    }

    %% Results Screen
    class ResultsController {
        -view: ResultsView
        -screenSwitcher: ScreenSwitcher
        -score: number
        +constructor(screenSwitcher, stage)
        +getView()
        +show()
        +hide()
        +setScore(score)
    }

    class ResultsView {
        -stage: Konva.Stage
        -layer: Konva.Layer
        -scoreText: Konva.Text
        +constructor(stage)
        +updateScore(score)
        +show()
        +hide()
    }

    class ResultsModel {
        -finalScore: number
        -mode: string
        +getFinalScore()
        +setFinalScore(score)
        +getMode()
    }

    %% Relationships - Inheritance
    BaseGameController <|-- ClassicController : extends
    BaseGameController <|-- PracticeController : extends
    BaseGameController <|-- CrackedController : extends
    
    BaseGameView <|-- ClassicView : extends
    BaseGameView <|-- PracticeView : extends
    BaseGameView <|-- CrackedView : extends
    
    BaseGameModel <|-- ClassicModel : extends
    BaseGameModel <|-- PracticeModel : extends
    BaseGameModel <|-- CrackedModel : extends

    %% Relationships - Composition
    MenuController *-- MenuView : has
    MenuController *-- MenuModel : has
    
    ClassicController *-- ClassicView : creates
    ClassicController *-- ClassicModel : creates
    
    PracticeController *-- PracticeView : creates
    PracticeController *-- PracticeModel : creates
    
    CrackedController *-- CrackedView : creates
    CrackedController *-- CrackedModel : creates
    
    ResultsController *-- ResultsView : has
    ResultsController *-- ResultsModel : has

    %% Relationships - Associations
    BaseGameController --> BaseGameModel : uses
    BaseGameController --> BaseGameView : uses
    BaseGameView --> BaseGameModel : observes
```

## Application Flow Diagram

```mermaid
stateDiagram-v2
    [*] --> MenuScreen
    
    MenuScreen --> ClassicMode : Click Classic
    MenuScreen --> PracticeMode : Click Practice
    MenuScreen --> CrackedMode : Click Cracked
    
    ClassicMode --> ResultsScreen : 50 States Guessed
    PracticeMode --> ResultsScreen : 50 States Guessed
    CrackedMode --> ResultsScreen : 50 States Guessed
    CrackedMode --> ResultsScreen : Lives Depleted
    
    ResultsScreen --> MenuScreen : Return to Menu
    
    state ClassicMode {
        [*] --> Playing
        Playing --> Typing : User Input
        Typing --> Correct : Valid State
        Typing --> Wrong : Invalid State
        Correct --> MultiplierIncrease
        MultiplierIncrease --> Playing
        Wrong --> Playing
        Playing --> [*] : Win Condition
    }
    
    state PracticeMode {
        [*] --> Practicing
        Practicing --> TypeState : User Input
        TypeState --> StateGuessed : Valid State
        StateGuessed --> Practicing
        Practicing --> [*] : Win Condition
    }
    
    state CrackedMode {
        [*] --> CrackedPlaying
        CrackedPlaying --> CrackedTyping : User Input
        CrackedTyping --> CrackedCorrect : Valid State
        CrackedTyping --> LivesLost : Invalid State
        LivesLost --> LosePopup
        LosePopup --> CrackedPlaying
        CrackedCorrect --> CrackedPlaying
        CrackedPlaying --> [*] : Win/Lose
    }
```

## File Structure

```mermaid
graph TD
    A[src/] --> B[common/]
    A --> C[Screens/]
    
    B --> B1[BaseGameController.ts<br/>131 lines]
    B --> B2[BaseGameView.ts<br/>553 lines]
    B --> B3[BaseGameModel.ts]
    B --> B4[USMapData.ts]
    
    C --> D[MenuScreen/]
    C --> E[GameScreen Classic Mode/]
    C --> F[Game Screen Practice Mode/]
    C --> G[Game Screen Cracked Mode/]
    C --> H[ResultsScreen/]
    
    D --> D1[MenuController.ts<br/>56 lines]
    D --> D2[MenuView.ts]
    D --> D3[MenuModel.ts]
    
    E --> E1[classicController.ts<br/>59 lines]
    E --> E2[classicView.ts<br/>360 lines]
    E --> E3[classicModel.ts]
    
    F --> F1[practiceController.ts<br/>37 lines]
    F --> F2[practiceView.ts<br/>37 lines]
    F --> F3[practiceModel.ts]
    
    G --> G1[crackedController.ts<br/>45 lines]
    G --> G2[crackedView.ts<br/>357 lines]
    G --> G3[crackedModel.ts]
    
    H --> H1[ResultsController.ts<br/>32 lines]
    H --> H2[ResultsView.ts]
    H --> H3[ResultsModel.ts]
    
    style B1 fill:#e1f5ff
    style B2 fill:#e1f5ff
    style B3 fill:#e1f5ff
    style E1 fill:#fff3cd
    style E2 fill:#fff3cd
    style F1 fill:#d1ecf1
    style F2 fill:#d1ecf1
    style G1 fill:#f8d7da
    style G2 fill:#f8d7da
```

## Design Patterns Applied

### Factory Method Pattern
**Location**: `BaseGameController`
- **Abstract Methods**: `createModel()`, `createView()`
- **Purpose**: Allows child controllers to instantiate mode-specific Models and Views
- **Benefit**: Polymorphic object creation without knowing concrete classes

```mermaid
graph LR
    A[BaseGameController] --> B{Factory Methods}
    B --> C[createModel]
    B --> D[createView]
    C --> E[ClassicModel]
    C --> F[PracticeModel]
    C --> G[CrackedModel]
    D --> H[ClassicView]
    D --> I[PracticeView]
    D --> J[CrackedView]
```

### Template Method Pattern
**Location**: `BaseGameController.initializeView()`
- **Invariant Steps**: Load images → Load map → Sync model → Setup callback
- **Variable Steps**: `setupModeSpecificFeatures()`, `onCorrectAnswer()`
- **Purpose**: Define skeleton of algorithm, let subclasses override specific steps

```mermaid
sequenceDiagram
    participant Base as BaseGameController
    participant Child as ClassicController
    participant View as ClassicView
    
    Base->>Base: initializeView()
    Base->>View: loadImages()
    Base->>View: loadMap()
    Base->>View: updateViewFromModel()
    Base->>Child: setupModeSpecificFeatures()
    Child->>Child: Start multiplier timer
    Child->>Child: Start game clock
    Child->>Child: Expose console access
    Base->>Base: pickRandomState()
    Base->>Base: checkWinCondition()
```

### Hook Method Pattern
**Location**: Multiple override points in Base classes
- **Methods**: `setupStatePathInteraction()`, `updateViewFromModel()`, `handleKeyPress()`, `handleResize()`
- **Purpose**: Allow child classes to inject custom behavior at specific points
- **Benefit**: Optional customization without breaking base functionality

## Architecture Principles

### Chapter 8: Increase Cohesion
**Applied To**: `BaseGameView`
- **Problem**: View responsibilities were scattered and duplicated across modes
- **Solution**: Consolidated all rendering logic (images, SVG, input, history) into base class
- **Result**: Single Responsibility - BaseGameView handles all visual rendering

### Chapter 14: Conceptual Integrity  
**Applied To**: `BaseGameController`
- **Problem**: Controllers had mode-specific conditional logic, breaking consistency
- **Solution**: Normalized interface using polymorphism (`model.onCorrectGuess()`)
- **Result**: Consistent API across all game modes, no conditional branching

## Code Metrics

### Controller Size Reduction

| Component | Before | After | Reduction |
|-----------|--------|-------|-----------|
| Classic Controller | 123 lines | 59 lines | **52% ↓** |
| Practice Controller | 77 lines | 37 lines | **52% ↓** |
| Cracked Controller | 95 lines | 45 lines | **53% ↓** |
| **Total** | **295 lines** | **141 + 131 (base) = 272** | **8% ↓** |

### Benefits
- ✅ **52% average reduction** in child controller code
- ✅ **Single source of truth** for shared game logic
- ✅ **Consistent interface** across all modes (conceptual integrity)
- ✅ **Easier extensibility** for new game modes
- ✅ **Polymorphic interactions** eliminate conditional logic

## Developer Features

### Classic Mode
- 🕐 **Game Clock** (yellow, top-left, 1% offset)
- 📊 **States Guessed Counter** (below game clock)
- ⌨️ **Input Label** (above input box)
- 🖱️ **State Clicking** (developer flag)
- 🔍 **Console Access** (`window.gameModel`, `window.gameController`)

### Practice Mode
- 🚫 **No developer features** (pure minimal practice mode)

### Cracked Mode
- 🕐 **Game Clock** (yellow, top-left, 2% offset)
- 📊 **States Guessed Counter** (below game clock)
- ⌨️ **Input Label** (above input box)
- 🖱️ **State Clicking** (developer flag)
- ❌ **Lose Popup** (triggers on invalid state, blocks input)
- ✅ **Invalid State Detection** (validates state names)

### Styling Specifications
- **Color**: Yellow text (`#ffff00`) on black background (`#000000`)
- **Font**: Arial, bold
- **Position**: Top-left corner with responsive offsets (1-2% of window size)
- **Behavior**: Non-blocking (`pointerEvents: 'none'`), repositions on resize
- **z-index**: 10000 (always on top)
