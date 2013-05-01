(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define('/pages/wait/wait.html', {
        ready: function () {
            var connectionInfo = window.connectionInfo;

            connectionInfo.gameHub.on('play', this._start);
            connectionInfo.gameHub.invoke('waitForPartner', window.users.currentUser);
        },

        _start: function (duel) {
            window.users.opponentUser = duel.Opponent;
            window.duel = duel;

            WinJS.Navigation.navigate('/pages/game/game.html');
        }
    });

})();