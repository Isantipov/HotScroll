function Player (name, isOpponent) {

    this.name = name;
    this.score = 0;
    this.element = document.querySelector(isOpponent ? '#opponentPlayer' : '#currentPlayer');
    this.element.style.backgroundPosition = '0 0';
    this.icon = document.querySelector(isOpponent ? '#opponentIcon' : '#currentIcon');
    this.timestamp = new Date().getTime();
}

Player.prototype.setScore = function (score) {
    this.score = score;
    var scorePercent = (this.score / game.TOTAL_SCORE) * 100;
    this.icon.style.left = scorePercent + '%';
    Environment.move(scorePercent);
};

Player.prototype.animateCat = function (timeout, direction) {
    var that = this;
    var bgPos = parseInt(this.element.style.backgroundPosition, 10);
    bgPos -= 350 * direction;
    if (Math.abs(bgPos) > 7700) {
        this.element.style.backgroundPosition = '0 0';
    } else if (bgPos > 0) {
        this.element.style.backgroundPosition = -7700 + 'px 0';
    } else {
        this.element.style.backgroundPosition = bgPos + 'px 0';
    }
    var newTimeout = Math.pow(timeout, 1.05);
    if (timeout < 120) {
        that.interval = setTimeout(function () {
            that.animateCat(newTimeout, direction);
        }, newTimeout);
    }
};

Player.prototype.playAnimation = function (event, direction) {
    clearTimeout(this.interval);
    this.animateCat(event.timeStamp - this.timestamp, direction);
    window.timestamp = event.timeStamp;
};