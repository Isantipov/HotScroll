(function () {

    'use strict';

    WinJS.UI.Pages.define('/pages/game/game.html', {
        ready: function () {
            var that = this;
            document.querySelector('#mainTheme').play();
            WinJS.Application.addEventListener('gameOver', function (args) {
                WinJS.Navigation.navigate('/pages/finish/finish.html', { hasWon: args.details, templateClass: that.currentPlayer.templateClass });
            });

            this._prepareLevel(game.duel.Level);
            Environment.initialize();
            Butterfly.initialize(game.duel.Level.Events);
            this.currentPlayer = new Player(game.player.Name, false, game.duel.PlayerTemplate);

            // todo: refactor to receive opponent template from Server. 
            var opponentTemplate = game.duel.PlayerTemplate == 0 ? 1 : 0;
            game.opponentPlayer = new Player(game.opponent.Name, true, opponentTemplate);

            this.currentPlayer.initializeCat();
            game.opponentPlayer.initializeCat();

            WinJS.Application.addEventListener('play', function() {
                that._startCountdown(3);
            });

            game.readyToPlay();


            WinJS.Application.addEventListener('receiveStep', function (args) {
                var direction = args.detail.Points > game.opponentPlayer.score ? 1 : -1;
                game.opponentPlayer.score = args.detail.Points;
                game.opponentPlayer.setScore(game.opponentPlayer.score);
                game.opponentPlayer.playAnimation({timestamp: new Date().getTime()}, direction);
            });

            this._eventProcessor = function (event) {
                var direction = event.wheelDelta < 0 ? 1 : -1,
                    newScore = that.currentPlayer.score + direction;
                if (newScore <= game.TOTAL_SCORE && newScore >= 0) {
                    that.currentPlayer.setScore(that.currentPlayer.score + direction);
                    that.currentPlayer.playAnimation(event, direction);
                } else if (newScore === game.TOTAL_SCORE) {

                }
            };
        },
        _prepareLevel: function (levelData) {
            var track1 = $('#track1 > .parts'),
                track2 = $('#track2 > .parts');

            var html = [];
            for (var i = 0; i < levelData.Background.length; i++) {
                html.push('<div class="track-part track-part_' + levelData.Background[i] + '"></div>');
            }

            track1.html(html.join(''));
            track2.html(html.join(''));
        },

        _startCountdown: function (seconds) {
            var count = seconds,
                that = this,
                elem = $('#countdown');

            elem.text(count);
            elem.addClass('started');

            var interval = setInterval(function () {
                if (!isNaN(count)) {
                    count--;
                }
                if (count === 'GO!') {
                    elem.remove();
                } else {
                    if (count === 0) {
                        count = 'GO!';
                        that._startGame();
                    }
                    elem.text(count);
                }
            }, 1000);
        },

        _enableWheelEvent: function () {
            document.body.addEventListener('mousewheel', this._eventProcessor);
        },

        _disableWheelEvent: function () {
            document.body.removeEventListener('mousewheel', this._eventProcessor);
        },

        _startGame: function () {
            this._enableWheelEvent();
        }
    });

})();