export class BridgeModel {
    private score: number;

    constructor() {
        this.score = 0;
    }

    /** Increment score for correct guess */
    incrementScore(points: number = 1) {
        this.score += points;
        console.log(`Score increased: ${this.score}`);
    }

    /** Decrement score for wrong guess */
    decrementScore(points: number = 1) {
        this.score -= points;
        if (this.score < 0) this.score = 0; // prevent negative score
        console.log(`Score decreased: ${this.score}`);
    }

    /** Get current score */
    getScore(): number {
        return this.score;
    }

    /** Reset score to 0 */
    resetScore() {
        this.score = 0;
        console.log(`Score reset: ${this.score}`);
    }
}
