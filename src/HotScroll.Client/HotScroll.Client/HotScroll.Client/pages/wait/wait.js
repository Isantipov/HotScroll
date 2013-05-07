(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define('/pages/wait/wait.html', {
        ready: function () {
            var that = this;
            WinJS.Application.addEventListener('play', function (args) {
                that._start(args.detail);
            });

            var connectionInfo = game.connectionInfo;
            connectionInfo.gameHub.invoke('waitPartner', window.users.currentUser);
        },

        _start: function (duel) {
            window.users.opponentUser = duel.Opponents[0];
            window.duel = duel;

            WinJS.Navigation.navigate('/pages/game/game.html');
        }
    });

})();