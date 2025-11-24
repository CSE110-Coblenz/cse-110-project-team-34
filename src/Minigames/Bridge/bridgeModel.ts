// Stores data and logic
// holds the correct answer, checks guess, updates score


export class BridgeModel {
    private score: number;
    private correctAnswer: number;

    constructor() {
        this.score = 0;
        this.correctAnswer = 0;
    }

    /** Increment score for correct guess */
    incrementScore() : void {
        this.score += 100;
        console.log(`Score increased: ${this.score}`);
    }

    /** Decrement score for wrong guess */
    decrementScore() : void {
        this.score -= 100;
        if (this.score < 0) this.score = 0; // prevent negative score
        console.log(`Score decreased: ${this.score}`);
    }

    // stores correct answer
    setCorrectAnswer(answer: number): void {
        this.correctAnswer = answer;    
    }   


    // check user guess against the correct answer
    checkGuess(userGuess: number): { isCorrect: boolean; correctAnswer: number } {
        const isCorrect = userGuess === this.correctAnswer;

        if (isCorrect) this.incrementScore();
        else this.decrementScore();

        return {
            isCorrect,
            correctAnswer: this.correctAnswer
        };
    }
}
