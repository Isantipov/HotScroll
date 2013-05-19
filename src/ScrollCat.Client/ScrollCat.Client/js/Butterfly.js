function Butterfly(player, events) {

    this.element = player.isOpponent ? document.querySelector('.opponentButterfly') : document.querySelector('.playerButterfly');
    this.events = events.slice(0);
    this.direction = 1;
    this.currentEvent = null;
    this.player = player;
}

Butterfly.prototype.tryPopEvent = function(score) {
    var out = null;
    for (var index in this.events) {
        if (this.events.hasOwnProperty(index)) {
            var event = this.events[index];
        if (score >= event.Score) {
                out = this.events[index];
            this.events.splice(index, 1);
            }
        }
    }
    return out;
};

Butterfly.prototype.show = function () {
    if (this.player.isOpponent) {
        // TODO: position butterfly next to opponent
    } else {
        this.element.style.visibility = 'visible';
        this.element.style.left = Math.random() * 40 + '%';
    }
};

Butterfly.prototype.hide = function () {
    if (this.player.isOpponent) {
        // TODO: position butterfly next to opponent
    } else {
        $(this.element).animate({ left: '-=40%' }, 1200, function() {
            this.style.visibility = 'hidden';
        });
    }
};

Butterfly.prototype.matchScore = function(direction) {
    if (this.currentEvent) {
        if (this.player.rightDirection === direction) {
            // turn the player to the right
            this.hide();
            this.direction = 1;
            this.player.rotate();
            this.currentEvent = null;
            }
        } else {
        if ((this.currentEvent = this.tryPopEvent(this.player.score))) {
            // turn the player to the left
            this.show();
            this.direction = -1;
            this.player.rotate();
            this.player.rotateRightDirection();
        }
    }
};