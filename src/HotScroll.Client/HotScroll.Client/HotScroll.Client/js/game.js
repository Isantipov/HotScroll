(function() {
    'use strict';

    WinJS.UI.Pages.define('/game.html', {
        ready: function () {
            
            window.onload = function () {
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
                                
                                initializeGame();
                            }, 1050);
                        }, 1050);
                    }, 1050);
                }

                $.get('http://localhost:57666/signalr/hubs', function (response) {
                    eval(response);
                    $.connection.hub.url = 'http://localhost:57666/signalr';
                    $.connection.hub.start().done(function () {
                        startCountDown();
                    });
                });

            };

            function Player(userName, current) {
                this.name = userName;
                this.points = 0;
                //this.id;
                this.element = current ? document.getElementById('currentPlayer') : document.getElementById('opponentPlayer');
            }

            Player.prototype.setId = function (id) {
                this.id = id;
            };

            var currentPlayer = new Player(localStorage.userName, true);

            function initializeGame() {
                window.onmousewheel = function(event) {
                    currentPlayer.points -= event.wheelDelta;
                    if (currentPlayer.points > 0) {
                        currentPlayer.element.style.left = (currentPlayer.points / 1000) * 100 + '%';
                    } else {
                        currentPlayer.element.style.left = 0;
                    }
                };
            }
        }
    });
})();