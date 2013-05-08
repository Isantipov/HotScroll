(function () {

    'use strict';
    
    WinJS.UI.Pages.define('/pages/finish/finish.html', {
        ready: function (options) {
            if (options.hasWon === true) {
                $('#finish-container').addClass('win');
                $('h1').text('You win!');
            } else {
                $('#finish-container').addClass('lose');
                $('h1').text('You lose!');
            }

            $('#menu').click(this._menu);
            $('#retry').click(this._retry);
        },

        _retry: function () {
            WinJS.Navigation.navigate('/pages/wait/wait.html');
        },

        _menu: function () {
            game.connection.hub.stop();
            WinJS.Navigation.navigate('/pages/login/login.html');
        }
    });

})();