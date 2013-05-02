(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define('/pages/game/game.html', {
        ready: function () {
            this._prepareLevel(window.duel.Level);
            this._startCountdown(3);
        },

        _prepareLevel: function (levelData) {
            var track1 = $('#track1 > .parts'),
                track2 = $('#track2 > .parts');

            var html = [];
            for (var i = 0; i < levelData.Background.length; i++) {
                html.push('<div class="track-part track-part_' + levelData.Background[i] + '"></div>');
            }

            track1.html(html.join(''));
            track2.html(html.join(''));
        },

        _startCountdown: function (seconds) {
            var count = seconds,
                that = this;

            $('#countdown').text(count);

            var interval = setInterval(function () {
                count--;
                if (count === 0) {
                    $('#countdown').fadeOut('fast');
                    that._startGame();
                } else {
                    $('#countdown').text(count);
                }
            }, 1000);
        },

        _startGame: function () {

        }
    });

})();