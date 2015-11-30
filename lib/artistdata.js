var artistdata;
(function (artistdata) {
    var Artist = (function () {
        function Artist() {
            this.id = "";
            this.name = "";
            this.hotttnesss = 0;
            this.genres = [];
            this.similar = [];
        }
        return Artist;
    })();
    artistdata.Artist = Artist;
    var artists = new Array();
    function init() {
        d3.json("data/top100.json", function (err, data) {
            var araw = [].concat.apply([], data.map(function (d) { return d.artists; }));
            var ars = araw.map(function (d) {
                var a = new Artist();
                a.id = d.id;
                a.name = d.name;
                a.hotttnesss = +d.hotttnesss;
                a.genres = d.genres.map(function (d) { return d.name; });
                a.location = d.artist_location;
                a.similar = d.similar;
                a.years_active = d.years_active;
                a.year = +d.years_active[0].start;
                return a;
            });
            precalculateGenreWeights(ars);
            suppressChangedEvent = true;
            ars.forEach(function (d) {
                d.genre = primaryGenre(d.genres);
                addArtist(d);
            });
            suppressChangedEvent = false;
            artistdata.artistsChanged.trigger();
        });
    }
    artistdata.init = init;
    var suppressChangedEvent = false;
    artistdata.artistAdded = new LiteEvent();
    artistdata.artistRemoved = new LiteEvent();
    artistdata.artistsChanged = new LiteEvent();
    function addArtist(artist) {
        artists.push(artist);
        artistdata.artistAdded.trigger(artist);
        if (!suppressChangedEvent)
            artistdata.artistsChanged.trigger();
    }
    artistdata.addArtist = addArtist;
    function removeArtist(id) {
        artists = artists.filter(function (d) { return d.id !== id; });
        artistdata.artistRemoved.trigger(id);
        if (!suppressChangedEvent)
            artistdata.artistsChanged.trigger();
    }
    artistdata.removeArtist = removeArtist;
    function getArtists() {
        return artists;
    }
    artistdata.getArtists = getArtists;
    function getGenres() {
        return Object.keys(genreWeights);
    }
    artistdata.getGenres = getGenres;
    function getGenreWeights() {
        return genreWeights;
    }
    artistdata.getGenreWeights = getGenreWeights;
    function fetchArtist(id, result) {
        function createArtist(d) {
            var a = new Artist();
            a.id = d.id;
            a.name = d.name;
            a.hotttnesss = +d.hotttnesss;
            a.genres = d.genres.map(function (d) { return d.name; });
            a.location = d.artist_location;
            a.similar = d.similar || null;
            a.years_active = d.years_active;
            a.year = +(d.years_active[0] || { start: 1900 }).start;
            d.genre = primaryGenre(a.genres);
            return a;
        }
        echonest.Artist.profile({
            id: id,
            bucket: [echonest.Bucket.hotttnesss, echonest.Bucket.genre, echonest.Bucket.years_active, echonest.Bucket.artist_location],
        }, function (d) { return result(createArtist(d.response.artist)); });
    }
    artistdata.fetchArtist = fetchArtist;
    var genreWeights = {};
    function precalculateGenreWeights(ars) {
        var g = {};
        [].concat.apply([], ars.map(function (d) { return d.genres; })).forEach(function (d) { return g[d] = (g[d] || 0) + 1; });
        genreWeights = g;
    }
    function primaryGenre(genres) {
        var wg = genres.map(function (d) { return ({ name: d, weight: genreWeights[d] }); });
        wg.sort(function (a, b) { if (a.weight !== b.weight)
            return b.weight - a.weight; return a.name.length - b.name.length; });
        if (wg.length > 0)
            return wg[0].name;
        return "noname";
    }
    function search(name, callback) {
        echonest.Artist.search({ name: name }, function (d) { return callback(d.response.artists); });
    }
    artistdata.search = search;
})(artistdata || (artistdata = {}));
//# sourceMappingURL=artistdata.js.map