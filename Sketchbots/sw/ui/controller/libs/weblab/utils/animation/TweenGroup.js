(function() {

    var namespace = WEBLAB.namespace('WEBLAB.utils.animation');
    var TweenHelper;


    if (namespace.TweenGroup === undefined) {
        namespace.TweenGroup = function(helper, onComplete, onUpdate) {
            TweenHelper = helper;

            this.numSteps = 0;
            this.steps = [];
            this.sequence = [];

            this.onComplete = onComplete || function() {};
            this.onUpdate = onUpdate || function() {};

            // scale overall group durations, ie. .5 will compress all durations & delays to half.
            this.scale = 1;
        }

        var p = namespace.TweenGroup.prototype;


        p.addStep = function(id, what, to, ease, onUpdate, onComplete) {
            this.steps[id] = [what, to, ease, onUpdate, onComplete];
            ++this.numSteps;
        }


        p.logSequence = function() {
            var n = this.sequence.length;
            var msg = '\n\t\tTweenGroup (' + n / 3 + ' steps, scale: ' + this.scale + '):';

            for (var i = 0; i < n; i += 3) {
                msg += '\n\t\t\t>> ' + this.sequence[i] + ',\t' + this.sequence[i + 1] + ',\t' + this.sequence[i + 2];
            }

            console.log(msg);
        }


        p.start = function() {
            var maxLength = 0;

            //construct tweens using TweenHelper
            for (var i = 0, n = this.sequence.length; i < n; i += 3) {
                var s = this.sequence; //  [id, duration, delay... (repeat, i*3)] 
                var g = this.steps[s[i]]; // array of steps [what, to, ease]

                var tween = TweenHelper.to(g[0], s[i + 1] * this.scale, 0, g[1], g[2]);
                if (g[3]) tween.onUpdate(g[3]);
                if (g[4]) tween.onComplete(g[4]);

                // using setTimeout instead of inbuilt delay, as TWEEN sets properties when .start() is called, 
                // so multiple delayed tweens on same prop reset the value after delay. Maddening.
                setTimeout(function(t) {
                    t.start()
                }, (s[i + 2] * 1000) * this.scale, tween);

                maxLength = Math.max(maxLength, s[i + 1] * this.scale + s[i + 2] * this.scale);
            }

            // complete and update for entire group, using dummy tween
            TweenHelper.to({
                tick: 0
            }, maxLength, 0, {
                tick: maxLength
            }).onComplete(this.onComplete).onUpdate(this.onUpdate).start();
        }
    }

})();
