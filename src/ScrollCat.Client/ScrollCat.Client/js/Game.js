function Game () {

    /**
     * Private members
    */
    var _this = this;
    
    var HOST_URL = 'http://scrollcat.azurewebsites.net/';
    
    var _app = WinJS.Application;
    var _activation = Windows.ApplicationModel.Activation;
    var _nav = WinJS.Navigation;
    
    var _networkInfo = Windows.Networking.Connectivity.NetworkInformation;
    var _networkConnectivityInfo = Windows.Networking.Connectivity.NetworkConnectivityLevel;
    var _hub = null;
    var _connection = null;
    var _currentDuelUrl = null;
    var _storage = Windows.Storage.ApplicationData.current.localSettings;
    
    /**
     * Public memebers
    */
    this.TOTAL_SCORE = 1000;
    
    
    this.player = null;
    this.opponent = null;
    this.duel = null;

    _app.addEventListener("activated", onActivated);
    _app.oncheckpoint = onCheckpoint;

    WinJS.Namespace.define("Internet", {
        isConnected: isConnected,
        ifConnected: ifConnected
    });

    _app.start();
    
    /*
     * Private methods
    */
    function onActivated (args) {
        if (args.detail.kind === _activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== _activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            
            _app.onsettings = function (e) {
                e.detail.applicationcommands = { "privacyPolicy": { title: "Privacy Policy", href: "/pages/settings/privacy.html" } };
                WinJS.UI.SettingsFlyout.populateSettings(e);
            };
            
            _this._prepareGame(args, proceedToLogin);
            
        } else if (args.detail.kind === _activation.ActivationKind.protocol) {
            var p = args.detail.uri.path.split("/");
            var cmd = p[0];
            switch (cmd) {
                case 'joinduel':
                    if (p.length > 0) {
                        var dueiId = p[1];
                        if (!_this.duel) {
                            _this.duel = {};
                        }
                        _this.duel.Id = dueiId;
                        _this._prepareGame(args, proceedToJoin);
                    }
                    break;
            }
        }
    }
    
    function isConnected() {
        var connectionProfile = _networkInfo.getInternetConnectionProfile();
        if (connectionProfile === null) {
            return false;
        }

        var networkConnectivityLevel = connectionProfile.getNetworkConnectivityLevel();
        if (networkConnectivityLevel == networkConnectivityLevel.none
            || networkConnectivityLevel == _networkConnectivityInfo.localAccess
            || networkConnectivityLevel == _networkConnectivityInfo.constrainedInternetAccess) {
            return false;
        }

        return true;
    }

    function ifConnected(action) {
        if (isConnected()) {
            if (typeof action === 'function') {
                action();
            }
        }
    }

    this._prepareGame = function (args, gamePrepared) {
        function startGame() {
            args.setPromise(_this._initConnection());
            args.setPromise(_connection.start());

            args.setPromise(loadGameData());
            args.setPromise(WinJS.UI.processAll().then(gamePrepared));
        }

        $('#reconnect').click(function (event) {
            _this._prepareGame(args, gamePrepared);
        });

        if (isConnected()) {
            var helpButton = $('#action-help'),
                muteButton = $('#action-mute');


            $('#noInternetConnectionMessage').hide();
            $('#actions').show();


            helpButton.click(function () {
                $('#help').fadeIn();
                $('#help-close').click(function () {
                    _this.setHelpShown(true);
                    $('#help').fadeOut();
                });
            });

            if (_storage.values.muted) {
                muteButton.addClass('muted');
            }

            muteButton.click(function () {
                $(this).toggleClass('muted');
                _storage.values.muted = $(this).hasClass('muted');

                $('audio').each(function () {
                        if (this.paused && $(this).data('play')) {
                        this.play();
                    } else {
                        this.pause();
                    }
                });
            });

            startGame();
        } else {
            $('#noInternetConnectionMessage').show();
        }

    };

    function loadGameData() {
        loadPlayerName();
    }
    
    function loadPlayerName() {
        if (_storage.values.PlayerName) {
            _this.setPlayerName(_storage.values.PlayerName);
        } else {
            Windows.System.UserProfile.UserInformation.getDisplayNameAsync().done(function (playerName) {
                _this.setPlayerName(playerName);
            });
        }
    }
    
    function proceedToLogin() {
        if (_nav.location) {
            _nav.history.current.initialPlaceholder = true;
            return _nav.navigate(_nav.location, _nav.state);
        } else {
            return _nav.navigate(Application.navigator.home);
        }
    }
    
    function proceedToJoin() {
        return WinJS.Navigation.navigate('/pages/join/join.html');
    }
    
    function onCheckpoint(args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        _app.sessionState.history = _nav.history;
    }

    this._onLoginShareDataRequested = function (e) {
        if (_currentDuelUrl) {
            var request = e.request;
            request.data.properties.title = "Someone invites you to play Scroll Cat";
            var userName = "Someone";
            if (_this.player && _this.player.Name) {
                userName = _this.player.Name;
            }
            request.data.properties.description = userName + " has just created a Scroll Cat duel and is now waiting for you to join!";
            request.data.setUri(new Windows.Foundation.Uri(_currentDuelUrl));
        } else {
            // TODO: add logic to say something when no duel created
        }
    };

    this._initConnection = function () {
        // WinJS environment init
        WinJS.Binding.optimizeBindingReferences = true;

        // signalR init
        _connection = $.hubConnection(HOST_URL);
        _hub = _connection.createHubProxy('gameHub');
        _hub.on('prepare', function (response) {
            _app.queueEvent({
                type: 'prepare',
                detail: response
            });
        });

        _hub.on('play', function (response) {
            _app.queueEvent({
                type: 'play',
                detail: response
            });
        });

        _hub.on('receiveStep', function (response) {
            _app.queueEvent({
                type: 'receiveStep',
                detail: response
            });
        });

        _hub.on('gameOver', function (response) {
            _app.queueEvent({
                type: 'gameOver',
                details: response
            });
        });
        
        if (_app.sessionState.history) {
            _nav.history = _app.sessionState.history;
        }
    };


    this.getHelpShown = function () {
        return _storage.values.helpShown || false;
    };

    this.setHelpShown = function (value) {
        _storage.values.helpShown = value + '';
    };

    this.setPlayerName = function (playerName) {
        if (!this.player) {
            this.player = {};
        }
        this.player.Name = playerName;
        _storage.values.PlayerName = playerName;
    };

    Game.prototype.showError = function (msg, shownPopup) {
        var md = new Windows.UI.Popups.MessageDialog(msg);
        md.showAsync().then(shownPopup);
    };

    this.recordStep = function (score) {
        _hub.invoke('recordStep', {Points: score });
    };

    this.loginAndWaitRandom = function (login) {
        _hub.invoke('changeName', login).done(function (player) {
            WinJS.Application.addEventListener('prepare', _this.onDuelPrepare);
            _this.player = player;
            _hub.invoke('waitPartner', _this.player);
        });
    };

    this.loginAndJoinDuel = function (login) {
        _hub.invoke('changeName', login).done(function (player) {
            _app.addEventListener('prepare', _this.onDuelPrepare);
            _this.player = player;
            _hub.invoke('joinDuel', _this.duel.Id).done(function(response) {
                if (response) {
                    _this.showError(response, function() {
                        WinJS.Navigation.navigate('/pages/login/login.html');
                    });
                }
            });
        });
    };
    
    this.loginAndWaitFriend = function (login) {
        _hub.invoke('changeName', login).done(function (player) {
            _app.addEventListener('prepare', _this.onDuelPrepare);
            _this.player = player;
            _hub.invoke('createDuel').done(function (duelUrl) {
                if (duelUrl) {
                    _currentDuelUrl = duelUrl;
                    Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
                } else {
                    _this.showError("Server can't create private game at the moment. Try restarting the game.");
                }
            });
        });
    };

    this.onDuelPrepare = function (args) {
        _app.removeEventListener('prepare', _this.onDuelPrepare);
        var duel = args.detail;
        _this.opponent = duel.Opponents[0];
        _this.duel = duel;
        _nav.navigate('/pages/gameplay/gameplay.html');
    };

    this.readyToPlay = function() {
        _hub.invoke('readyToPlay');
    };

    this.loginAndRetryDuel = function(login) {
        _hub.invoke('changeName', login).done(function (player) {
            _this.player = player;
            _app.addEventListener('prepare', _this.onDuelPrepare);
            _hub.invoke('retryDuel', _this.duel.DuelId);
        });
    };

    this.cancel = function() {
        _app.removeEventListener('prepare', _this.onDuelPrepare);
        _nav.navigate('/pages/login/login.html');
    };
}