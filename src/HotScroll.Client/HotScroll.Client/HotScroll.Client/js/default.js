(function (window, $) {
    'use strict';

    var HOST_URL = 'http://hotscroll.azurewebsites.net/',

        app = WinJS.Application,
        activation = Windows.ApplicationModel.Activation,

        appData = {
            currentDuel: null,
            currentPlayer: null,
            opponentPlayer: null,

            animationInterval: null
        };
        
    WinJS.Binding.optimizeBindingReferences = true;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            args.setPromise(WinJS.UI.processAll());

            $.get(HOST_URL + 'signalr/hubs', function (hubs) {
                eval(hubs);

                $.connection.connectHub.client.play = function (resp) {
                    appData.currentDuel = resp;
                    startCountDown();
                };

                $.connection.connectHub.client.receiveStep = function (resp) {
                    appData.opponentPlayer.points = resp.Points;

                    if (appData.opponentPlayer.points > 0 && appData.opponentPlayer.points < 1000) {
                        appData.opponentPlayer.element.style.left = (appData.opponentPlayer.points / 1000) * 100 + '%';
                    } else if (appData.opponentPlayer.points >= 1000) {
                        // do nothing
                    } else {
                        appData.opponentPlayer.element.style.left = 0;
                    }
                };

                $.connection.connectHub.client.gameOver = function (resp) {
                    $('#game-container').hide();

                    clearInterval(appData.animationInterval);
                    window.onmousewheel = null;
                    
                    if (resp == true) {
                        $('#you-won').show();
                    } else {
                        $('#you-lost').show();
                    }
                };

                $.connection.hub.url = HOST_URL + 'signalr';
                $.connection.hub.start().done(function () {
                    Windows.System.UserProfile.UserInformation.getDisplayNameAsync().done(function (username) {
                        $('#login').val(username);
                        $('#loadingIndicator').addClass('hidden');
                        setTimeout(function () {
                            $('#loadingIndicator').hide();
                            $('#credentials').show();
                            $('#credentials').addClass('visible');
                        }, 300);
                    });

                    $('#start').click(function () {
                        var login = $('#login').val();
                        if (login !== '') {
                            $.connection.connectHub.server.connect({ Name: login }).done(function (resp) {
                                appData.currentPlayer = resp;
                                $('#loginForm').hide();
                                $('#game-container').show();

                                $.connection.connectHub.server.waitPartner(resp);
                            });
                        }
                    });

                    $('.exit-button').click(function () {
                        window.close();
                    });
                    $('.retry-button').click(function () {
                        $('#you-won').hide();
                        $('#you-lost').hide();

                        $('.searching').show();
                        $('#countdown').show();

                        $('#game-container').show();
                        $('#currentPlayer').css('left', 0);
                        $('#opponentPlayer').css('left', 0);

                        $.connection.connectHub.server.waitPartner(appData.currentPlayer);
                    });
                });

                function startCountDown() {
                    $('.searching').hide();

                    var countdownSeconds = 3,
                        countdown = $('#countdown').text(countdownSeconds),
                        countdownInterval = setInterval(function () {
                            countdownSeconds--;
                        
                            if (countdownSeconds === 0) {
                                clearInterval(countdownInterval);

                                countdown.text('').hide();
                                $('#scrollDirection').show();

                                initializeGame(new Player(appData.currentPlayer.Name, appData.currentPlayer.Id, true), new Player(appData.currentDuel.Opponent.Name, appData.currentDuel.Opponent.Id, false));
                            } else {
                                countdown.text(countdownSeconds);
                            }
                        }, 1000);
                }

                function Player(userName, id, current) {
                    this.name = userName;
                    this.id = id;
                    this.points = 0;
                    this.element = current ? document.getElementById('currentPlayer') : document.getElementById('opponentPlayer');

                    $('.player-user-name', this.element).text(this.name);
                    $('.player-icon', this.element)[0].style.backgroundPositionX = '0px';
                    this.element.style.backgroundPositionX = '0px';
                }

                function initializeGame(currentPlayer, opponentPlayer) {
                    appData.opponentPlayer = opponentPlayer;
                    appData.currentPlayer = currentPlayer;

                    var currentIcon = $('.player-icon', appData.currentPlayer.element)[0],
                        opponentIcon = $('.player-icon', appData.opponentPlayer.element)[0];

                    appData.animationInterval = setInterval(function () {
                        var bgPos = parseInt(opponentIcon.style.backgroundPositionX, 10);

                        if (Math.abs(bgPos) >= 507) {
                            opponentIcon.style.backgroundPositionX = '0px';
                            currentIcon.style.backgroundPositionX = '0px';
                        } else {
                            var totalX = bgPos - 169;
                            opponentIcon.style.backgroundPositionX = totalX + 'px';
                            currentIcon.style.backgroundPositionX = totalX + 'px';
                        }
                    }, 130);

                    window.onmousewheel = function (event) {
                        appData.currentPlayer.points -= event.wheelDelta / 120;

                        $.connection.connectHub.server.recordStep({ Points: appData.currentPlayer.points, UserId: appData.currentPlayer.id });

                        if (appData.currentPlayer.points > 0 && appData.currentPlayer.points < 1000) {
                            appData.currentPlayer.element.style.left = (appData.currentPlayer.points / 1000) * 100 + '%';
                        } else if (appData.currentPlayer.points >= 1000) {
                            // do nothing
                        } else {
                            appData.currentPlayer.element.style.left = 0;
                        }
                    };
                }
            });
        }
    };

    app.start();

})(this, jQuery);
