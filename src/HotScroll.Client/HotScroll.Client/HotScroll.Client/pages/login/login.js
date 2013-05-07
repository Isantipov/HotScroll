(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings,
        accountPicture;
    
    WinJS.UI.Pages.define('/pages/login/login.html', {
        ready: function () {
            $.when(Windows.System.UserProfile.UserInformation.getDisplayNameAsync(), 
                    Windows.System.UserProfile.UserInformation.getAccountPicture(Windows.System.UserProfile.AccountPictureKind.largeImage)).then(function (username, picture) {
                
                accountPicture = picture;

                $('#login').val(username.operation.getResults());
                $('#loadingIndicator').addClass('hidden');
                setTimeout(function () {
                    $('#loadingIndicator').hide();
                    $('#credentials').show().addClass('visible');
                }, 300);
            });

            $('#play').click(this._login);
        },

        _login: function () {
            var login = $('#login').val();
            if (login !== '') {
                var user = new Windows.Storage.ApplicationDataCompositeValue();
                user.picture = URL.createObjectURL(accountPicture);
                user.name = login;
                storage.values.currentUser = user;

                var connectionInfo = window.connectionInfo;

                connectionInfo.connection.start().done(function () {
                    connectionInfo.gameHub.invoke('connect', { Name: login }).done(function (response) {

                        window.users = {
                            currentUser: response
                        };

                        WinJS.Navigation.navigate('/pages/wait/wait.html');
                    });
                });
            } else {
                $('#validation-message').show();
            }
        }
    });

})();