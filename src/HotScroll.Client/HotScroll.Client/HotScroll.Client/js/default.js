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

                $.connection.connectHub.client.play = function (resp) {
                    window.duel = resp;
                    startCountDown();
                };

                $.connection.hub.url = 'http://localhost:57666/signalr';
                $.connection.hub.start().done(function () {

                    var startButton = document.getElementById('start');
                    startButton.onclick = function () {
                        var login = document.getElementById('login').value;
                        if (login !== '') {
                            $.connection.connectHub.server.connect({ Name: login }).done(function (response) {
                                window.user = response;
                                document.getElementById('loginForm').style.display = 'none';
                                document.getElementById('game-container').style.display = 'block';
                                
                                $.connection.connectHub.server.waitPartner(response);

                            });
                        }
                    };

                });

                var searching = document.querySelector('.searching');

                function startCountDown() {
                    searching.style.display = 'none';

                    var countdown = document.getElementById('countdown');
                    countdown.innerHTML = '3';
                    setTimeout(function () {
                        countdown.innerHTML = '2';

                        setTimeout(function () {
                            countdown.innerHTML = '1';

                            setTimeout(function () {
                                countdown.style.display = 'none';
                                document.getElementById('game').style.display = 'block';

                                initializeGame(new Player(window.user.Name, window.user.Id, true), new Player(window.duel.Oponent.Name, window.duel.Oponent.Id, false));
                            }, 1050);
                        }, 1050);
                    }, 1050);
                }

                function Player(userName, id, current) {
                    this.name = userName;
                    this.id = id;
                    this.points = 0;
                    //this.id;
                    this.element = current ? document.getElementById('currentPlayer') : document.getElementById('opponentPlayer');

                    this.element.querySelector('.player-user-name').innerHTML = this.name;
                }

                Player.prototype.setId = function (id) {
                    this.id = id;
                };

                function initializeGame(currentPlayer, opponentPlayer) {
                    $.connection.connectHub.client.receiveStep = function (resp) {
                        opponentPlayer.points = resp.Points;

                        if (opponentPlayer.points > 0 && opponentPlayer.points < 1000) {
                            opponentPlayer.element.style.left = (opponentPlayer.points / 1000) * 100 + '%';
                        } else if (opponentPlayer.points === 1000) {
                            'ertwer';
                        } else {
                            opponentPlayer.element.style.left = 0;
                        }
                    };

                    window.onmousewheel = function (event) {
                        currentPlayer.points -= event.wheelDelta / 120;

                        $.connection.connectHub.server.recordStep({ Points: currentPlayer.points, UserId: currentPlayer.id });

                        if (currentPlayer.points > 0 && currentPlayer.points < 1000) {
                            currentPlayer.element.style.left = (currentPlayer.points / 1000) * 100 + '%';
                        } else if (currentPlayer.points === 1000) {
                            'ertwer';
                        } else {
                            currentPlayer.element.style.left = 0;
                        }
                    };
                }

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
