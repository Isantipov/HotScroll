(function() {
    'use strict';

    WinJS.UI.Pages.define('/game.html', {
        ready: function () {
            
            window.onload = function () {
                var countdown = document.getElementById('countdown');
                countdown.innerHTML = '3';
                setTimeout(function () {
                    countdown.innerHTML = '2';

                    setTimeout(function () {
                        countdown.innerHTML = '1';

                        setTimeout(function () {
                            countdown.innerHTML = 'Go!';
                        }, 1000);
                    }, 1000);
                }, 1000);
            };
        }
    });
});