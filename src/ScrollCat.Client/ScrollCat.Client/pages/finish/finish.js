(function () {

    'use strict';
    
    WinJS.UI.Pages.define('/pages/finish/finish.html', {
        ready: function (element, options) {
            if (options.hasWon === true) {
                $('#finish-container').addClass('win');
                $('h1').text('You win!');
                document.querySelector('#winEffect').play();
                setTimeout(function() {
                    document.querySelector('#winEffect').play();
                }, 2500);
            } else {
                $('#finish-container').addClass('lose');
                $('h1').text('You lose!');
                document.querySelector('#looseEffect').play();
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