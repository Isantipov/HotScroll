(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define('/pages/lobby/lobby.html', {
        ready: function () {
            $('#lobby > img').attr('src', storage.values.currentUser.picture);
            $('#lobby > h2').text('Welcome, ' + storage.values.currentUser.name + '!');
        }
    });

})();