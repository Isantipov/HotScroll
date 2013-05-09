var Environment = {
    initialize: function () {
        this.mountains = document.querySelector('#mountains');
        this.ground = document.querySelector('#ground');
        this.bgObjects = document.querySelector('#bg-objects');
        var bgObjs = game.duel.Level.Background;
        for (var i = 0; i < bgObjs.length; i++) {
            var obj = bgObjs[i];
            var bgElem = this.bgObjects.querySelector('.bg-' + obj.Type).cloneNode();
            bgElem.setAttribute("style", "left:" + this.getX(obj.Offset) + "px;");
            this.bgObjects.appendChild(bgElem);
        }
    },

    getX: function (score) {
        return score * 14;
    },
    
    move: function (scorePercent) {
        this.mountains.style.backgroundPosition = -scorePercent * 7 + '% 0';
        this.ground.style.backgroundPosition = -scorePercent * 14 + '% 0';
        this.bgObjects.style.left = -scorePercent * 14 + '%';
    }
};
