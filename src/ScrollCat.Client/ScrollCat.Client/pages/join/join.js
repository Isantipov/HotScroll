(function () {
    'use strict';

    WinJS.UI.Pages.define('/pages/join/join.html', {
        ready: function () {
            document.querySelector('#mainTheme').play();

            $('#login').val(game.player.Name);
                
            $('#loadingIndicator').addClass('hidden');
            setTimeout(function () {
                $('#loadingIndicator').hide();
                $('#credentials').show().addClass('visible');
            }, 300);

            var that = this;
            $('#play').click(function () {
                that._play();
            });
        },
        _loginAndWait: function(afterLoginCallBack) {
            var login = $('#login').val();
            if (login !== '') {
                this._showHelp(function () {

                    $('.login-container').hide();
                    $('.wait-container').show();
                    
                    game.setPlayerName(login);
                    afterLoginCallBack(login);

                });
            } else {
                $('#validation-message').show();
            }
        },
        _play: function () {
            this._loginAndWait(game.loginAndJoinDuel);
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