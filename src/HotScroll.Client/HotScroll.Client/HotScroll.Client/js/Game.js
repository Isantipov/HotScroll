function Game() {

    var _this = this;
    
    var HOST_URL = 'http://hotscroll.azurewebsites.net/';
    
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    
    this.TOTAL_SCORE = 1000;
    this.connectionInfo = null;

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
            args.setPromise(WinJS.UI.processAll().then(function() {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
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
    
    function onCheckpoint(args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    this._initConnection = function() {
        // WinJS environment init
        WinJS.Binding.optimizeBindingReferences = true;

        // signalR init
        var connection = $.hubConnection(HOST_URL),
            gameHub = connection.createHubProxy('gameHub');

        gameHub.on('play', function(response) {
            WinJS.Application.queueEvent({
                type: 'play',
                detail: response
            });
        });

        gameHub.on('receiveStep', function(response) {
            WinJS.Application.queueEvent({
                type: 'receiveStep',
                detail: response
            });
        });

        gameHub.on('gameOver', function(response) {
            WinJS.Application.queueEvent({
                type: 'gameOver',
                detail: response
            });
        });

        this.connectionInfo = {
            connection: connection,
            gameHub: gameHub
        };

        if (app.sessionState.history) {
            nav.history = app.sessionState.history;
        }
    };
}
