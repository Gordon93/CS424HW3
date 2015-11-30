var WatchValue = (function () {
    function WatchValue() {
        this.cb = new Array();
        this.value = null;
    }
    Object.defineProperty(WatchValue.prototype, "Value", {
        get: function () { return this.value; },
        set: function (value) { this.value = value; this.trigger(); },
        enumerable: true,
        configurable: true
    });
    WatchValue.prototype.watch = function (callback, immediateIfSet) {
        if (immediateIfSet === void 0) { immediateIfSet = false; }
        this.unwatch(callback);
        this.cb.push(callback);
        if (immediateIfSet && this.value)
            callback(this.value);
        return callback;
    };
    WatchValue.prototype.unwatch = function (callback) {
        this.cb = this.cb.filter(function (d) { return d !== callback; });
    };
    WatchValue.prototype.trigger = function () {
        var _this = this;
        this.cb.forEach(function (d) { return d(_this.value); });
    };
    return WatchValue;
})();
var LiteEvent = (function () {
    function LiteEvent() {
        this.handlers = [];
    }
    LiteEvent.prototype.on = function (handler) {
        this.handlers.push(handler);
    };
    LiteEvent.prototype.off = function (handler) {
        this.handlers = this.handlers.filter(function (h) { return h !== handler; });
    };
    LiteEvent.prototype.trigger = function (data) {
        this.handlers.slice(0).forEach(function (h) { return h(data); });
    };
    return LiteEvent;
})();
function capitalizeWords(str) {
    var pieces = str.split(" ");
    for (var i = 0; i < pieces.length; i++) {
        var j = pieces[i].charAt(0).toUpperCase();
        pieces[i] = j + pieces[i].substr(1);
    }
    return pieces.join(" ");
}
var datautil;
(function (datautil) {
    function primaryGenre(gm, genres) {
        var wg = genres.map(function (d) { return ({ name: d.name, weight: gm[d.name] }); });
        wg.sort(function (a, b) { if (a.weight !== b.weight)
            return b.weight - a.weight; return a.name.length - b.name.length; });
        if (wg.length > 0)
            return wg[0].name;
        return "noname";
    }
    datautil.primaryGenre = primaryGenre;
    var rch = Math.random();
    function randomColor() {
        var golden_ratio_conjugate = 0.618033988749895;
        rch = Math.random();
        var hslToRgb = function (h, s, l) {
            var r, g, b;
            if (s == 0) {
                r = g = b = l; // achromatic
            }
            else {
                function hue2rgb(p, q, t) {
                    if (t < 0)
                        t += 1;
                    if (t > 1)
                        t -= 1;
                    if (t < 1 / 6)
                        return p + (q - p) * 6 * t;
                    if (t < 1 / 2)
                        return q;
                    if (t < 2 / 3)
                        return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return '#' + Math.round(r * 255).toString(16) + Math.round(g * 255).toString(16) + Math.round(b * 255).toString(16);
        };
        rch += golden_ratio_conjugate;
        rch %= 1;
        return hslToRgb(rch, 0.5, 0.60);
    }
    datautil.randomColor = randomColor;
    var gcm = {};
    function genreColor(genre) {
        /*
            jazz christmas	   	21	#cc668e
            pop	 				19	 #66abcc
            rock				16	 #c9cc66
            christmas			5	 #b166cc
            filmi				5	 #66cc93
            romantic			5	 #cc7666
            edm					4	 #6674cc
            hurban				4	 #92cc66
            dance pop			3	 #cc66b0
            deep melodic house	3	 #66cccb
            banda				2	 #ccad66
            hip hop				2	 #8f66cc
            mpb					2	 #66cc71
            rockabilly			2	 #cc6678
            adult standards		1	 #6696cc
        */
        return gcm[genre] || (gcm[genre] = randomColor());
        /*adult standards: 1
    australian pop: 1
    banda: 2
    blues: 1
    british invasion: 1
    cabaret: 1
    christmas: 5
    classic rock: 1
    classical piano: 1
    dance pop: 3
    dark hardcore: 1
    deep melodic house: 3
    edm: 4
    filmi: 5
    folk: 1
    folk rock: 1
    hip hop: 2
    honky tonk: 1
    hurban: 4
    indian classical: 1
    indie r&b: 1
    jazz christmas: 21
    liquid funk: 1
    mellow gold: 1
    mpb: 2
    neo mellow: 1
    null: 3
    permanent wave: 1
    pop: 19
    pop christmas: 1
    pop rap: 1
    rock: 16
    rock-and-roll: 1
    rockabilly: 2
    romantic: 5
    soul christmas: 1
    swing: 1
    synthpop: 1
    tango: 1	*/
    }
    datautil.genreColor = genreColor;
})(datautil || (datautil = {}));
//# sourceMappingURL=common.js.map