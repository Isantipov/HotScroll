function Player (name, isOpponent, template) {
    var _this = this;
    
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
    this.timestamp = 0;

    this.setScore = function (score) {
        _this.score = score;
        var scorePercent = ((_this.score / game.TOTAL_SCORE) * 100).toFixed(5);
        _this.icon.style.left = scorePercent + '%';
        game.recordStep(_this.score);
        Environment.move(scorePercent);
        game.opponentPlayer.setOpponentScore(game.opponentPlayer.score);
    };
    
    this.setOpponentScore = function (score) {
        _this.score = score;
        var scorePercent = ((_this.score / game.TOTAL_SCORE) * 100).toFixed(5);
        _this.icon.style.left = scorePercent + '%';
        var bgPercent = parseFloat(Environment.ground.style.backgroundPosition);
        var opponentBgPercent = (game.opponentPlayer.score / game.TOTAL_SCORE) * 100 * 14;
        // 428 - ground pattern image width in px
        _this.element.style.left = window.innerWidth / 2 + (window.innerWidth * (bgPercent / 100) - (bgPercent / 100) * 428) + (window.innerWidth * (opponentBgPercent / 100) - (opponentBgPercent / 100) * 428) + 'px';
    };

    this.animateCat = function(timeout) {

        /*if (timeout < 120) {
            _this.newTimeOut = 1.5 * timeout;
            _this.animationTimer = setTimeout(_this.animateCatByTimeout, _this.newTimeOut);
        }*/
    };

    this.animateCatByTimeout = function() {
        _this.animateCat(_this.newTimeOut);
        var newScore = _this.score + _this.direction;
        _this.setScore(newScore);
    };

    this.playAnimation = function(event, direction) {
        _this.direction = direction;
        if (!_this.timestamp) {
            _this.timestamp = event.timeStamp - 1;
        }
        
        var style = _this.element.style;
        var bgPos = parseInt(style.backgroundPosition);
        bgPos -= 350 * _this.direction;

        if (Math.abs(bgPos) > 7700) {
            style.backgroundPositionX = '0px';
        } else if (bgPos > 0) {
            style.backgroundPositionX = '-7700px';
        } else {
            style.backgroundPositionX = bgPos + 'px';
        }
        
        var timeout = event.timeStamp - _this.timestamp;
        
        _this.timestamp = event.timeStamp;
    };

    this.rotate = function() {
        if (_this.element.className.indexOf('rotated') < 0) {
            _this.element.className += ' rotated';
        } else {
            _this.element.className = _this.element.className.replace('rotated', '');
        }
    };
    
    this.rotateRightDirection = function() {
        if (_this.rightDirection === -1) {
            _this.rightDirection = 1;
        } else {
            _this.rightDirection = -1;
        }
    };

    this.initializeCat = function () {
        $(_this.element).addClass(_this.templateClass);
        $(_this.icon).addClass(_this.iconClass).children().text(_this.name);
    };
    
    this.stopAnimation = function () {
        clearTimeout(_this.animationTimer);
    };
}
