var Butterfly = {

    initialize: function (events) {
        this.element = document.querySelector('#butterflyContainer');
        this.events = events;
        this.direction = 1;
    },

    getEvent: function (score) {
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
    },

    matchScore: function (score, player) {
        if (player.event) {
            if (score === player.event.Score + player.event.Duration) {
                if (!player.isOpponent) {
                    this.element.style.visibility = 'hidden';
                    player.element.className = player.element.className.replace('rotated', '');
                    this.direction = 1;
                    player.event = null;
                }
            }
        } else {
            var event = this.getEvent(score);
            if (event) {
                player.event = event;
                this.element.style.visibility = 'visible';
                if (event.Type === 1) {
                    player.element.className += ' rotated';
                    this.direction = -1;
                    if (!player.isOpponent) {
                        this.element.style.left = Math.random() * 40 + '%';
                        this.element.className = '';
                    }
                } else if (event.Type === 2) {
                    player.element.className = player.element.className.replace('rotated', '');
                    this.direction = 1;
                    if (!player.isOpponent) {
                        this.element.style.left = Math.random() * 40 + 60 + '%';
                        this.element.className = 'rotated';
                    }
                }
            }
        }
    }
};
