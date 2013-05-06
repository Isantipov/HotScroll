(function () {

    'use strict';

    var storage = Windows.Storage.ApplicationData.current.localSettings;

    WinJS.UI.Pages.define('/pages/finish/finish.html', {
        ready: function (options) {
            if (options.hasWon === true) {
                $('h1').text('Congratulations! You win!').addClass('win');
            } else {
                $('h1').text('Looser!').addClass('loose');
            }

            $('.exit').click(this._exit);
            $('.retry').click(this._retry);
        },

        _retry: function () {
            WinJS.Navigation.navigate('/pages/wait/wait.html');
        },

        _exit: function () {
            window.close();
        }
    });

})();