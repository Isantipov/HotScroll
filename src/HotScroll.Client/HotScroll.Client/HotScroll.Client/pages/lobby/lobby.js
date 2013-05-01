(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define('/pages/lobby/lobby.html', {
        ready: function () {
            $('#lobby > img').attr('src', storage.values.currentUser.picture);
            $('#lobby > h2').text('Welcome, ' + storage.values.currentUser.name + '!');

            $('#quick').click(this._quickPlay);
        },

        _quickPlay: function () {
            var connectionInfo = window.connectionInfo;

            connectionInfo.connection.start().done(function () {
                connectionInfo.gameHub.invoke('connect', { Name: storage.values.currentUser.name }).done(function (response) {

                    window.users = {
                        currentUser: response
                    };

                    WinJS.Navigation.navigate('/pages/wait/wait.html');
                });
            });
        }
    });

})();