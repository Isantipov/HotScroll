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

    var networkInfo = Windows.Networking.Connectivity.NetworkInformation;
    var networkConnectivityInfo = Windows.Networking.Connectivity.NetworkConnectivityLevel;
    
    

    WinJS.Namespace.define("Internet", {
        isConnected: isConnected,
        ifConnected: ifConnected
    });

    function isConnected() {
        var connectionProfile = networkInfo.getInternetConnectionProfile();
        if (connectionProfile === null) {
            return false;
        }

        var networkConnectivityLevel = connectionProfile.getNetworkConnectivityLevel();
        if (networkConnectivityLevel == networkConnectivityLevel.none
            || networkConnectivityLevel == networkConnectivityInfo.localAccess
            || networkConnectivityLevel == networkConnectivityInfo.constrainedInternetAccess) {
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
            
            WinJS.Application.onsettings = function (e) {
                e.detail.applicationcommands = { "privacyPolicy": { title: "Privacy Policy", href: "/pages/settings/privacy.html" } };
                WinJS.UI.SettingsFlyout.populateSettings(e);
            };

            
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

    this._prepareGame = function (args, gamePrepared) {
        var that = this;
        function startGame() {
            args.setPromise(_this._initConnection());
            args.setPromise(_this.connection.start());

            args.setPromise(loadGameData());
            args.setPromise(WinJS.UI.processAll().then(gamePrepared));
        }

        $('#reconnect').click(function (event) {
            that._prepareGame(args, gamePrepared);
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



            if (storage.values.muted) {
                muteButton.addClass('muted');
            }

            muteButton.click(function () {
                $(this).toggleClass('muted');
                storage.values.muted = $(this).hasClass('muted');

                $('audio').each(function () {
                    if (this.paused) {
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
        if (storage.values.PlayerName) {
            _this.setPlayerName(storage.values.PlayerName);
        } else {
            Windows.System.UserProfile.UserInformation.getDisplayNameAsync().done(function (playerName) {
                _this.setPlayerName(playerName);
            });
        }
    }
    
    function proceedToLogin() {
        if (nav.location) {
            nav.history.current.initialPlaceholder = true;
            return nav.navigate(nav.location, nav.state);
        } else {
            return nav.navigate(Application.navigator.home);
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
        this.hub.on('prepare', function (response) {
            app.queueEvent({
                type: 'prepare',
                detail: response
            });
        });

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
                details: response
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
            WinJS.Application.addEventListener('prepare', _this.onDuelPrepare);
            _this.player = player;
            _this.hub.invoke('waitPartner', _this.player);
        });
    };

    this.loginAndJoinDuel = function (login) {
        _this.hub.invoke('changeName', login).done(function (player) {
            WinJS.Application.addEventListener('prepare', _this.onDuelPrepare);
            _this.player = player;
            _this.hub.invoke('joinDuel', _this.duel.Id).done(function(response) {
                if (response) {
                    _this._showError(response, function() {
                        WinJS.Navigation.navigate('/pages/login/login.html');
                    });
                }
            });
        });
    };

    this._showError = function (msg, shownPopup) {
        var md = new Windows.UI.Popups.MessageDialog(msg);
        md.showAsync().then(shownPopup);
    };
    
    this.loginAndWaitFriend = function (login) {
        _this.hub.invoke('changeName', login).done(function (player) {
            WinJS.Application.addEventListener('prepare', _this.onDuelPrepare);
            _this.player = player;
            _this.hub.invoke('createDuel').done(function (duelUrl) {
                if (duelUrl) {
                    _this.duelUrl = duelUrl;
                    Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
                } else {
                    _this._showError("Server can't create private game at the moment. Try restarting the game.");
                }
            });
        });
    };

    this.onDuelPrepare = function (args) {
        WinJS.Application.removeEventListener('prepare', _this.onDuelPrepare);
        var duel = args.detail;
        _this.opponent = duel.Opponents[0];
        _this.duel = duel;
        WinJS.Navigation.navigate('/pages/gameplay/gameplay.html');
    };

    this.readyToPlay = function() {
        _this.hub.invoke('readyToPlay');
    };

    this.loginAndRetryDuel = function(login) {
        _this.hub.invoke('changeName', login).done(function (player) {
            _this.player = player;
            WinJS.Application.addEventListener('prepare', _this.onDuelPrepare);
            _this.hub.invoke('retryDuel', _this.duel.DuelId);
        });
    };
}
