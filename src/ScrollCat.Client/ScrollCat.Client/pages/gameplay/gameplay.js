(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define('/pages/gameplay/gameplay.html', {

        time: 0, // ms
        gestureObj: null,
        ready: function () {
            var that = this;

            this.time = 0;

            // Setting up  gesture object
            
            var container = document.querySelector('#gameContainer');

            this.gestureObj = new MSGesture();
            this.gestureObj.target = container;
            container.gesture = this.gestureObj;
            container.gesture.pointerType = null;
            
            document.querySelector('#mainTheme').setAttribute('data-play', 'true');
            if (!storage.values.muted) {
                document.querySelector('#mainTheme').play();
            }
            
            this._onGameOver = function (args) {
                that._disposeGame();
                WinJS.Navigation.navigate('/pages/finish/finish.html', {
                    hasWon: args.details,
                    templateClass: game.currentPlayer.templateClass,
                    time: that.time
                });
            };

            WinJS.Application.addEventListener('gameOver', that._onGameOver);

            

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

            this._onOpponentNotResponding = function () {
                game.showError("Your opponent has failed to connect!\r\nPlease, try again.");
                that._onMenuClik();
            };

            this.opponentReadyTimeout = setTimeout(this._onOpponentNotResponding, 5000);

            this.startCountDown = function () {
                clearTimeout(that.opponentReadyTimeout);
                WinJS.Application.removeEventListener('play', this.startCountDown);
                that._countdown(3);
            };

            WinJS.Application.addEventListener('play', this.startCountDown);

            

            game.readyToPlay();

            WinJS.Application.addEventListener('receiveStep', this._receiveStepHandler);
            
            this._onMouseScrollEventProcessor = function (event) {
                game.currentPlayer.stopInertMovement();
                var direction = event.wheelDelta < 0 ? 1 : -1;
                var newScore = game.currentPlayer.score + game.currentPlayer.rightDirection * direction;
                
                game.currentPlayer.move(newScore, direction, event.timeStamp);
            };
            
            this._onPoinerDownEventProcessor = function (e) {
                if (container.gesture.pointerType === null) {                    // First contact
                    container.gesture.addPointer(e.pointerId);                   // Attaches pointer to element (e.target is the element)
                    container.gesture.pointerType = e.pointerType;
                }
                else if (container.gesture.pointerType === e.pointerType) {      // Contacts of similar type
                    container.gesture.addPointer(e.pointerId);                   // Attaches pointer to element (e.target is the element)
                }
            };
            
            this._onGestureChangeEventProcessor = function (e) {
                game.currentPlayer.stopInertMovement();
                var direction = e.translationX < 0 ? 1 : -1;
                var newScore = game.currentPlayer.score + game.currentPlayer.rightDirection * direction;

                game.currentPlayer.move(newScore, direction, e.timeStamp);
            };
            
            this._onGestureEndEventProcessor = function (e) {
                container.gesture.pointerType = null;
            };

            that._onMenuClik = function() {
                that._disposeGame();
                WinJS.Navigation.navigate('/pages/login/login.html');
            };

            $('#action-menu').show();
            $('#action-menu').click(that._onMenuClik);
        },

        _receiveStepHandler : function(args) {
            var direction = args.detail.Points > game.opponentPlayer.score ? 1 : -1;
            game.opponentPlayer.stopInertMovement();
            
            game.opponentPlayer.move(args.detail.Points, direction);
        },
        
        _disposeGame: function () {
            $('#action-menu').unbind('click', this._onMenuClik);
            $('#action-menu').hide();
            WinJS.Application.removeEventListener('receiveStep', this._receiveStepHandler);
            WinJS.Application.removeEventListener('gameOver', this._onGameOver);
            WinJS.Application.removeEventListener('play', this.startCountDown);
            this._disableScrollEvents();
            clearInterval(this.timerInterval);
            clearTimeout(this.opponentReadyTimeout);
            game.currentPlayer.stopInertMovement();
            game.opponentPlayer.stopInertMovement();
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

        _enableScrollEvents: function () {
            document.body.addEventListener('mousewheel', this._onMouseScrollEventProcessor);
            var container = document.querySelector('#gameContainer');
            container.addEventListener("MSPointerDown", this._onPoinerDownEventProcessor, false);
            container.addEventListener("MSGestureChange", this._onGestureChangeEventProcessor, false);
            container.addEventListener("MSGestureChange", this._onGestureEndEventProcessor, false);
        },

        _disableScrollEvents: function () {
            document.body.removeEventListener('mousewheel', this._onMouseScrollEventProcessor);
            var container = document.querySelector('#gameContainer');
            container.removeEventListener("MSPointerDown", this._onPoinerDownEventProcessor);
            container.removeEventListener("MSGestureChange", this._onGestureChangeEventProcessor);
            container.removeEventListener("MSGestureChange", this._onGestureEndEventProcessor);
        },

        _startGame: function () {
            this._enableScrollEvents();
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