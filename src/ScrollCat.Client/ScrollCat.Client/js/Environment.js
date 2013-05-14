var Environment = {
    initialize: function () {
        this.mountains = document.querySelector('#mountains');
        this.ground = document.querySelector('#ground');
        this.bgObjects = document.querySelector('#bg-objects');
        var bgObjs = game.duel.Level.Background;
        for (var i = 0; i < bgObjs.length; i++) {
            var obj = bgObjs[i];
            if (this.bgObjects.querySelector('.bg-' + obj.Code)) {
                var bgElem = this.bgObjects.querySelector('.bg-' + obj.Code).cloneNode(false);
                bgElem.style.left = this.getX(obj.Offset) + "%";
                this.bgObjects.appendChild(bgElem);
            }
        }

        /*var start = this.bgObjects.querySelector('.bg-start').cloneNode(false);
        start.style.left = '1%';
        this.bgObjects.appendChild(start);

        var finish = this.bgObjects.querySelector('.bg-finish').cloneNode(false);
        finish.style.left = '99%';
        this.bgObjects.appendChild(finish);*/
    },

    getX: function (score) {
        return (score / game.TOTAL_SCORE) * 100 * 14;
    },


    
    move: function (scorePercent) {
        this.mountains.style.backgroundPosition = -scorePercent * 7 + '% 0';
        var bgPercent = -scorePercent * 14;
        this.ground.style.backgroundPosition = bgPercent + '% 0';
        this.bgObjects.style.left = (window.innerWidth * (bgPercent / 100) - (bgPercent / 100) * 428) + 'px';
    }
};
