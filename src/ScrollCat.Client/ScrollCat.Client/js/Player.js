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
    this.inertMovement = 0;
    this.butterfly = null;
    this.timestamp = 0;
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
    var that = this,
        style = this.element.style;

    var bgPos = parseInt(style.backgroundPosition, 10);
    bgPos -= 350 * direction;

    if (Math.abs(bgPos) > 7700) {
        style.backgroundPositionX = '0px';
    } else if (bgPos > 0) {
        style.backgroundPositionX = '-7700px';
    } else {
        style.backgroundPositionX = bgPos + 'px';
    }

    if (timeout < 120) {
        var newTimeout = 1.5 * timeout;
        that.interval = setTimeout(function () {
            that.animateCat(newTimeout, direction);
            
            var newScore = game.currentPlayer.score + direction;
            if (newScore <= game.TOTAL_SCORE && newScore >= 0) {
                //Butterfly.matchScore(game.currentPlayer.score, game.currentPlayer);
                game.currentPlayer.setScore(newScore);
            }
        }, newTimeout);
    }
};

Player.prototype.playAnimation = function (event, direction) {
    clearTimeout(this.interval);
    this.animateCat(event.timeStamp - this.timestamp, direction);
    this.timestamp = event.timeStamp;
};

Player.prototype.rotate = function () {
    if (this.element.className.indexOf('rotated') < 0) {
        this.element.className += ' rotated';
    } else {
        this.element.className = this.element.className.replace('rotated', '');
    }
};
Player.prototype.rotateRightDirection = function () {
    if (this.rightDirection === -1) {
        this.rightDirection = 1;
    } else {
        this.rightDirection = -1;
    }
};

Player.prototype.initializeCat = function () {
    $(this.element).addClass(this.templateClass);
    $(this.icon).addClass(this.iconClass);
};