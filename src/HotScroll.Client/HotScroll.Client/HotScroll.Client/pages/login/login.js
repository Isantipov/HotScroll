﻿(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;
    
    WinJS.UI.Pages.define('/pages/login/login.html', {
        ready: function () {

            var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.addEventListener("datarequested", game._onLoginShareDataRequested);

            Windows.System.UserProfile.UserInformation.getDisplayNameAsync().done(function (username) {

                if (storage.values.currentUser) {
                    $('#login').val(storage.values.currentUser.name);
                } else {
                    $('#login').val(username);
                }
                
                $('#loadingIndicator').addClass('hidden');
                setTimeout(function () {
                    $('#loadingIndicator').hide();
                    $('#credentials').show().addClass('visible');
                }, 300);
            });

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

                    var user = storage.values.currentUser;
                    if (!user) {
                        user = new Windows.Storage.ApplicationDataCompositeValue();
                        
                        storage.values.currentUser = user;
                    }
                    user.name = login;
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
            if (!storage.values.helpSeen) {
                $('#help').fadeIn();
                $('#help-close').click(function () {
                    storage.values.helpSeen = 'true';
                    $('#help').fadeOut();
                    callback();
                });
            } else {
                callback();
            }
        }

    });

})();