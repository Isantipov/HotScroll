var Environment = {
    initialize: function () {
        this.mountains = document.querySelector('#mountains');
        this.ground = document.querySelector('#ground');
        this.bgObjects = document.querySelector('#bg-objects');
        //var bgObjs = game.duel.
    },

    move: function (scorePercent) {
        this.mountains.style.backgroundPosition = -scorePercent * 7 + '% 0';
        this.ground.style.backgroundPosition = -scorePercent * 14 + '% 0';
        this.bgObjects.style.backgroundPosition = -scorePercent * 11 + '% 0';
    }
};
