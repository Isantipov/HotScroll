(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;
    
    WinJS.UI.Pages.define('/pages/login/login.html', {
        ready: function () {
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
                that._login();
            });
        },

        _login: function () {
            var login = $('#login').val();
            if (login !== '') {
                this._showHelp(function () {
                    var user = new Windows.Storage.ApplicationDataCompositeValue();
                    user.name = login;
                    storage.values.currentUser = user;

                    game.connection.start().done(function () {
                        game.hub.invoke('connect', { Name: login }).done(function (response) {

                            window.users = {
                                currentUser: response
                            };

                            WinJS.Navigation.navigate('/pages/wait/wait.html');
                        });
                    });
                });
            } else {
                $('#validation-message').show();
            }
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