function Player (name, isOpponent, template) {

    this.name = name;
    this.isOpponent = isOpponent;
    this.score = 0;
    this.element = document.querySelector(isOpponent ? '#opponentPlayer' : '#currentPlayer');
    this.element.style.backgroundPosition = '0 0';
    this.icon = document.querySelector(isOpponent ? '#opponentIcon' : '#currentIcon');
    this.timestamp = new Date().getTime();
    this.templateClass = template == 0 ? 'pink' : 'green';
    this.iconClass = this.templateClass + '-cat';
    this.rightDirection = 1;
    this.butterfly = null;
}

Player.prototype.setScore = function (score) {
    this.score = score;
    var scorePercent = ((this.score / game.TOTAL_SCORE) * 100).toFixed(5);
    this.icon.style.left = scorePercent + '%';
    if (!this.isOpponent) {
        game.recordStep(this.score);
        Environment.move(scorePercent);
        game.opponentPlayer.setScore(game.opponentPlayer.score);
    } else {
        var bgPercent = parseFloat(Environment.ground.style.backgroundPosition);
        var opponentBgPercent = (game.opponentPlayer.score / game.TOTAL_SCORE) * 100 * 14;
        // 428 - ground pattern image width in px
        this.element.style.left = window.innerWidth / 2 + (window.innerWidth * (bgPercent / 100) - (bgPercent / 100) * 428) + (window.innerWidth * (opponentBgPercent / 100) - (opponentBgPercent / 100) * 428) + 'px';
    }
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

Player.prototype.rotate = function () {
    if (this.rightDirection === 1) {
        this.element.className += ' rotated';
        this.rightDirection = -1;
    } else {
        this.element.className = this.element.className.replace('rotated', '');
        this.rightDirection = 1;
    }
};

Player.prototype.initializeCat = function () {
    $(this.element).addClass(this.templateClass);
    $(this.icon).addClass(this.iconClass);
};