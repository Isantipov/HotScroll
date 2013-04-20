// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());

            $.get('http://localhost:57666/signalr/hubs', function (response) {
                eval(response);
                
                var startButton = document.getElementById('start');
                startButton.onclick = function () {
                    var login = document.getElementById('login').value;
                    if (login !== '') {
                        $.connection.hub.url = 'http://localhost:57666/signalr';
                        $.connection.hub.start().done(function () {
                            $.connection.connectHub.server.connect({ Name: login }).done(function (response) {
                                localStorage.user = response;
                                location.href = '/game.html';
                            });
                        });
                    }
                };
            });

            
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();

})();
