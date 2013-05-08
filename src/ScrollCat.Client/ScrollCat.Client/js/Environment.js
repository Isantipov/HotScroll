var Environment = {
    initialize: function () {
        this.mountains = document.querySelector('#mountains');
        this.ground = document.querySelector('#ground');
    },

    move: function (scorePercent) {
        this.mountains.style.backgroundPosition = -scorePercent * 7 + '% 0';
        this.ground.style.backgroundPosition = -scorePercent * 14 + '% 0';
    }
};
