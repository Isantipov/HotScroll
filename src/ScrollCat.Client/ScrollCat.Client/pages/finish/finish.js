(function () {

    'use strict';
    
    WinJS.UI.Pages.define('/pages/finish/finish.html', {
        ready: function (element, options) {
            if (options.hasWon === true) {
                $('#finish-container').addClass('win');
                $('h1').text('You win!');
                $('#winEffect').play();
                setTimeout(function() {
                    $('#winEffect').play();
                }, 2500);
            } else {
                $('#finish-container').addClass('lose');
                $('h1').text('You lose!');
                $('#looseEffect').play();
            }

            $('#menu').click(this._menu);
            $('#retry').click(this._retry);
        },

        _retry: function () {
            WinJS.Navigation.navigate('/pages/wait/wait.html');
        },

        _menu: function () {
            WinJS.Navigation.navigate('/pages/login/login.html');
        }
    });

})();