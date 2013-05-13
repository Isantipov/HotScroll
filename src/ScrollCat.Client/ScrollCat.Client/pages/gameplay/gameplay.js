(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define('/pages/gameplay/gameplay.html', {

        time: 0, // ms

        ready: function () {
            var that = this;

            this.time = 0;

            document.querySelector('#mainTheme').setAttribute('data-play', 'true');
            if (!storage.values.muted) {
                document.querySelector('#mainTheme').play();
            }

            WinJS.Application.addEventListener('gameOver', function (args) {
                that._disableWheelEvent();
                clearInterval(that.timerInterval);
                WinJS.Navigation.navigate('/pages/finish/finish.html', {
                    hasWon: args.details,
                    templateClass: game.currentPlayer.templateClass,
                    time: that.time
                });
            });

            this._prepareLevel(game.duel.Level);

            Environment.initialize();

            game.currentPlayer = new Player(game.player.Name, false, game.duel.PlayerTemplate);

            // todo: refactor to receive opponent template from Server. 
            var opponentTemplate = game.duel.PlayerTemplate == 0 ? 1 : 0;
            game.opponentPlayer = new Player(game.opponent.Name, true, opponentTemplate);

            game.currentPlayer.initializeCat();
            game.opponentPlayer.initializeCat();

            game.currentPlayer.butterfly = new Butterfly(game.currentPlayer, game.duel.Level.Events);
            game.opponentPlayer.butterfly = new Butterfly(game.opponentPlayer, game.duel.Level.Events);

            WinJS.Application.addEventListener('play', function () {
                that._startCountdown(3);
            });

            game.readyToPlay();

            WinJS.Application.addEventListener('receiveStep', function (args) {
                var direction = args.detail.Points > game.opponentPlayer.score ? 1 : -1;
                game.opponentPlayer.score = args.detail.Points;
                game.opponentPlayer.butterfly.matchScore(direction);
                game.opponentPlayer.setScore(game.opponentPlayer.score);
                game.opponentPlayer.playAnimation({ timestamp: new Date().getTime() }, direction);
            });

            this._eventProcessor = function (event) {
                var direction = event.wheelDelta < 0 ? 1 : -1;
                var newScore = game.currentPlayer.score;
                if (game.currentPlayer.inertMovement > 0) {
                    newScore--;
                    game.currentPlayer.inertMovement--;
                } else {
                    newScore += game.currentPlayer.rightDirection * direction;
                }
                if (newScore <= game.TOTAL_SCORE && newScore >= 0) {
                    game.currentPlayer.butterfly.matchScore(direction);
                    game.currentPlayer.setScore(newScore);
                    game.currentPlayer.playAnimation(event, direction);
                }
            };
            
            $('#action-menu').click(function () {
                that._disableWheelEvent();
                clearInterval(that.timerInterval);
                WinJS.Navigation.navigate('/pages/login/login.html');
            });
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
            this.time = 0;

            var that = this,
                timeContainer = $('#time');

            timeContainer.text(Utils.formatTime(this.time));

            this.timerInterval = setInterval(function () {
                that.time += 1000;
                timeContainer.text(Utils.formatTime(that.time));
            }, 1000);
        }

    });

})();