function Butterfly(player, events) {

    this.element = document.querySelector('#butterflyContainer');
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

Butterfly.prototype.show = function() {
    this.element.style.visibility = 'visible';
    this.element.style.left = Math.random() * 40 + '%';
};

Butterfly.prototype.hide = function() {
    this.element.style.visibility = 'hidden';
};

Butterfly.prototype.matchScore = function(direction) {
    if (this.currentEvent) {
        if (!this.player.inertMovement && this.player.rightDirection === direction) {
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
            //this.player.inertMovement = 10;
        }
    }
};