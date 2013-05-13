(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;
    
    WinJS.UI.Pages.define('/pages/finish/finish.html', {
        ready: function (element, options) {
            $('#cat').addClass(options.templateClass);

            if (options.hasWon === true) {
                $('#finish-container').addClass('win');
                $('h1').text('You win!');

                document.querySelector('#winEffect').setAttribute('data-play', 'true');
                if (!storage.values.muted) {
                    document.querySelector('#winEffect').play();
                    setTimeout(function () {
                        document.querySelector('#winEffect').play();
                    }, 2500);
                }
            } else {
                $('#finish-container').addClass('lose');
                $('h1').text('You lose!');

                document.querySelector('#looseEffect').setAttribute('data-play', 'true');
                if (!storage.values.muted) {
                    document.querySelector('#looseEffect').play();
                }
            }

            $('#timer').text(Utils.formatTime(options.time));
            $('#menu').click(this._menu);
            $('#retry').click(this._retry);
        },

        _retry: function () {
            WinJS.Navigation.navigate('/pages/login/login.html', {
                retry: true,
            });
        },

        _menu: function () {
            WinJS.Navigation.navigate('/pages/login/login.html');
        }
    });

})();