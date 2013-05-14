(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;

    var control = WinJS.UI.Pages.define('/pages/gameplay/gameplay.html', {

        time: 0, // ms

        ready: function () {
            var that = this;

            this.time = 0;

            document.querySelector('#mainTheme').setAttribute('data-play', 'true');
            if (!storage.values.muted) {
                document.querySelector('#mainTheme').play();
            }

            WinJS.Application.addEventListener('gameOver', function (args) { that._onGameOver(args); });

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

            WinJS.Application.addEventListener('play', startCountDown);
            
            function startCountDown() {
                clearTimeout(that.opponentReadyTimeout);
                WinJS.Application.removeEventListener('play', startCountDown);
                that._countdown(3);
            }

            game.readyToPlay();

            WinJS.Application.addEventListener('receiveStep', this._receiveStepHandler);
            
            this._eventProcessor = function (event) {
                game.currentPlayer.stopAnimation();
                var direction = event.wheelDelta < 0 ? 1 : -1;
                var newScore = game.currentPlayer.score;
                if (game.currentPlayer.inertMovement > 0) {
                    newScore--;
                    game.currentPlayer.inertMovement--;
                } else {
                    newScore += game.currentPlayer.rightDirection * direction;
                }
                if (newScore <= game.TOTAL_SCORE && newScore >= 0) {
                    game.currentPlayer.setScore(newScore);
                    game.currentPlayer.butterfly.matchScore(direction);
                    game.currentPlayer.playAnimation(event, direction);
                }
            };

            that._onMenuClik = function() {
                that._disposeGame();
                WinJS.Navigation.navigate('/pages/login/login.html');
            };

            $('#action-menu').show();
            $('#action-menu').click(that._onMenuClik);

            this.opponentReadyTimeout = setTimeout(this._onOpponentNotResponding, 5000);
            
            this._onOpponentNotResponding = function() {
                game._showError("Your opponent has failed to connect!\r\nPlease, try again.");
                that._onMenuClik();
            };
        },

        
        _receiveStepHandler : function(args) {
            var direction = args.detail.Points > game.opponentPlayer.score ? 1 : -1;
            game.opponentPlayer.stopAnimation();
            game.opponentPlayer.setOpponentScore(args.detail.Points);
            game.opponentPlayer.butterfly.matchScore(direction);
            game.opponentPlayer.playAnimation({ timestamp: new Date().getTime() }, direction);
        },
            
        _onGameOver: function(args) {
            var that = this;
            that._disposeGame();
            WinJS.Navigation.navigate('/pages/finish/finish.html', {
                hasWon: args.details,
                templateClass: game.currentPlayer.templateClass,
                time: that.time
            });
        },
        
        _disposeGame: function () {
            $('#action-menu').unbind('click', this._onMenuClik);
            $('#action-menu').hide();
            WinJS.Application.removeEventListener('receiveStep', this._receiveStepHandler);
            WinJS.Application.removeEventListener('gameOver', this._onGameOver);
            this._disableWheelEvent();
            clearInterval(this.timerInterval);
            clearTimeout(this.opponentReadyTimeout);
            game.currentPlayer.stopAnimation();
            game.opponentPlayer.stopAnimation();
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

        _countdown: function (seconds) {
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
                    clearInterval(interval);
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