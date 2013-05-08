(function () {

    'use strict';

    WinJS.UI.Pages.define('/pages/login/login.html', {
        ready: function () {

            var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.addEventListener("datarequested", game._onLoginShareDataRequested);


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
            $('#invite').click(function () {
                that._invite();
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
            this._loginAndWait(game.loginAndWaitRandom);
        },
        
        _invite: function () {
            this._loginAndWait(game.loginAndWaitFriend);
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