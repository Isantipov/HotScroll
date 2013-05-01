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

            $('#start').click(this._login);
        },

        _login: function () {
            var login = $('#login').val();
            if (login !== '') {
                var user = new Windows.Storage.ApplicationDataCompositeValue();
                user.picture = URL.createObjectURL(accountPicture);
                user.name = login;
                storage.values.currentUser = user;

                WinJS.Navigation.navigate('/pages/lobby/lobby.html');
            }
        }
    });

})();