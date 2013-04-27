(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    app.start();
})();


//(function (window, $) {

//    var HOST_URL = 'http://hotscroll.azurewebsites.net/',

//        app = WinJS.Application,
//        activation = Windows.ApplicationModel.Activation,

//        appData = {
//            currentDuel: null,
//            currentPlayer: null,
//            opponentPlayer: null,

//            animationInterval: null
//        };
        
//    WinJS.Binding.optimizeBindingReferences = true;

//    app.onactivated = function (args) {
//        if (args.detail.kind === activation.ActivationKind.launch) {
//            args.setPromise(WinJS.UI.processAll());

//            var connection = $.hubConnection(HOST_URL),
//                connectHub = connection.createHubProxy('connectHub');

//            connectHub.on('play', function (response) {
//                appData.currentDuel = response;
//                startCountDown();
//            });
//            connectHub.on('receiveStep', function (response) {
//                appData.opponentPlayer.points = response.Points;

//                if (appData.opponentPlayer.points > 0 && appData.opponentPlayer.points < 1000) {
//                    appData.opponentPlayer.element.style.left = (appData.opponentPlayer.points / 1000) * 100 + '%';
//                } else if (appData.opponentPlayer.points >= 1000) {
//                    // do nothing
//                } else {
//                    appData.opponentPlayer.element.style.left = 0;
//                }
//            });
//            connectHub.on('gameOver', function (response) {
//                $('#game-container').hide();

//                clearInterval(appData.animationInterval);
//                window.onmousewheel = null;

//                if (response == true) {
//                    $('#you-won').show();
//                } else {
//                    $('#you-lost').show();
//                }
//            });

//            Windows.System.UserProfile.UserInformation.getDisplayNameAsync().done(function (username) {
//                $('#login').val(username);
//                $('#loadingIndicator').addClass('hidden');
//                setTimeout(function () {
//                    $('#loadingIndicator').hide();
//                    $('#credentials').show();
//                    $('#credentials').addClass('visible');
//                }, 300);
//            });

//            connection.start().done(function () {
//                $('#start').click(function () {
//                    var login = $('#login').val();
//                    if (login !== '') {
//                        connectHub.invoke('connect', { Name: login }).done(function (response) {
//                            appData.currentPlayer = response;
//                            $('#loginForm').hide();
//                            $('#game-container').show();

//                            connectHub.invoke('waitPartner', response);
//                        });
//                    }
//                });

//                $('.exit-button').click(function () {
//                    window.close();
//                });
//                $('.retry-button').click(function () {
//                    $('#you-won').hide();
//                    $('#you-lost').hide();

//                    $('.searching').show();
//                    $('#countdown').show();

//                    $('#game-container').show();
//                    $('#currentPlayer').css('left', 0);
//                    $('#opponentPlayer').css('left', 0);

//                    connectHub.invoke('waitPartner', appData.currentPlayer);
//                });
//            });

//            function startCountDown() {
//                $('.searching').hide();

//                var countdownSeconds = 3,
//                    countdown = $('#countdown').text(countdownSeconds),
//                    countdownInterval = setInterval(function () {
//                        countdownSeconds--;

//                        if (countdownSeconds === 0) {
//                            clearInterval(countdownInterval);

//                            countdown.text('').hide();
//                            $('#scrollDirection').show();

//                            initializeGame(new Player(appData.currentPlayer.Name, appData.currentPlayer.Id, true), new Player(appData.currentDuel.Opponent.Name, appData.currentDuel.Opponent.Id, false));
//                        } else {
//                            countdown.text(countdownSeconds);
//                        }
//                    }, 1000);
//            }

//            function Player(userName, id, current) {
//                this.name = userName;
//                this.id = id;
//                this.points = 0;
//                this.element = current ? document.getElementById('currentPlayer') : document.getElementById('opponentPlayer');

//                $('.player-user-name', this.element).text(this.name);
//                $('.player-icon', this.element)[0].style.backgroundPositionX = '0px';
//                this.element.style.backgroundPositionX = '0px';
//            }

//            function initializeGame(currentPlayer, opponentPlayer) {
//                appData.opponentPlayer = opponentPlayer;
//                appData.currentPlayer = currentPlayer;

//                var currentIcon = $('.player-icon', appData.currentPlayer.element)[0],
//                    opponentIcon = $('.player-icon', appData.opponentPlayer.element)[0];

//                appData.animationInterval = setInterval(function () {
//                    var bgPos = parseInt(opponentIcon.style.backgroundPositionX, 10);

//                    if (Math.abs(bgPos) >= 507) {
//                        opponentIcon.style.backgroundPositionX = '0px';
//                        currentIcon.style.backgroundPositionX = '0px';
//                    } else {
//                        var totalX = bgPos - 169;
//                        opponentIcon.style.backgroundPositionX = totalX + 'px';
//                        currentIcon.style.backgroundPositionX = totalX + 'px';
//                    }
//                }, 130);

//                window.onmousewheel = function (event) {
//                    var sign = event.wheelDelta > 0 ? -1 : 1;
//                    appData.currentPlayer.points += sign;

//                    connectHub.invoke('recordStep', { Points: appData.currentPlayer.points, UserId: appData.currentPlayer.id });

//                    if (appData.currentPlayer.points > 0 && appData.currentPlayer.points < 1000) {
//                        appData.currentPlayer.element.style.left = (appData.currentPlayer.points / 1000) * 100 + '%';
//                    } else if (appData.currentPlayer.points >= 1000) {
//                        // do nothing
//                    } else {
//                        appData.currentPlayer.element.style.left = 0;
//                    }
//                };
//            }
//        }
//    };

//    app.start();

//})(this, jQuery);
