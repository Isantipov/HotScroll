(function () {
    'use strict';

    WinJS.UI.Pages.define('/pages/join/join.html', {
        ready: function () {
            document.querySelector('#mainTheme').play();
            var that = this;
            
            $('#login').val(game.player.Name);
            $('#play').click(function () {
                that._play();
            });
        },
        _play: function () {
            var login = $('#login').val();
            if (login !== '') {
                this._showHelp(function () {
                    game.setPlayerName(login);
                    game.loginAndJoinDuel(login);

                });
            } else {
                $('#validation-message').show();
            }
        },
        
        _showHelp: function (callback) {
            if (!game.getHelpShown()) {
                $('#help').fadeIn();
                $('#help-close').click(function () {
                    game.setHelpShown(true);
                    $('#help').fadeOut();
                    callback();
                });
            } else {
                callback();
            }
        }

    });

})();