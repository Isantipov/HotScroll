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
                if (event.Type === 1) {
                    if (score >= event.Score - event.Duration && score <= event.Score) {
                        out = this.events[index];
                    }
                }
                if (event.Type === 2) {
                    if (score >= event.Score && score <= event.Score + event.Duration) {
                        out = this.events[index];
                    }
                }
            }
        }
        return out;
    },

    matchScore: function (score, player) {
        var event = this.getEvent(score);
        if (player.event !== event) {
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
            } else {
                player.element.className = player.element.className.replace('rotated', '');
                if (!player.isOpponent) {
                    player.event = undefined;
                    this.element.style.visibility = 'hidden';
                    this.direction = 1;
                }
            }
        }
    }

};
