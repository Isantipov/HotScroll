function Butterfly(events) {
    
    this.element = document.querySelector('#butterflyContainer');
    this.events = events;
    this.direction = 1;
    this.currentEvent = null;
}

Butterfly.prototype.getEvent = function(score) {
    var out = null;
    for (var index in this.events) {
        if (this.events.hasOwnProperty(index)) {
            var event = this.events[index];
            if (score === event.Score) {
                out = this.events[index];
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

Butterfly.prototype.matchScore = function(score, player) {
    if (this.currentEvent) {
        if (score === this.currentEvent.Score + this.currentEvent.Duration) {
            this.hide();
            this.direction = 1;

            player.rotate(1);
            this.currentEvent = null;
        }
    } else {
        var event = this.getEvent(score);
        if (event) {
            this.show();
            this.direction = -1;
            
            this.currentEvent = event;
            player.rotate(this.direction);
        }
    }
};