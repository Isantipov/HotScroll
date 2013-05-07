function Player (name, isOpponent) {

    this.name = name;
    this.score = 0;
    //this.element = document.querySelector(isOpponent ? '#opponentPlayer' : '#currentPlayer');
    this.icon = document.querySelector(isOpponent ? '#opponentIcon' : '#currentIcon');
}

Player.prototype.setScore = function (score) {
    this.score = score;
    this.icon.style.left = (this.score / game.TOTAL_SCORE) * 100 + '%';
};