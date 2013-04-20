// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    // var account = Windows.System.UserProfile.UserInformation.accountPictureChangeEnabled;



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

            $.get('http://hotscroll.azurewebsites.net/signalr/hubs', function (response) {
                eval(response);

                $.connection.connectHub.client.play = function (resp) {
                    window.duel = resp;
                    startCountDown();
                };

                $.connection.connectHub.client.receiveStep = function (resp) {
                    
                    window.opponentPlayer.points = resp.Points;

                    if (window.opponentPlayer.points > 0 && window.opponentPlayer.points < 1000) {
                        window.opponentPlayer.element.style.left = (window.opponentPlayer.points / 1000) * 100 + '%';
                    } else if (window.opponentPlayer.points >= 1000) {
                        // do nothing
                    } else {
                        window.opponentPlayer.element.style.left = 0;
                    }
                };

                $.connection.connectHub.client.gameOver = function (resp) {
                    document.getElementById('game-container').style.display = 'none';
                    
                    if (resp == true) {
                        document.getElementById('you-won').style.display = 'block';
                    } else {
                        document.getElementById('you-lost').style.display = 'block';
                    }
                };

                $.connection.hub.url = 'http://hotscroll.azurewebsites.net/signalr';
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

                    document.querySelectorAll('.exit-button')[0].onclick = function () {
                        window.close();
                    };
                    document.querySelectorAll('.exit-button')[1].onclick = function () {
                        window.close();
                    };

                    document.querySelectorAll('.retry-button')[0].onclick = function () {
                        document.getElementById('you-won').style.display = 'none';
                        document.getElementById('you-lost').style.display = 'none';

                        document.querySelector('.searching').style.display = 'block';
                        document.getElementById('countdown').style.display = 'block';

                        document.getElementById('game-container').style.display = 'block';
                        document.getElementById('currentPlayer').style.left = '0px';
                        document.getElementById('opponentPlayer').style.left = '0px';


                        $.connection.connectHub.server.waitPartner(window.user);
                    };
                    document.querySelectorAll('.retry-button')[1].onclick = function () {
                        document.getElementById('you-won').style.display = 'none';
                        document.getElementById('you-lost').style.display = 'none';

                        document.querySelector('.searching').style.display = 'block';
                        document.getElementById('countdown').style.display = 'block';

                        document.getElementById('game-container').style.display = 'block';
                        document.getElementById('currentPlayer').style.left = '0px';
                        document.getElementById('opponentPlayer').style.left = '0px';

                        $.connection.connectHub.server.waitPartner(window.user);
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
                                countdown.innerHTML = '';
                                countdown.style.display = 'none';
                                document.getElementById('scrollDirection').style.display = 'block';

                                initializeGame(new Player(window.user.Name, window.user.Id, true), new Player(window.duel.Opponent.Name, window.duel.Opponent.Id, false));
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
                    window.opponentPlayer = opponentPlayer;
                    window.currentPlayer = currentPlayer;
                    window.opponentPlayer.element.style.backgroundPositionX = 0;
                    window.currentPlayer.element.style.backgroundPositionX = 0;

                    var currentIcon = window.currentPlayer.element.querySelector('.player-icon');
                    var opponentIcon = window.opponentPlayer.element.querySelector('.player-icon');
                    opponentIcon.style.backgroundPositionX = '0px';
                    currentIcon.style.backgroundPositionX = '0px';

                    window.legsAnimation = setInterval(function () {
                        var bgPos = parseInt(opponentIcon.style.backgroundPositionX, 10);

                        if (Math.abs(bgPos) >= 676 - 169) {
                            opponentIcon.style.backgroundPositionX = '0px';
                            currentIcon.style.backgroundPositionX = '0px';
                        } else {
                            opponentIcon.style.backgroundPositionX = bgPos - 169 + 'px';
                            currentIcon.style.backgroundPositionX = bgPos - 169 + 'px';
                        }
                    }, 200);

                    window.onmousewheel = function (event) {
                        window.currentPlayer.points -= event.wheelDelta / 120;

                        $.connection.connectHub.server.recordStep({ Points: window.currentPlayer.points, UserId: window.currentPlayer.id });

                        if (window.currentPlayer.points > 0 && window.currentPlayer.points < 1000) {
                            window.currentPlayer.element.style.left = (window.currentPlayer.points / 1000) * 100 + '%';
                        } else if (window.currentPlayer.points >= 1000) {
                            // do nothing
                        } else {
                            window.currentPlayer.element.style.left = 0;
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
