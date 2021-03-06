﻿(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define('/pages/login/login.html', {

        ready: function (element, options) {
            document.querySelector('#mainTheme').setAttribute('data-play', 'true');
            if (!storage.values.muted) {
                document.querySelector('#mainTheme').play();
            }

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
            $('#cancel').click(function () {
                that._cancel();
            });
            

            if (options && options.retry == true) {
                that._retry();
            }
        },

        _loginAndWait: function(afterLoginCallBack, text) {
            var login = $('#login').val();
            if (login !== '') {
                this._showHelp(function () {

                    $('#wait > h1').text(text);
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
            this._loginAndWait(game.loginAndWaitRandom, 'Searching for an opponent');
        },
        
        _invite: function () {
            this._loginAndWait(game.loginAndWaitFriend, 'Waiting for an opponent');
        },
        
        _retry: function () {
            this._loginAndWait(game.loginAndRetryDuel, 'Waiting for an opponent');
        },
        
        _cancel: function () {
            game.cancel();
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