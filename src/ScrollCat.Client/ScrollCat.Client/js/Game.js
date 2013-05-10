function Game () {

    var _this = this;
    
    var HOST_URL = 'http://scrollcat.azurewebsites.net/';
    
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    var storage = Windows.Storage.ApplicationData.current.localSettings;
    
    this.TOTAL_SCORE = 1000;
    
    this.hub = null;
    this.connection = null;
    this.player = null;
    this.opponent = null;
    this.duel = null;
    this.duelUrl = null;

    app.addEventListener("activated", onActivated);
    app.oncheckpoint = onCheckpoint;

    app.start();
    
    function onActivated (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            _this._prepareGame(args, proceedToLogin);
        } else if (args.detail.kind === activation.ActivationKind.protocol) {
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

    this.getHelpShown = function () {
        return storage.values.helpShown || false;
    };

    this.setHelpShown = function (value) {
        storage.values.helpShown = value + '';
    };

    this._prepareGame = function(args, gamePrepared) {

        args.setPromise(_this._initConnection());
        args.setPromise(_this.connection.start().then(null,
            function onConnectionFailed() {
                alert("Can't connect to server at the moment. Application can't work without internet connection, please check your network settings.");
            }));
        args.setPromise(loadGameData());
        args.setPromise(WinJS.UI.processAll().then(proceedToLogin));
    };

    function loadGameData() {
        loadPlayerName();
    }
    
    function loadPlayerName() {
        if (storage.values.PlayerName) {
            _this.setPlayerName(storage.values.PlayerName);
        } else {
            Windows.System.UserProfile.UserInformation.getDisplayNameAsync().done(function (playerName) {
                _this.setPlayerName(playerName);
            });
        }
    }
    
    function proceedToGame () {
        if (nav.location) {
            nav.history.current.initialPlaceholder = true;
            return nav.navigate(nav.location, nav.state);
        } else {
            return nav.navigate(Application.navigator.home);
        }
    }
    
    function proceedToJoin() {
        if (nav.location) {
            nav.history.current.initialPlaceholder = true;
            return nav.navigate(nav.location, nav.state);
        } else {
            return nav.navigate(Application.navigator.join);
        }
    }
    
    function onCheckpoint(args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    }

    this.setPlayerName = function (playerName) {
        if (!this.player) {
            this.player = {};
        }
        this.player.Name = playerName;
        storage.values.PlayerName = playerName;
    };

    this._onLoginShareDataRequested = function (e) {
        if (_this.duelUrl) {
            var request = e.request;
            request.data.properties.title = "Someone invites you to play in Scroll Cat";
            var userName = "Someone";
            if (_this.player && _this.player.Name) {
                userName = _this.player.Name;
            }
            request.data.properties.description = userName + " has just created a Scroll Cat duel and is now waiting for you to join!";
            request.data.setUri(new Windows.Foundation.Uri(_this.duelUrl));
        } else {
            // TODO: add logic to say something when no duel created
        }
    };

    this._initConnection = function (connectedCallBack, failedCallBack) {
        // WinJS environment init
        WinJS.Binding.optimizeBindingReferences = true;

        // signalR init
        this.connection = $.hubConnection(HOST_URL);
        this.hub = this.connection.createHubProxy('gameHub');
        this.hub.on('play', function (response) {
            app.queueEvent({
                type: 'play',
                detail: response
            });
        });

        this.hub.on('receiveStep', function (response) {
            app.queueEvent({
                type: 'receiveStep',
                detail: response
            });
        });

        this.hub.on('gameOver', function (response) {
            app.queueEvent({
                type: 'gameOver',
                detail: response
            });
        });
        
        if (app.sessionState.history) {
            nav.history = app.sessionState.history;
        }
    };

    this.recordStep = function (score) {
        _this.hub.invoke('recordStep', {Points: score});
    };

    this.loginAndWaitRandom = function (login) {
        _this.hub.invoke('changeName', login).done(function (player) {
            WinJS.Application.addEventListener('play', _this.onDuelStart);
            _this.player = player;
            _this.hub.invoke('waitPartner', _this.player);
        });
    };

    this.loginAndJoinDuel = function (login) {
        _this.hub.invoke('changeName', login).done(function (player) {
            WinJS.Application.addEventListener('play', _this.onDuelStart);
            _this.player = player;
            _this.hub.invoke('joinDuel', _this.duel.Id);
        });
    };

    this.loginAndWaitFriend = function (login) {
        _this.hub.invoke('changeName', login).done(function (player) {
            WinJS.Application.addEventListener('play', _this.onDuelStart);
            _this.player = player;
            _this.hub.invoke('createDuel').done(function (duelUrl) {
                if (duelUrl) {
                    _this.duelUrl = duelUrl;
                    Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
                } else {
                    alert("Server can't create private game at the moment. Try restarting the application.");
                }
            });
        });
    };

    this.onDuelStart = function (args) {
        WinJS.Application.removeEventListener('play', _this.onDuelStart);
        var duel = args.detail;
        _this.opponent = duel.Opponents[0];
        _this.duel = duel;

        WinJS.Navigation.navigate('/pages/game/game.html');
    };
}
