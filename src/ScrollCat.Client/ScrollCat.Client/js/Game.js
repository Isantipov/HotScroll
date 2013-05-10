function Game() {

    var _this = this;
    
    var HOST_URL = 'http://hotscroll.azurewebsites.net/';
    
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
    
    function onActivated(args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            _this._initConnection();
            args.setPromise(WinJS.UI.processAll().then(loadGame));
        } else if (args.detail.kind === activation.ActivationKind.protocol) {
            var p = args.detail.uri.path.split("-");
            var cmd = p[0];
            switch (cmd) {
                case 'joinduel':
                    if (p.length > 0) {
                        var dueildId = p[1];
                    }
                    break;
            }
        }
    };

    this.getHelpShown = function() {
        return storage.values.helpShown || false;
    };

    this.setHelpShown = function(value) {
        storage.values.helpShown = value + '';
    };
    
    function loadGame() {
        try {
            _this.connection.start().done(function () {
                loadPlayerName(proceedToGame);
            });
        } catch (e) {
            alert("Network connection problems occured. Application requires connection to internet and won't run without it");
        }
    }
    
    function loadPlayerName(afterLoading) {
        if (storage.values.PlayerName) {
            _this.setPlayerName(storage.values.PlayerName);
            afterLoading();
        } else {
            Windows.System.UserProfile.UserInformation.getDisplayNameAsync().done(function (playerName) {
                _this.setPlayerName(playerName);
                afterLoading();
            });
        }
    }
    
    function proceedToGame() {
        if (nav.location) {
            nav.history.current.initialPlaceholder = true;
            return nav.navigate(nav.location, nav.state);
        } else {
            return nav.navigate(Application.navigator.home);
        }
    }
    
    function onCheckpoint(args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

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

    this._initConnection = function() {
        // WinJS environment init
        WinJS.Binding.optimizeBindingReferences = true;

        // signalR init
        this.connection = $.hubConnection(HOST_URL);
        this.hub = this.connection.createHubProxy('gameHub');

        this.hub.on('play', function(response) {
            WinJS.Application.queueEvent({
                type: 'play',
                detail: response
            });
        });

        this.hub.on('receiveStep', function(response) {
            WinJS.Application.queueEvent({
                type: 'receiveStep',
                detail: response
            });
        });

        this.hub.on('gameOver', function(response) {
            WinJS.Application.queueEvent({
                type: 'gameOver',
                detail: response
            });
        });

        if (app.sessionState.history) {
            nav.history = app.sessionState.history;
        }
    };

    this.loginAndWaitRandom = function(login) {
        _this.hub.invoke('changeName', login).done(function (response) {
            WinJS.Application.addEventListener('play', _this.onDuelStart);
            _this.player = response;
            _this.hub.invoke('waitPartner', _this.player);
        });
    };

    this.loginAndWaitFriend = function (login) {
        _this.hub.invoke('connect', { Name: login }).done(function (player) {
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
