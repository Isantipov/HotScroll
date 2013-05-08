(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define('/pages/wait/wait.html', {
        ready: function () {
            //game.waitRandomGame();
        },
    });

})();