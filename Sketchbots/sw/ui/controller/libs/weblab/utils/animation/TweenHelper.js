(function() {

    var namespace = WEBLAB.namespace('WEBLAB.utils.animation');


    if (namespace.TweenHelper === undefined) {
        var TweenHelper = function TweenHelper() {}

        namespace.TweenHelper = TweenHelper;

        TweenHelper.linear = TWEEN.Easing.Linear;
        TweenHelper.quad = TWEEN.Easing.Quadratic;
        TweenHelper.cubic = TWEEN.Easing.Cubic;
        TweenHelper.quart = TWEEN.Easing.Quartic;
        TweenHelper.quint = TWEEN.Easing.Quintic;
        TweenHelper.sin = TWEEN.Easing.Sinusoidal;
        TweenHelper.expo = TWEEN.Easing.Exponential;
        TweenHelper.circ = TWEEN.Easing.Circular;
        TweenHelper.elastic = TWEEN.Easing.Elastic;
        TweenHelper.back = TWEEN.Easing.Back;
        TweenHelper.bounce = TWEEN.Easing.Bounce;


        TweenHelper.to = function(what, time, delay, to, ease) {
            ease = ease || this.linear.EaseNone;
            return new TWEEN.Tween(what).to(to, time * 1000).easing(ease).delay(delay * 1000);
        }


        TweenHelper.createGroup = function(onCompleteGroup, onUpdateGroup) {
            return new namespace.TweenGroup(this, onCompleteGroup, onUpdateGroup);
        }

    }

})();
