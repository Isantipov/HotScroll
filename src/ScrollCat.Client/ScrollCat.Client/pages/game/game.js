﻿(function () {

    'use strict';

    WinJS.UI.Pages.define('/pages/game/game.html', {
        ready: function () {
            var that = this;
            document.querySelector('#mainTheme').play();
            WinJS.Application.addEventListener('gameOver', function (args) {
                WinJS.Navigation.navigate('/pages/finish/finish.html', { hasWon: args.detail });
            });

            this._prepareLevel(game.duel.Level);
            Environment.initialize();
            this.currentPlayer = new Player(game.player.Name, false);
            game.opponentPlayer = new Player(game.opponent.Name, true);
            this._startCountdown(3);

            WinJS.Application.addEventListener('receiveStep', function (args) {
                game.opponentPlayer.score = args.detail.Points;
                game.opponentPlayer.setScore(game.opponentPlayer.score);
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