var Utils = {
    formatTime: function (ticks) {
        var padLeft = function (number) {
            if (number >= 10) {
                return number;
            } else {
                return '0' + number;
            }
        };

        var minutes = Math.floor((ticks / 1000) / 60),
            seconds = ticks / 1000 - minutes * 60;

        return padLeft(minutes) + ':' + padLeft(seconds);
    }
};